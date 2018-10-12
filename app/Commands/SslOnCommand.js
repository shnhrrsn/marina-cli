import 'App/Commands/BaseCommand'

import 'App/Installers/CaddyInstaller'
import 'App/Support/Site'

import { FS } from 'grind-support'
import { AbortError } from 'grind-cli'

const selfsigned = require('selfsigned')
const forge = require('node-forge')

export class SslOnCommand extends BaseCommand {

	name = 'ssl:on'
	description = 'Turn support for ssl on'

	async run() {
		const { stdout: version } = await this.execFile(this.app.paths.home('caddy'), [ '--version' ])
		const [ , major, minor ] = version.match(/\s(\d+)\.(\d+)/)

		if(Number(major) < 1 && Number(minor) < 11) {
			throw new AbortError('The version of caddy installed is too old.\nRun `sudo marina update` before continuing.')
		}

		const paths = {
			private: this.app.paths.certs('marina.key'),
			public: this.app.paths.certs('marina.pub'),
			cert: this.app.paths.certs('marina.crt'),
			p12: this.app.paths.certs('marina.p12')
		}

		if(await FS.exists(paths.cert)) {
			throw new AbortError('It looks like ssl has previously been turned on.\nPlease run `marina ssl:off` before proceeding.')
		}

		if(!(await this.confirm('This will rewrite your Caddyfiles, do you want to proceed?'))) {
			return process.exit(1)
		}

		await FS.mkdirs(this.app.paths.certs())

		Log.comment('Generating certificates')
		const out = selfsigned.generate([
			{ name: 'commonName', value: `*.${this.app.settings.$tld}` },
			{ name: 'countryName', value: 'US' },
			{ name: 'stateOrProvinceName', value: 'NY' },
			{ name: 'localityName', value: 'New York' },
			{ name: 'organizationName', value: 'marina-cli' },
			{ name: 'organizationalUnitName', value: 'marina-cli' }
		], {
			algorithm: 'sha256',
			days: 365 * 30
		})

		const cert = forge.pki.certificateFromPem(out.cert)
		const priv = forge.pki.privateKeyFromPem(out.private)

		const p12 = forge.pkcs12.toPkcs12Asn1(priv, cert, 'marina', {
			algorithm: '3des'
		})

		const p12Der = forge.asn1.toDer(p12).getBytes()

		await Promise.all([
			FS.writeFile(paths.private, out.private),
			FS.writeFile(paths.public, out.public),
			FS.writeFile(paths.cert, out.cert),
			FS.writeFile(paths.p12, p12Der, { encoding: 'binary' }),
		])

		Log.comment('Installing certificate to keychain')
		await this.execFile('security', [
			'import',
			paths.p12,
			'-k', this.app.paths.home('../Library/Keychains/login.keychain'),
			'-P', 'marina'
		])
		await this.execFile('security', [
			'add-trusted-cert',
			'-r', 'trustRoot',
			'-k', this.app.paths.home('../Library/Keychains/login.keychain'),
			paths.cert
		])

		Log.comment('Configuring Caddy')
		const Caddyfile = {
			source: this.app.paths.resources('config/ssl.caddyfile'),
			destination: this.app.paths.certs('ssl.conf')
		}
		await this.execAsUser(`cp "${Caddyfile.source}" "${Caddyfile.destination}"`)

		this.app.settings.ssl = true
		await this.app.settings.save()

		await Site.forEach(this.app, (file, site) => {
			Log.comment('Updating', site.fqdn)
			return site.save()
		})

		Log.comment('Restarting Caddy')
		await (new CaddyInstaller).restart()

		Log.success('Done')
	}

}

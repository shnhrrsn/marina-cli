import 'App/Commands/BaseCommand'

import 'App/Installers/CaddyInstaller'
import 'App/Support/Site'

import { FS } from 'grind-support'
import { InputArgument, AbortError } from 'grind-cli'

const selfsigned = require('selfsigned')
const forge = require('node-forge')

export class SslCommand extends BaseCommand {

	name = 'ssl'
	description = 'Turn support for ssl on or off'
	paths

	arguments = [ new InputArgument('option', InputArgument.VALUE_REQUIRED, 'Turn SSL “on” or ”off”`') ]

	async ready() {
		this.paths = {
			private: this.app.paths.certs('marina.key'),
			public: this.app.paths.certs('marina.pub'),
			cert: this.app.paths.certs('marina.crt'),
			p12: this.app.paths.certs('marina.p12')
		}

		return super.ready()
	}

	async run() {
		const option = this.argument('option').toLowerCase()

		if(option !== 'on' && option !== 'off') {
			throw new AbortError('The only valid argument is “on” or “off”.')
		}

		if(!(await this.confirm('This will rewrite your Caddyfiles, do you want to proceed?'))) {
			return process.exit(1)
		}

		if(option === 'on') {
			await this._on()
		} else {
			await this._off()
		}

		this.app.settings.ssl = option === 'on'
		await this.app.settings.save()

		await Site.forEach(this.app, (file, site) => {
			Log.comment('Updating', site.fqdn)
			return site.save()
		})

		Log.comment('Restarting Caddy')
		await (new CaddyInstaller).restart()

		Log.success('Done')
	}

	async _on() {
		const { stdout: version } = await this.execFile(this.app.paths.home('caddy'), [ '--version' ])
		const [ , major, minor ] = version.match(/\s(\d+)\.(\d+)/)

		if(Number(major) < 1 && Number(minor) < 11) {
			throw new AbortError('The version of caddy installed is too old.\nRun `sudo marina update` before continuing.')
		}

		if(await FS.exists(this.paths.cert)) {
			throw new AbortError('It looks like ssl has previously been turned on.\nPlease run `marina ssl off` before proceeding.')
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
			FS.writeFile(this.paths.private, out.private),
			FS.writeFile(this.paths.public, out.public),
			FS.writeFile(this.paths.cert, out.cert),
			FS.writeFile(this.paths.p12, p12Der, { encoding: 'binary' }),
		])

		Log.comment('Installing certificate to keychain')
		await this.execFile('security', [
			'import',
			this.paths.p12,
			'-k', this.app.paths.home('../Library/Keychains/login.keychain'),
			'-P', 'marina'
		])
		await this.execFile('security', [
			'add-trusted-cert',
			'-r', 'trustRoot',
			'-k', this.app.paths.home('../Library/Keychains/login.keychain'),
			this.paths.cert
		])

		Log.comment('Configuring Caddy')
		const Caddyfile = {
			source: this.app.paths.resources('config/ssl.caddyfile'),
			destination: this.app.paths.certs('ssl.conf')
		}
		await this.execAsUser(`cp "${Caddyfile.source}" "${Caddyfile.destination}"`)
	}

	async _off() {
		if(await FS.exists(this.paths.cert)) {
			Log.comment('Uninstalling certificate from keychain')
			const cert = forge.pki.certificateFromPem(await FS.readFile(this.paths.cert))
			const der = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes()
			const m = forge.md.sha1.create()
			m.start()
			m.update(der)

			const fingerprint = m.digest().toHex().match(/.{2}/g).join('').toUpperCase()

			try {
				await this.execFile('security', [
					'delete-certificate', '-t',
					'-Z', fingerprint
				])
			} catch(_) {
				Log.error('Unable to remove certificate from keychain, this likely means it wasn’t there to begin with.')
			}
		}

		Log.comment('Removing certificates')
		await this.execFile('rm', [ '-fr', this.app.paths.certs() ])
	}

}

import 'App/Commands/BaseCommand'

import 'App/Installers/CaddyInstaller'
import 'App/Support/Site'

import { FS } from 'grind-support'

const forge = require('node-forge')

export class SslOffCommand extends BaseCommand {

	name = 'ssl:off'
	description = 'Turn support for ssl off'

	async run() {
		if(!(await this.confirm('This will rewrite your Caddyfiles, do you want to proceed?'))) {
			return process.exit(1)
		}

		const cert = this.app.paths.certs('marina.crt')

		if(await FS.exists(cert)) {
			Log.comment('Uninstalling certificate from keychain')
			const cert = forge.pki.certificateFromPem(await FS.readFile(this.app.paths.certs('marina.crt')))
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

		this.app.settings.ssl = false
		await this.app.settings.save()

		await Site.forEach(this.app, (file, site) => {
			Log.comment('Updating', site.fqdn)
			return site.save()
		})

		Log.comment('Restarting Caddy')
		await (new CaddyInstaller).stop()

		Log.success('Done')
	}

}

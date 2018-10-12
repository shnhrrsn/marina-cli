import 'App/Commands/BaseCommand'

import 'App/Installers/CaddyInstaller'
import 'App/Installers/DnsmasqInstaller'

import { FS } from 'grind-support'
import { InputArgument } from 'grind-cli'

export class DomainCommand extends BaseCommand {

	name = 'domain'
	description = 'Change the domain TLD'
	wantsSudo = true

	arguments = [ ]

	constructor(...args) {
		super(...args)

		this.arguments.push(new InputArgument(
			'tld',
			InputArgument.VALUE_REQUIRED,
			'The name of the new tld',
			this.app.settings.$tld
		))
	}

	async run() {
		const tld = this.argument('tld').toLowerCase()
		const old = this.app.settings.$tld

		if(tld === old) {
			this.comment(`The TLD is already set to ${tld}.`)
			return
		}

		this.comment('Removing previous TLD')
		const dnsmasq = new DnsmasqInstaller(this.app)
		await Promise.all([
			dnsmasq.removeFile(dnsmasq.resolverPath),
			dnsmasq.removeFile(dnsmasq.localConfigPath)
		])

		this.comment('Setting up new TLD')
		this.app.settings.tld = tld
		await this.app.settings.save()

		await dnsmasq.setupConfig()

		const caddy = new CaddyInstaller(this.app)
		this.comment('Updating existing hosts')
		const stripTldPattern = new RegExp(`\\.${old}$`)

		await caddy.forEachHost(async(file, { domain, proxy }) => {
			const newDomain = `${domain.replace(stripTldPattern, '')}.${tld}`

			this.comment(`Renaming ${domain} to ${newDomain}`)
			const content = await this.app.view.render('Caddyfile', { domain: newDomain, proxy })
			const newFile = this.app.paths.hosts(`${newDomain}.conf`)
			await FS.writeFile(newFile, content)
			await FS.chown(newFile, Number(process.env.SUDO_UID), Number(process.env.SUDO_GID))

			await FS.unlink(this.app.paths.hosts(file))
		})

		this.comment('Restarting', caddy.constructor.name)
		await caddy.restart()

		this.comment('Restarting', dnsmasq.constructor.name)
		await dnsmasq.restart()

		this.success('Done')
	}

}

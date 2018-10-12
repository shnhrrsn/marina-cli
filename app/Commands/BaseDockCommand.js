import 'App/Commands/BaseCommand'

import 'App/Errors/NonexistentDomainError'
import 'App/Installers/CaddyInstaller'
import 'App/Support/Site'

import { FS } from 'grind-support'
import { AbortError } from 'grind-cli'

const path = require('path')

export class BaseDockCommand extends BaseCommand {

	domainPrompt = 'What should the domain be for this project?'
	requiresExistence = true
	site
	savedDomain
	caddy

	async ready() {
		this.savePath = path.join(process.cwd(), '.marina.json')

		this.site = null

		if(await FS.exists(this.savePath)) {
			try {
				this.site = new Site(this.app, JSON.parse(await FS.readFile(this.savePath)))
				this.savedDomain = this.site.domain
			} catch(err) {
				throw new AbortError('An existing config file as found in this directory, however it’s invalid.')
			}
		}

		const options = { }

		if(this.containsOption('domain')) {
			options.domain = this.option('domain').toLowerCase()

			if(options.domain.indexOf(',') >= 0) {
				const domains = options.domain.split(/,/).map(domain => domain.trim())
				options.domain = domains.shift()
				options.aliases = domains
			}
		}

		if(options.domain.isNil && this.site.isNil) {
			options.domain = await this.ask(this.domainPrompt)
		}

		if(this.site.isNil) {
			this.site = new Site(this.app, options)
		} else {
			this.site.update(options)
		}

		if(this.requiresExistence && !(await FS.exists(this.site.configPath))) {
			throw new NonexistentDomainError(this.site)
		}

		this.caddy = new CaddyInstaller(this.app)

		return super.ready()
	}

}

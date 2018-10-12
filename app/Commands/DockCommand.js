import 'App/Commands/BaseDockCommand'

import { InputOption, AbortError } from 'grind-cli'
import { FS } from 'grind-support'

export class DockCommand extends BaseDockCommand {

	name = 'dock'
	description = 'Register a project with Marina'
	requiresExistence = false

	options = [
		new InputOption('domain', InputOption.VALUE_OPTIONAL, 'Domain'),
		new InputOption('source', InputOption.VALUE_OPTIONAL, 'Source host'),
		new InputOption('save', InputOption.VALUE_NONE, 'Save to .marina.json file for seamless referencing later.')
	]

	async run() {
		if(await FS.exists(this.site.configPath) && this.savedDomain !== this.site.domain) {
			throw new AbortError('This domain already exists.')
		}

		if(this.site.source.isNil) {
			this.site.source = await this.ask('What is the source host for this project?')
		}

		this.site.source = this.site.source.replace(/^(.+?):\/\//, '').split('/')[0]

		await this.site.save()

		if(this.option('save') === true || !this.savedDomain.isNil) {
			await FS.writeFile(this.savePath, JSON.stringify(this.site, null, 2))
		}

		this.comment('Restarting')
		await this.caddy.restart()

		this.success('--> Done')
		this.success(`--> http://${this.site.fqdn}`)

		for(const alias of this.site.fqAliases) {
			this.success(`--> http://${alias}`)
		}
	}

}

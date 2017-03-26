import 'App/Commands/BaseDockCommand'

import { InputOption } from 'grind-cli'
import { FS } from 'grind-support'

export class DockCommand extends BaseDockCommand {
	name = 'dock'
	description = 'Register a project with Marina'

	options = [
		new InputOption('domain', InputOption.VALUE_OPTIONAL, 'Domain'),
		new InputOption('source', InputOption.VALUE_OPTIONAL, 'Source host'),
		new InputOption('save', InputOption.VALUE_NONE, 'Save to .marina.json file for seamless referencing later.')
	]

	async run() {
		if(await FS.exists(this.configPath) && this.saved.domain !== this.domain) {
			this.error('--> This domain already exists.')
			process.exit(1)
		}

		let proxy = this.option('source') || this.saved.source

		if(proxy.isNil) {
			proxy = await this.ask('What is the source host for this project?')
		}

		proxy = proxy.replace(/^(.+?):\/\//, '').split('/')[0]

		const content = await this.app.view.render('Caddyfile', {
			domain: this.domain,
			proxy: proxy
		})

		await FS.writeFile(this.configPath, content)

		if(this.option('save') === true || !this.saved.domain.isNil) {
			await FS.writeFile(this.savePath, JSON.stringify({
				domain: this.domain,
				source: proxy
			}, null, '  '))
		}

		this.comment('Restarting')
		await this.caddy.restart()

		this.success('--> Done')
		this.success(`--> http://${this.domain}`)
	}

}

import 'App/Commands/BaseDockCommand'
import 'App/Support/FS'

export class DockCommand extends BaseDockCommand {
	name = 'dock'
	description = 'Register the a project with Marina'
	options = {
		domain: [ 'Domain', 'string' ],
		source: [ 'Source host', 'string' ],
		save: 'Save to .marina.json file for seamless referencing later.'
	}

	async run() {
		const exists = await FS.exists(this.configPath)

		if(exists && this.saved.domain !== this.domain) {
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
	}

}

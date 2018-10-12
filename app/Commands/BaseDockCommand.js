import 'App/Commands/BaseCommand'
import 'App/Installers/CaddyInstaller'

import { FS } from 'grind-support'
const path = require('path')

export class BaseDockCommand extends BaseCommand {

	domainPrompt = 'What should the domain be for this project?'
	savePath = null
	saved = null
	domain = null
	configPath = null
	caddy = null

	async ready() {
		this.savePath = path.join(process.env.ORIGINAL_WD, '.marina.json')
		this.saved = await FS.exists(this.savePath).then(exists => exists ? require(this.savePath) : { })
		this.domain = this.option('domain') || this.saved.domain

		if(this.domain.isNil) {
			this.domain = await this.ask(this.domainPrompt)
		}

		this.domain = `${this.domain.toLowerCase().replace(/\.localhost$/g, '')}.localhost`
		this.configPath = this.app.paths.hosts(`${this.domain}.conf`)

		this.caddy = new CaddyInstaller(this.app)

		return this._superReady()
	}

	_superReady() {
		return super.ready()
	}

}

import 'App/Commands/BaseDockCommand'

import { FS } from 'grind-support'
import { InputOption } from 'grind-cli'

export class UndockCommand extends BaseDockCommand {

	name = 'undock'
	description = 'Unregister a project with Marina'
	domainPrompt = 'What domain do you want to unregister?'

	options = [
		new InputOption('domain', InputOption.VALUE_OPTIONAL, 'Domain'),
		new InputOption('source', InputOption.VALUE_OPTIONAL, 'Source host'),
		new InputOption('save', InputOption.VALUE_NONE, 'Remove existing .marina.json file.')
	]

	async run() {
		await FS.unlink(this.site.configPath)

		this.comment('Restarting')
		await this.caddy.restart()

		if(this.option('save') === true && this.savedDomain === this.site.domain) {
			await FS.unlink(this.savePath)
		}

		this.success('--> Done')
	}

}

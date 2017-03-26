import 'App/Commands/BaseDockCommand'

import { FS } from 'grind-support'
import { InputOption } from 'grind-cli'

export class UndockCommand extends BaseDockCommand {
	name = 'undock'
	description = 'Unregister the a project with Marina'
	domainPrompt = 'What domain do you want to unregister?'

	options = [
		new InputOption('domain', InputOption.VALUE_OPTIONAL, 'Domain'),
		new InputOption('source', InputOption.VALUE_OPTIONAL, 'Source host'),
		new InputOption('save', InputOption.VALUE_NONE, 'Remove existing .marina.json file.')
	]

	async run() {
		if(!(await FS.exists(this.configPath))) {
			this.error('--> This domain does not exist.')
			process.exit(1)
		}

		await FS.unlink(this.configPath)

		this.comment('Restarting')
		await this.caddy.restart()

		if(this.option('save') === true && this.saved.domain === this.domain) {
			await FS.unlink(this.savePath)
		}

		this.success('--> Done')
	}

}

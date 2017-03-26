import 'App/Commands/BaseDockCommand'

import { FS } from 'grind-support'
import { InputOption } from 'grind-cli'

export class OpenCommand extends BaseDockCommand {
	name = 'open'
	description = 'Opens a Marina project in the browser.'
	domainPrompt = 'What domain do you want to open?'

	options = [
		new InputOption('domain', InputOption.VALUE_OPTIONAL, 'Domain'),
	]

	async run() {
		if(!(await FS.exists(this.configPath))) {
			this.error('--> This domain does not exist.')
			process.exit(1)
		}

		return this.exec(`open "http://${this.domain}"`)
	}

}

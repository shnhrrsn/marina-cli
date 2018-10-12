import 'App/Commands/BaseDockCommand'

import { InputOption } from 'grind-cli'

export class OpenCommand extends BaseDockCommand {

	name = 'open'
	description = 'Opens a Marina project in the browser.'
	domainPrompt = 'What domain do you want to open?'

	options = [
		new InputOption('domain', InputOption.VALUE_OPTIONAL, 'Domain'),
	]

	async run() {
		return this.exec(`open "http://${this.site.fqdn}"`)
	}

}

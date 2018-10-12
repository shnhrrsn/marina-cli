import 'App/Commands/BaseDockCommand'

import { InputOption } from 'grind-cli'

const ChildProcess = require('child-process-promise')

export class ShareCommand extends BaseDockCommand {

	name = 'share'
	description = 'Generate a shareable URL for a project.'
	domainPrompt = 'What domain do you want to share?'

	options = [
		new InputOption('domain', InputOption.VALUE_OPTIONAL, 'Domain')
	]

	async run() {
		return ChildProcess.spawn(this.app.paths.home('ngrok'), [ 'http', this.site.source ], {
			stdio: 'inherit'
		})
	}

}

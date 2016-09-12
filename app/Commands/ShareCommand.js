import 'App/Commands/BaseDockCommand'
import 'App/Support/FS'

import ChildProcess from 'child-process-promise'

export class ShareCommand extends BaseDockCommand {
	name = 'share'
	description = 'Generate a shareable URL for a project.'
	domainPrompt = 'What domain do you want to share?'
	options = {
		domain: [ 'Domain', 'string' ],
	}

	async run() {
		const exists = await FS.exists(this.configPath)

		if(!exists) {
			this.error('--> This domain does not exist.')
			process.exit(1)
		}

		const config = await FS.readFile(this.configPath).then(contents => contents.toString())
		const proxy = ((config.match(/#proxy:(.+?)$/m) || [ ])[1] || '').trim()

		if(proxy.length === 0) {
			this.error('--> Invalid config.')
			process.exit(1)
		}

		return ChildProcess.spawn(this.app.paths.home('ngrok'), [ 'http', proxy ], {
			stdio: 'inherit'
		})
	}

}

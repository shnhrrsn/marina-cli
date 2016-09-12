import 'App/Commands/BaseDockCommand'
import 'App/Support/FS'

export class UndockCommand extends BaseDockCommand {
	name = 'undock'
	description = 'Unregister the a project with Marina'
	domainPrompt = 'What domain do you want to unregister?'
	options = {
		domain: [ 'Domain', 'string' ],
		save: 'Remove existing .marina.json file.'
	}

	async run() {
		const exists = await FS.exists(this.configPath)

		if(!exists) {
			this.error('--> This domain does not exist.')
			process.exit(1)
		}

		await FS.unlink(this.configPath)

		this.comment('Restarting')
		await this.caddy.restart()

		if(this.option('save') === true && this.saved.domain === this.domain) {
			await FS.unlink(this.savePath)
		}

		this.success('Done')
	}

}

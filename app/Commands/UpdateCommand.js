import 'App/Commands/BaseCommand'
import 'App/Installers'

export class UpdateCommand extends BaseCommand {
	name = 'update'
	description = 'Update the Marina toolchain'
	wantsSudo = true

	async run() {
		if(!(await this.checkIfCommandExists('brew'))) {
			this.error('Please install brew before proceeding: http://brew.sh')
			process.exit(1)
		}

		Log.comment('Updating brew formulas')
		await this.execAsUser('brew update')

		for(const installerClass of Installers) {
			const installer = new installerClass(this.app)
			const name = installer.constructor.name.replace(/Installer$/, '')

			if(await installer.isService() && await installer.isRunning()) {
				Log.comment('Stopping', name)
				await installer.stop()
			}

			try {
				Log.comment('Updating', name)
				await installer.update()
			} catch(err) {
				Log.error('Error updating', name)
				Log.error(err.message)
			}

			if(await installer.isService()) {
				Log.comment('Starting', name)
				await installer.start()
			}
		}
	}

}

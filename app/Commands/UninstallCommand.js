import 'App/Commands/BaseCommand'
import 'App/Installers'

export class UninstallCommand extends BaseCommand {
	name = 'uninstall'
	description = 'Uninstall the Marina toolchain'
	wantsSudo = true

	async run() {
		for(const installerClass of Installers) {
			const installer = new installerClass(this.app)
			const name = installer.constructor.name.replace(/Installer$/, '')
			const isInstalled = await installer.isInstalled()

			if(!isInstalled) {
				Log.comment('Not installed, skipping', name)
				continue
			}

			const isService = await installer.isService()

			if(isService) {
				const isRunning = await installer.isRunning()

				if(isRunning) {
					Log.comment('Stopping', name)
					await installer.stop(this.app)
				}
			}

			Log.comment('Uninstalling', name)
			await installer.uninstall()
		}
	}

}

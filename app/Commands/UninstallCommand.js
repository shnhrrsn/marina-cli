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

			if(!(await installer.isInstalled())) {
				Log.comment('Not installed, skipping', name)
				continue
			}

			if(await installer.isService() && await installer.isRunning()) {
				Log.comment('Stopping', name)
				await installer.stop()
			}

			Log.comment('Uninstalling', name)
			await installer.uninstall()
		}
	}

}

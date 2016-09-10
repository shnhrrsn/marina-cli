import 'App/Commands/BaseCommand'
import 'App/Installers'
import 'App/Support/FS'

import Path from 'path'
import ChildProcess from 'child-process-promise'

export class InstallCommand extends BaseCommand {
	name = 'install'
	description = 'Install the Marina toolchain'
	wantsSudo = true

	async run() {
		const home = Path.join(process.env.HOME, '.marina')
		await ChildProcess.exec(`sudo -u "${process.env.SUDO_USER}" mkdir -p "${home}" "${home}"/hosts`)
		await FS.copy(this.app.paths.base('resources/config/Caddyfile'), Path.join(home, 'Caddyfile'))

		for(const installerClass of Installers) {
			const installer = new installerClass(this.app)
			const name = installer.constructor.name.replace(/Installer$/, '')
			const isInstalled = await installer.isInstalled()

			if(isInstalled) {
				Log.comment('Already installed', name)
				continue
			}

			Log.comment('Installing', name)
			await installer.install()

			const isService = await installer.isService()

			if(isService) {
				const isRunning = await installer.isRunning()

				if(!isRunning) {
					Log.comment('--> Starting', name)
					await installer.start(this.app)
				}
			}

		}

		// this.info('testing', process.env)
	}

}

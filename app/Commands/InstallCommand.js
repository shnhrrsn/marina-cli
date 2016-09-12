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
		const brewExists = await this.checkIfCommandExists('brew')

		if(!brewExists) {
			this.error('Please install brew before proceeding: http://brew.sh')
			process.exit(1)
		}

		const valetExists = await this.checkIfCommandExists('valet')

		if(valetExists) {
			this.error('Marina is not compatible with Laravel Valet, uninstall before proceeding.')
			process.exit(1)
		}

		const home = this.app.paths.home()
		const hosts = this.app.paths.hosts()
		await ChildProcess.exec(`sudo -u "${process.env.SUDO_USER}" mkdir -p "${home}" "${hosts}"`)
		await FS.copy(this.app.paths.resources('config/Caddyfile'), Path.join(home, 'Caddyfile'))
		await FS.mkdirs('/etc/sudoers.d')

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
	}

	checkIfCommandExists(command) {
		return ChildProcess.exec(`/usr/bin/which "${command}"`)
		.then(() => true)
		.catch(() => false)
	}

}

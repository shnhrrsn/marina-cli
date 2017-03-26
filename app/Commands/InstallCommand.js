import 'App/Commands/BaseCommand'
import 'App/Installers'

import { FS } from 'grind-support'

const path = require('path')
const ChildProcess = require('child-process-promise')

export class InstallCommand extends BaseCommand {
	name = 'install'
	description = 'Install the Marina toolchain'
	wantsSudo = true

	async run() {
		if(!(await this.checkIfCommandExists('brew'))) {
			this.error('Please install brew before proceeding: http://brew.sh')
			process.exit(1)
		}

		if(await this.checkIfCommandExists('valet')) {
			this.error('Marina is not compatible with Laravel Valet, uninstall before proceeding.')
			process.exit(1)
		}

		const home = this.app.paths.home()
		const hosts = this.app.paths.hosts()
		await ChildProcess.exec(`sudo -u "${process.env.SUDO_USER}" mkdir -p "${home}" "${hosts}"`)
		await FS.copy(this.app.paths.resources('config/Caddyfile'), path.join(home, 'Caddyfile'))
		await FS.mkdirs('/etc/sudoers.d')

		for(const installerClass of Installers) {
			const installer = new installerClass(this.app)
			const name = installer.constructor.name.replace(/Installer$/, '')

			if(await installer.isInstalled()) {
				Log.comment('Already installed', name)
				continue
			}

			Log.comment('Installing', name)
			await installer.install()

			if(await installer.isService() && !(await installer.isRunning())) {
				Log.comment('--> Starting', name)
				await installer.start()
			}
		}
	}

}

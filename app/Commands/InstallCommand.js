import 'App/Commands/BaseCommand'
import 'App/Installers'

import { FS } from 'grind-support'
import { AbortError } from 'grind-cli'

const path = require('path')

export class InstallCommand extends BaseCommand {

	name = 'install'
	description = 'Install the Marina toolchain'
	wantsSudo = true

	async run() {
		if(!(await this.checkIfCommandExists('brew'))) {
			throw new AbortError('Please install brew before proceeding: http://brew.sh')
		}

		if(await this.checkIfCommandExists('valet')) {
			throw new AbortError('Marina is not compatible with Laravel Valet, uninstall before proceeding.')
		}

		const home = this.app.paths.home()
		const hosts = this.app.paths.hosts()

		const Caddyfile = {
			source: this.app.paths.resources('config/main.caddyfile'),
			destination: path.join(home, 'Caddyfile')
		}

		if(await FS.exists(Caddyfile.destination)) {
			// Works around a bug in earlier versions of Marina
			// where Caddyfile was copied as root
			await FS.unlink(Caddyfile.destination)
		}

		await Promise.all([
			this.execAsUser(`mkdir -p "${home}" "${hosts}"`),
			this.execAsUser(`cp "${Caddyfile.source}" "${Caddyfile.destination}"`),
			FS.mkdirs('/etc/sudoers.d')
		])

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

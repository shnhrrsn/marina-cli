import 'App/Commands/BaseCommand'

import 'App/Installers'
import 'App/Installers/CaddyInstaller'

import { FS } from 'grind-support'
import { InputOption } from 'grind-cli'

export class UpdateCommand extends BaseCommand {

	name = 'update'
	description = 'Update the Marina toolchain'
	wantsSudo = true

	options = [
		new InputOption(
			'preserve-caddyfiles',
			InputOption.VALUE_NONE,

			// eslint-disable-next-line max-len
			'By default, the Caddyfile for each docked project will be rewritten with any changes.  Use this flag to disable that and maintain the existing Caddyfiles.'
		)
	]

	async run() {
		if(!(await this.checkIfCommandExists('brew'))) {
			this.error('Please install brew before proceeding: http://brew.sh')
			process.exit(1)
		}

		Log.comment('Updating brew formulas')
		await this.execAsUser('brew update')

		if(!this.option('preserve-caddyfiles')) {
			Log.comment('Updating Caddyfiles')
			const caddy = new CaddyInstaller(this.app)
			await caddy.forEachHost(async(file, { domain, proxy }) => {
				Log.comment('Updating', domain)
				const content = await this.app.view.render('Caddyfile', { domain, proxy })
				await FS.writeFile(this.app.paths.hosts(file), content)
			})
		}

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

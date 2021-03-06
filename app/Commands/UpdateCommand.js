import 'App/Commands/BaseCommand'

import 'App/Installers'
import 'App/Support/Site'

import { InputOption, AbortError } from 'grind-cli'

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
			throw new AbortError('Please install brew before proceeding: http://brew.sh')
		}

		Log.comment('Updating brew formulas')
		await this.execAsUser('brew update')

		if(!this.option('preserve-caddyfiles')) {
			Log.comment('Updating Caddyfiles')

			await Site.forEach(this.app, (file, site) => {
				Log.comment('Updating', site.fqdn)
				return site.save()
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

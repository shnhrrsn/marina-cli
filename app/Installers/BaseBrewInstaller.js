import 'App/Installers/BaseInstaller'

export class BaseBrewInstaller extends BaseInstaller {
	isBrewService = false
	formula = null

	get sudoerServiceFile() {
		return `/etc/sudoers.d/brew-${this.formula}`
	}

	async isInstalled() {
		const output = await this.exec('brew list').then(result => result.stdout.toLowerCase().split(/\s+/))
		return output.indexOf(this.formula) >= 0
	}

	async install() {
		if(this.isBrewService) {
			await this.writeFile(this.sudoerServiceFile, [
				`Cmnd_Alias BREW_START = /usr/local/bin/brew services start ${this.formula}`,
				`Cmnd_Alias BREW_STOP = /usr/local/bin/brew services stop ${this.formula}`,
				`Cmnd_Alias BREW_RESTART = /usr/local/bin/brew services restart ${this.formula}`,
				'%admin ALL=(root) NOPASSWD: BREW_START',
				'%admin ALL=(root) NOPASSWD: BREW_STOP',
				'%admin ALL=(root) NOPASSWD: BREW_RESTART'
			])
		}

		return this.exec(`brew install ${this.formula}`)
	}

	async uninstall() {
		if(this.isBrewService) {
			await this.removeFile(this.sudoerServiceFile)
		}

		return this.exec(`brew remove ${this.formula}`)
	}

	isService() {
		return this.isBrewService
	}

	isRunning() {
		return this.exec('brew services list').then(result => {
			const content = result.stdout.toLowerCase().split(/\n+/).filter(
				line => line.indexOf(this.formula) >= 0
			).join('\n')

			return content.indexOf('started') >= 0
		})
	}

	start() {
		return this.sudo(`brew services start ${this.formula}`)
	}

	stop() {
		return this.sudo(`brew services stop ${this.formula}`)
	}

}

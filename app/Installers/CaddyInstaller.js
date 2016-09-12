import 'App/Installers/BaseInstaller'

const LAUNCHCTL_PLIST = '/Library/LaunchDaemons/marina.caddy.plist'
const SUDOER = '/etc/sudoers.d/marina-caddy'

export class CaddyInstaller extends BaseInstaller {

	async isInstalled() {
		const files = [ this.app.paths.home('caddy'), LAUNCHCTL_PLIST, SUDOER ]

		for(const file of files) {
			const exists = await this.fileExists(file)

			if(exists) {
				continue
			}

			return false
		}

		return true
	}

	async install() {
		await this.exec(`/bin/bash "${this.app.paths.base('scripts/install-caddy.sh')}" "${this.app.paths.home()}"`)

		await this.writeFile(SUDOER, [
			`%admin ALL=(root) NOPASSWD: /bin/launchctl load ${LAUNCHCTL_PLIST}`,
			`%admin ALL=(root) NOPASSWD: /bin/launchctl unload ${LAUNCHCTL_PLIST}`,
			'%admin ALL=(root) NOPASSWD: /bin/launchctl list marina.caddy',
		])

		const content = await this.app.view.render('marina-caddy-launch', {
			home: this.app.paths.home()
		})

		await this.writeFile(LAUNCHCTL_PLIST, [ content ])
		await this.sudo(`launchctl load -w ${LAUNCHCTL_PLIST}`)
	}

	async uninstall() {
		await this.sudo(`launchctl unload ${LAUNCHCTL_PLIST}`)
		await this.removeFile(LAUNCHCTL_PLIST)

		return this.removeFile(this.app.paths.home('caddy'))
	}

	isService() {
		return true
	}

	isRunning() {
		return this.sudo('launchctl list marina.caddy').then(() => true).catch(() => false)
	}

	start() {
		return this.sudo(`launchctl load -w ${LAUNCHCTL_PLIST}`)
	}

	stop() {
		return this.sudo(`launchctl unload ${LAUNCHCTL_PLIST}`)
	}

}

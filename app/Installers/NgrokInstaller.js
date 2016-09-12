import 'App/Installers/BaseInstaller'

export class NgrokInstaller extends BaseInstaller {

	isInstalled() {
		return this.fileExists(this.app.paths.home('ngrok'))
	}

	install() {
		return this.exec(`/bin/bash "${this.app.paths.base('scripts/install-ngrok.sh')}" "${this.app.paths.home()}"`)
	}

	uninstall() {
		return this.removeFile(this.app.paths.home('ngrok'))
	}

}

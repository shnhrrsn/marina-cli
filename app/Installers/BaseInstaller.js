import 'App/Support/FS'

import ChildProcess from 'child-process-promise'

export class BaseInstaller {
	app = null

	constructor(app) {
		this.app = app
	}

	isInstalled() {
		throw new Error('Subclasses must implement.')
	}

	install() {
		throw new Error('Subclasses must implement.')
	}

	uninstall() {
		throw new Error('Subclasses must implement.')
	}

	isService() {
		return false
	}

	isRunning() {
		throw new Error('Subclasses must implement.')
	}

	start() {
		throw new Error('Subclasses must implement.')
	}

	stop() {
		throw new Error('Subclasses must implement.')
	}

	async restart() {
		if(!this.isService) {
			return
		}

		const isRunning = await this.isRunning()

		if(isRunning) {
			await this.stop()
		}

		return this.start()
	}

	writeFile(file, lines) {
		return FS.writeFile(file, `${lines.join(`\n`)}\n`)
	}

	copyFile(source, target) {
		return FS.copy(source, target)
	}

	removeFile(file) {
		return FS.unlink(file).catch(err => Log.error(`Unable to remove ${file}`, err))
	}

	fileExists(file) {
		return FS.exists(file)
	}

	exec(command, options) {
		if(process.env.USER === 'root') {
			return ChildProcess.exec(`sudo -u "${process.env.SUDO_USER}" ${command}`, options)
		} else {
			return ChildProcess.exec(command, options)
		}
	}

	sudo(command, options) {
		if(process.env.USER === 'root') {
			return ChildProcess.exec(command, options)
		} else {
			return ChildProcess.exec(`sudo ${command}`, options)
		}
	}

}

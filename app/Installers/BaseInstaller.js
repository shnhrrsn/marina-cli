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

	exec(command) {
		if(process.env.USER === 'root') {
			return ChildProcess.exec(`sudo -u "${process.env.SUDO_USER}" ${command}`)
		} else {
			return ChildProcess.exec(command)
		}
	}

	sudo(command) {
		if(process.env.USER === 'root') {
			return ChildProcess.exec(command)
		} else {
			return ChildProcess.exec(`sudo ${command}`)
		}
	}

}

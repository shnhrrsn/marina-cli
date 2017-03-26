import { FS } from 'grind-support'
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

	readFile(file) {
		return FS.readFile(file).then(content => content.toString())
	}

	writeFile(file, lines) {
		return FS.writeFile(file, `${lines.join('\n')}\n`)
	}

	removeFile(file) {
		return FS.unlink(file).catch(err => Log.error(`Unable to remove ${file}`, err))
	}

	fileExists(file) {
		return FS.exists(file)
	}

	mkdirs(...args) {
		return FS.mkdirs(...args)
	}

	exec(command, options) {
		if(process.env.USER === 'root') {
			return ChildProcess.exec(`sudo -u "${process.env.SUDO_USER}" ${command}`, options)
		}

		return ChildProcess.exec(command, options)
	}

	sudo(command, options) {
		if(process.env.USER === 'root') {
			return ChildProcess.exec(command, options)
		}

		return ChildProcess.exec(`sudo ${command}`, options)
	}

}

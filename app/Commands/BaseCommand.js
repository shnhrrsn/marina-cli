import { Command } from 'grind-cli'

const ChildProcess = require('child-process-promise')

export class BaseCommand extends Command {
	wantsSudo = false

	ready() {
		if(this.wantsSudo) {
			if(process.env.USER !== 'root') {
				this.error('This command must be ran via sudo.')
				process.exit(1)
			} else if(process.env.SUDO_USER.isNil || process.env.USER === process.env.SUDO_USER) {
				this.error('This command must be ran via sudo, not as root.')
				process.exit(1)
			}
		} else if(process.env.USER === 'root') {
			this.error('This command can not be ran as root.')
			process.exit(1)
		}

		return super.ready()
	}

	checkIfCommandExists(command) {
		return ChildProcess.exec(`/usr/bin/which "${command}"`).then(() => true).catch(() => false)
	}

	exec(command, options) {
		return ChildProcess.exec(command, options)
	}

	execAsUser(command, options) {
		if(process.env.USER !== 'root') {
			return this.exec(command, options)
		}

		return this.exec(`sudo -u "${process.env.SUDO_USER}" ${command}`, options)
	}

}

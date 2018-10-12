import { Command, AbortError } from 'grind-cli'

const ChildProcess = require('child-process-promise')

export class BaseCommand extends Command {

	wantsSudo = false

	ready() {
		if(this.wantsSudo) {
			if(process.env.USER !== 'root') {
				throw new AbortError('This command must be ran via sudo.')
			} else if(process.env.SUDO_USER.isNil || process.env.USER === process.env.SUDO_USER) {
				throw new AbortError('This command must be ran via sudo, not as root.')
			}
		} else if(process.env.USER === 'root') {
			throw new AbortError('This command can not be ran as root.')
		}

		return super.ready()
	}

	checkIfCommandExists(command) {
		return ChildProcess.exec(`/usr/bin/which "${command}"`).then(() => true).catch(() => false)
	}

	exec(...args) {
		return ChildProcess.exec(...args)
	}

	execFile(...args) {
		return ChildProcess.execFile(...args)
	}

	execAsUser(command, options) {
		if(process.env.USER !== 'root') {
			return this.exec(command, options)
		}

		return this.exec(`sudo -u "${process.env.SUDO_USER}" ${command}`, options)
	}

}

import { Command } from 'grind-cli'

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

}

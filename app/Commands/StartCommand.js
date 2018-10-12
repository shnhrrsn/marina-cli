import { Command } from 'grind-cli'

import 'App/Installers/CaddyInstaller'
import 'App/Installers/DnsmasqInstaller'

export class StartCommand extends Command {

	name = 'start'
	description = 'Start Caddy & Dnsmasq'


	run() {
		const caddy = new CaddyInstaller(this.app)
		const dnsmasq = new DnsmasqInstaller(this.app)

		return Promise.all([
			caddy.start(),
			dnsmasq.start()
		])
	}

}

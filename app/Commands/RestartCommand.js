import { Command } from 'grind-cli'

import 'App/Installers/CaddyInstaller'
import 'App/Installers/DnsmasqInstaller'

export class RestartCommand extends Command {
	name = 'restart'
	description = 'Restart Caddy & Dnsmasq'


	run() {
		const caddy = new CaddyInstaller(this.app)
		const dnsmasq = new DnsmasqInstaller(this.app)

		return Promise.all([
			caddy.restart(),
			dnsmasq.restart()
		])
	}

}

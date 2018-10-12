import { Command } from 'grind-cli'

import 'App/Installers/CaddyInstaller'
import 'App/Installers/DnsmasqInstaller'

export class StopCommand extends Command {

	name = 'stop'
	description = 'Stop Caddy & Dnsmasq'


	run() {
		const caddy = new CaddyInstaller(this.app)
		const dnsmasq = new DnsmasqInstaller(this.app)

		return Promise.all([
			caddy.stop(),
			dnsmasq.stop()
		])
	}

}

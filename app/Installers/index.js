import 'App/Installers/CaddyInstaller'
import 'App/Installers/DnsmasqInstaller'
import 'App/Installers/NgrokInstaller'
import 'App/Installers/PortForwardingInstaller'

export const Installers = [
	DnsmasqInstaller,
	PortForwardingInstaller,

	CaddyInstaller,
	NgrokInstaller,
]

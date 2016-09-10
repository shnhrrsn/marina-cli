import 'App/Installers/BaseBrewInstaller'

export class DnsmasqInstaller extends BaseBrewInstaller {
	isBrewService = true
	formula = 'dnsmasq'

}

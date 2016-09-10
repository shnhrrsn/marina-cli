import 'App/Installers/BaseInstaller'

const PF_ANCHORS = '/etc/pf.anchors/marina'
const PF_CONF = '/etc/pf-marina.conf'
const LAUNCHCTL_PLIST = '/Library/LaunchDaemons/marina.port-forwarding.plist'
const SUDOER = '/etc/sudoers.d/marina-port-forwarding'

export class PortForwardingInstaller extends BaseInstaller {

	async isInstalled() {
		const files = [ PF_ANCHORS, PF_CONF, LAUNCHCTL_PLIST, SUDOER ]

		for(const file of files) {
			const exists = await this.fileExists(file)

			if(exists) {
				continue
			}

			return false
		}

		return true
	}

	async install() {
		await this.writeFile(PF_ANCHORS, [
			'rdr pass on lo0 inet proto tcp from any to 127.0.0.1 port 80 -> 127.0.0.1 port 48080',
			'rdr pass on lo0 inet proto tcp from any to 127.0.0.1 port 443 -> 127.0.0.1 port 48443'
		])

		await this.writeFile(PF_CONF, [
			'rdr-anchor "forwarding"',
			'load anchor "forwarding" from "/etc/pf.anchors/webcontrol"'
		])

		await this.writeFile(SUDOER, [
			`%admin ALL=(root) NOPASSWD: /bin/launchctl load ${LAUNCHCTL_PLIST}`,
			`%admin ALL=(root) NOPASSWD: /bin/launchctl unload ${LAUNCHCTL_PLIST}`,
			'%admin ALL=(root) NOPASSWD: /bin/launchctl list marina.port-forwarding',
			'%admin ALL=(root) NOPASSWD: /sbin/pfctl -F all -f /etc/pf.conf'
		])

		await this.copyFile(this.app.paths.base('resources/config/marina.port-forwarding.plist'), LAUNCHCTL_PLIST)
		await this.sudo(`launchctl load -w ${LAUNCHCTL_PLIST}`)
	}

	async uninstall() {
		await this.sudo(`launchctl unload ${LAUNCHCTL_PLIST}`)

		await this.removeFile(LAUNCHCTL_PLIST)
		await this.removeFile(PF_ANCHORS)
		await this.removeFile(PF_CONF)

		await this.sudo('pfctl -F all -f /etc/pf.conf')

		await this.removeFile(SUDOER)
	}

}

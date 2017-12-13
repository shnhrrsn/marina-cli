import 'App/Installers/BaseBrewInstaller'
const path = require('path')

const CONFIG_PATH = '/usr/local/etc/dnsmasq.conf'
const EXAMPLE_CONFIG_PATH = '/usr/local/opt/dnsmasq/dnsmasq.conf.example'
const RESOLVER_DIR = '/etc/resolver'

export class DnsmasqInstaller extends BaseBrewInstaller {
	isBrewService = true
	formula = 'dnsmasq'

	async isInstalled() {
		const isInstalled = await this._superIsInstalled()

		if(!isInstalled) {
			return false
		}

		const configExists = await this.configExists()

		if(!configExists) {
			return false
		}
		const localConfigExists = await this.localConfigExists()

		if(!localConfigExists) {
			return false
		}

		const config = await this.readFile(CONFIG_PATH)
		return config.indexOf(this.localConfigPath) >= 0
	}

	async install() {
		await this._superInstall()

		const configExists = await this.configExists()

		if(!configExists) {
			// NOTE: Not using copyFile here because it will write as root, not user
			await this.exec(`cp "${EXAMPLE_CONFIG_PATH}" "${CONFIG_PATH}"`)
		}

		const localConfigExists = await this.localConfigExists()

		if(!localConfigExists) {
			// NOTE: Not using writeFile here because it will write as root, not user
			await this.exec(`bash -c "echo 'address=/.localhost/127.0.0.1' > '${this.localConfigPath}'"`)
		}

		let config = await this.readFile(CONFIG_PATH)

		if(config.indexOf(this.localConfigPath) < 0) {
			config += `\nconf-file="${this.localConfigPath}"`
			await this.writeFile(CONFIG_PATH, [ config ])
		}

		await this.mkdirs(RESOLVER_DIR)

		return this.writeFile(this.resolverPath, [ 'nameserver 127.0.0.1' ])
	}

	configExists() {
		return this.fileExists(CONFIG_PATH)
	}

	localConfigExists() {
		return this.fileExists(this.localConfigPath)
	}

	get resolverPath() {
		return path.join(RESOLVER_DIR, 'localhost')
	}

	get localConfigPath() {
		return this.app.paths.home('dnsmasq.conf')
	}

	_superIsInstalled() {
		return super.isInstalled()
	}

	_superInstall() {
		return super.install()
	}

}

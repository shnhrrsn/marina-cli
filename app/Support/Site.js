import { FS } from 'grind-support'

export class Site {

	app
	domain
	aliases
	source

	constructor(app, options) {
		this.app = app
		this.update(options)
	}

	static fromConfig(app, config) {
		// First check for legacy config
		const proxy = ((config.match(/#proxy:(.+?)$/m) || [ ])[1] || '').trim()

		if(proxy.length > 0) {
			return new this(app, {
				proxy,
				domain: ((config.match(/#domain:(.+?)$/m) || [ ])[1] || '').trim()
			})
		}

		// Otherwise load modern json config
		const json = ((config.match(/#config:(.+?)$/m) || [ ])[1] || '').trim()

		if(json.length === 0) {
			throw new Error('Invalid config.')
		}

		return new this(app, JSON.parse(json))
	}

	static async fromFile(app, file) {
		const config = await FS.readFile(file)
		return this.fromConfig(app, config.toString())
	}

	static async forEach(app, callback) {
		for(const file of await FS.readdir(app.paths.hosts())) {
			const site = await this.fromFile(app, app.paths.hosts(file))
			await callback(file, site)
		}
	}

	get hasAliases() {
		return Array.isArray(this.aliases) && this.aliases.length > 0
	}

	get configPath() {
		return this.app.paths.hosts(`${this.fqdn}.conf`)
	}

	get fqdn() {
		return `${this.domain}.${this.app.settings.$tld}`
	}

	get fqAliases() {
		if(!this.hasAliases) {
			return [ ]
		}

		return this.aliases.map(alias => `${alias}.${this.app.settings.$tld}`)
	}

	update({ domain, aliases, proxy, source } = { }) {
		const stripTldPattern = new RegExp(`\\.${this.app.settings.$tld}$`)

		if(typeof domain === 'string') {
			this.domain = domain.replace(stripTldPattern, '')
		}

		if(Array.isArray(aliases)) {
			this.aliases = aliases.map(alias => alias.replace(stripTldPattern, ''))
		}

		if(typeof proxy === 'string') {
			this.source = proxy
		}

		if(typeof source === 'string') {
			this.source = source
		}
	}

	async save() {
		const content = await this.app.view.render('Caddyfile', { site: this })

		await FS.writeFile(this.configPath, content)

		if(process.env.USER === 'root') {
			await FS.chown(this.configPath, Number(process.env.SUDO_UID), Number(process.env.SUDO_GID))
		}
	}

	stringify() {
		return JSON.stringify(this)
	}

	toObject() {
		return {
			domain: this.domain,
			aliases: Array.isArray(this.aliases) && this.aliases.length > 0 ? [ ...this.aliases ] : void 0,
			source: this.source
		}
	}

	toJSON() {
		return this.toObject()
	}

}

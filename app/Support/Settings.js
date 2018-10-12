import { FS } from 'grind-support'

export class Settings {

	$app = null

	static async load(app) {
		const settings = new Settings
		settings.$app = app
		settings.$loaded = true

		Object.assign(settings, JSON.parse(await FS.readFile(app.paths.settings)))

		return settings
	}

	get $tld() {
		return this.tld || 'localhost'
	}

	async save() {
		const json = Object.assign({ }, this)
		delete json.$app
		delete json.$loaded

		await FS.writeFile(this.$app.paths.settings, `${JSON.stringify(json, null, '\t')}\n`)

		if(process.env.USER === 'root') {
			await FS.chown(this.$app.paths.settings, Number(process.env.SUDO_UID), Number(process.env.SUDO_GID))
		}
	}

}

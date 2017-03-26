import 'App/Commands/BaseCommand'

import { FS } from 'grind-support'

export class ListCommand extends BaseCommand {
	name = 'list'
	description = 'Lists all registered domains.'

	async run() {
		const files = await FS.readdir(this.app.paths.hosts())

		for(const file of files) {
			const config = await FS.readFile(this.app.paths.hosts(file)).then(contents => contents.toString())
			const proxy = ((config.match(/#proxy:(.+?)$/m) || [ ])[1] || '???').trim()
			this.comment(`${file.replace(/\.conf$/, '')} => ${proxy}`)
		}
	}

}

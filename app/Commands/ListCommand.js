import 'App/Commands/BaseCommand'
import 'App/Support/Site'

export class ListCommand extends BaseCommand {

	name = 'list'
	description = 'Lists all registered domains.'

	run() {
		return Site.forEach(this.app, (file, site) => {
			this.info(`${site.fqdn} => ${site.proxy}`)

			for(const alias of site.fqAliases) {
				this.info(`${alias} => ${site.proxy}`)
			}
		})
	}

}

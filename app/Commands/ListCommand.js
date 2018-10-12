import 'App/Commands/BaseCommand'
import 'App/Support/Site'

const chalk = require('chalk')

export class ListCommand extends BaseCommand {

	name = 'list'
	description = 'Lists all registered domains.'

	async run() {
		this.info('')
		const sites = [ ]

		await Site.forEach(this.app, (file, site) => {
			sites.push(site)
		})

		const max = Math.max(...sites.map(site => site.fqdn.length)) + 3

		for(const site of sites) {
			let line = '  '
			line += chalk.green(`http://${site.fqdn.padEnd(max)}`)
			line += chalk.gray('  =>  ')
			line += chalk.blue(site.source)

			if(site.hasAliases) {
				let alias = ''

				if(site.aliases.length === 1) {
					alias += ' [Alias: '
				} else {
					alias += ' [Aliases: '
				}

				alias += site.fqAliases.map(a => chalk.yellow(`http://${a}`)).join(', ')
				alias += ']'

				line += chalk.gray(alias)
			}

			this.info(line)
		}

		this.info('')
	}

}

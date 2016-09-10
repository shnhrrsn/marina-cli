import 'App/Commands/BaseCommand'
import 'App/Support/FS'

export class ListCommand extends BaseCommand {
	// Name of the command
	name = 'list'

	// Description of the command to show in help
	description = 'Command description'

	// Arguments available for this command
	// arguments = [ 'requiredArgument', 'optionalArgument?' ]

	// Options for this command
	// options = {
	// 	someOption: 'Description of this option'
	// }

	async run() {
		const files = await FS.readdir(this.app.paths.hosts())

		for(const file of files) {
			const config = await FS.readFile(this.app.paths.hosts(file)).then(contents => contents.toString())
			const target = config.match(/#target:(.+?)$/m)[1].trim()
			this.comment(`${file.replace(/\.conf/, '')} => ${target}`)
		}
	}

}

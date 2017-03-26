import { FS } from 'grind-support'

import 'App/Commands/DockCommand'
import 'App/Commands/InstallCommand'
import 'App/Commands/ListCommand'
import 'App/Commands/RestartCommand'
import 'App/Commands/ShareCommand'
import 'App/Commands/StartCommand'
import 'App/Commands/StopCommand'
import 'App/Commands/UndockCommand'
import 'App/Commands/UninstallCommand'

export async function CommandsProvider(app) {
	app.cli.commands.length = 0
	app.cli.register(InstallCommand)
	app.cli.register(UninstallCommand)

	if(await FS.exists(app.paths.home('Caddyfile'))) {
		app.cli.register(DockCommand)
		app.cli.register(ListCommand)
		app.cli.register(RestartCommand)
		app.cli.register(ShareCommand)
		app.cli.register(StartCommand)
		app.cli.register(StopCommand)
		app.cli.register(UndockCommand)
	}
}

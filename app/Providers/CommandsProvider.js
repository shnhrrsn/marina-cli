import { FS } from 'grind-support'

import 'App/Commands/DockCommand'
import 'App/Commands/DomainCommand'
import 'App/Commands/InstallCommand'
import 'App/Commands/ListCommand'
import 'App/Commands/OpenCommand'
import 'App/Commands/RestartCommand'
import 'App/Commands/ShareCommand'
import 'App/Commands/SslCommand'
import 'App/Commands/StartCommand'
import 'App/Commands/StopCommand'
import 'App/Commands/UndockCommand'
import 'App/Commands/UninstallCommand'
import 'App/Commands/UpdateCommand'

export async function CommandsProvider(app) {
	app.cli.commands.length = 0
	app.cli.register(InstallCommand)
	app.cli.register(UninstallCommand)

	if(await FS.exists(app.paths.home('Caddyfile'))) {
		app.cli.register(DockCommand)
		app.cli.register(DomainCommand)
		app.cli.register(ListCommand)
		app.cli.register(OpenCommand)
		app.cli.register(RestartCommand)
		app.cli.register(ShareCommand)
		app.cli.register(SslCommand)
		app.cli.register(StartCommand)
		app.cli.register(StopCommand)
		app.cli.register(UndockCommand)
		app.cli.register(UpdateCommand)
	}
}

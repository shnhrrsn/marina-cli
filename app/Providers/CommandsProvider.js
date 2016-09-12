import 'App/Commands/DockCommand'
import 'App/Commands/InstallCommand'
import 'App/Commands/ListCommand'
import 'App/Commands/UninstallCommand'

export function CommandsProvider(app) {
	app.cli.register(DockCommand)
	app.cli.register(InstallCommand)
	app.cli.register(ListCommand)
	app.cli.register(UninstallCommand)
}

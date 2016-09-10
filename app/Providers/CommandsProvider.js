import 'App/Commands/InstallCommand'
import 'App/Commands/UninstallCommand'

export function CommandsProvider(app) {
	app.cli.register(InstallCommand)
	app.cli.register(UninstallCommand)
}

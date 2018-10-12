import 'App/Support/Settings'
import { FS } from 'grind-support'

export async function SettingsProvider(app) {
	if(await FS.exists(app.paths.settings)) {
		app.settings = await Settings.load(app)
	} else {
		app.settings = new Settings
		app.settings.$app = app
	}
}

SettingsProvider.priority = 1000

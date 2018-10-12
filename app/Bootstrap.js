import { Application } from 'grind-framework'
import { ViewProvider } from 'grind-view'

import 'App/Extensions/Paths'
import 'App/Providers/SettingsProvider'

export function Bootstrap(kernelClass) {
	const app = new Application(kernelClass, {
		pathsClass: Paths
	})

	app.providers.add(SettingsProvider)
	app.providers.add(ViewProvider)

	return app
}

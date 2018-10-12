import { Application } from 'grind-framework'
import { ViewProvider } from 'grind-view'

import 'App/Extensions/Paths'

export function Bootstrap(kernelClass) {
	const app = new Application(kernelClass, {
		pathsClass: Paths
	})

	app.providers.add(ViewProvider)

	return app
}

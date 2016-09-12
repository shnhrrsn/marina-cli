import { ViewProvider as SuperViewProvider } from 'grind-view'

export function ViewProvider(app) {
	SuperViewProvider(app)

	app.view.render = (template, context) => {
		return new Promise((resolve, reject) => {
			app.view.nunjucks.render(template, context, (err, res) => {
				if(!err.isNil) {
					return reject(err)
				}

				resolve(res)
			})
		})
	}

}

ViewProvider.priority = SuperViewProvider.priority

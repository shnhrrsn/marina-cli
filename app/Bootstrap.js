require('babel-polyfill')

import Grind from 'grind-framework'
import { ViewProvider } from 'grind-view'

import 'App/Extensions/Paths'

const app = new Grind({
	pathsClass: Paths
})

app.providers.push(ViewProvider)

module.exports = app

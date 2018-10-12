//
// WARNING: This file is *NOT* processed through babel
//

require('@babel/polyfill')
require('@babel/register')
require('grind-framework')

const { CliKernel, Runner } = require('grind-cli')

new Runner(() => {
	const app = require('../app/Bootstrap').Bootstrap(CliKernel)
	const { CommandsProvider } = require('../app/Providers/CommandsProvider')
	app.providers.add(CommandsProvider)

	return app
}).run().catch(err => {
	Log.error('Boot Error', err)
	process.exit(1)
})

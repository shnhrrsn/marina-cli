import { Paths as GrindPaths } from 'grind-framework'

const path = require('path')

export class Paths extends GrindPaths {

	_resources
	_home
	_hosts

	constructor(bootstrapper) {
		super(bootstrapper)

		this._resources = this.base('resources')
		this._home = path.join(process.env.HOME, '.marina')
		this._hosts = path.join(this._home, 'hosts')
	}

	resources(...args) {
		return this._join(this._resources, ...args)
	}

	home(...args) {
		return this._join(this._home, ...args)
	}

	hosts(...args) {
		return this._join(this._hosts, ...args)
	}

	get settings() {
		return this.home('marina.json')
	}

}

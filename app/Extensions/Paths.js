import { Paths as GrindPaths } from 'grind-framework'

const path = require('path')

export class Paths extends GrindPaths {

	_resources
	_home
	_hosts
	_certs

	constructor(bootstrapper) {
		super(bootstrapper)

		this._resources = this.base('resources')
		this._home = path.join(process.env.HOME, '.marina')
		this._hosts = path.join(this._home, 'hosts')
		this._certs = path.join(this._home, 'certs')
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

	certs(...args) {
		return this._join(this._certs, ...args)
	}

	get settings() {
		return this.home('marina.json')
	}

}

import { AbortError } from 'grind-cli'

export class NonexistentDomainError extends AbortError {

	constructor(site, ...args) {
		let message

		if(site.isNil) {
			message = 'This domain is not currently docked.'
		} else {
			message = `“${site.fqdn}” is not currently docked.`
		}

		super(message, ...args)
	}

}

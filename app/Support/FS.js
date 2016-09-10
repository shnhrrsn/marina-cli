import BaseFS from 'fs-promise'

export const FS = Object.assign({ }, BaseFS)

FS.exists = path => {
	return BaseFS.stat(path).then(() => true).catch(() => false)
}

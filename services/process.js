/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const fs = require('fs')
const path = require('path')
const Util = require('../lib/util')

exports.nginx = function(cb) {
	let command = 'systemctl reload nginx'
	return Util.exec(command, cb)
}

exports.start = function(_path, cb) {
	console.log('start on path = ', _path)
	let command = `cd ${_path} && pm2 start ecosystem.config.js`
	let that = this
	return Util.exec(command, function(err) {
		if (err) return that.restart(_path, cb)
		return cb()
	})
}

exports.restart = function(_path, cb) {
	let command = `cd ${_path} && pm2 restart ecosystem.config.js`
	return Util.exec(command, cb)
}

exports.stop = function(_path, cb) {
	let command = `cd ${_path} && pm2 stop ecosystem.config.js`
	return Util.exec(command, cb)
}


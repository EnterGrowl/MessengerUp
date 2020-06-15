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
const print = require('../lib/print')
const secrets = require('../.secrets.json')

exports.nginx = function(cb) {
	let command = 'systemctl reload nginx'
	print(10, '! ', command)
	return Util.exec(command, cb||Util.nonceFunc)
}

exports.start = function(_path, cb) {
	console.log('start on path = ', _path)
	let command = `cd ${_path} && npm install && pm2 start ecosystem.config.js`
	print(10, '@ ', command)
	let that = this
	return Util.exec(command, function(err) {
		if (err) return that.restart(_path, cb)
		return cb()
	})
}

exports.restart = function(_path, cb) {
	let command = `cd ${_path} && pm2 restart ecosystem.config.js`
	print(10, '# ', command)
	return Util.exec(command, cb)
}

exports.stop = function(_path, cb) {
	let command = `cd ${_path} && pm2 stop ecosystem.config.js`
	print(10, '$ ', command)
	return Util.exec(command, cb)
}

exports.certbot = function(name, domains, cb) {
	return this.nginx(function() {
		return setTimeout(function() {
			let command = null
			if (!domains.length) {
				command = `certbot --nginx -d ${name} --noninteractive --agree-tos --register-unsafely-without-email`
			} else {
				command = `certbot certonly --nginx --cert-name ${name} ${domains} --noninteractive --agree-tos --register-unsafely-without-email`
			}
			print(10, '$ ', command)
			return Util.exec(command, cb)
		}, 144)
	})
}

exports.fbWhitelist = function() {
	/**
		curl -X POST -H "Content-Type: application/json" -d '{
		  "whitelisted_domains":[
		    "https://petersfancyapparel.com"
		  ]
		}' "https://graph.facebook.com/v7.0/me/messenger_profile?access_token=PAGE_ACCESS_TOKEN"
	*/
}

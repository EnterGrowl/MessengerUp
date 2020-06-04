/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const ejs = require('ejs')
const fs = require('fs')
const path = require('path')
const Cert = require('../models/certificate').Cert
const Util = require('../lib/util')
const uniqueString = require('unique-string')
const secrets = require('../.secrets.json')
const nginxPath = secrets['DEPLOY'][process.env.MODE]['NGINX']

exports.add = function(port, cb) {
	/**find open cert to use**/
	let url = `https://${port}.messenger.com`
    let options = { port: port }
	let e = `PLEASE RECORD: failed to bind deployment ${port} to certificate`
	let that = this

	console.log('t1')

	function finalAddHandler(cert, cb /** common callback **/) {
		// config NGINX
		console.log('t4')
		let filepath = path.resolve('./builds/tpl.conf')
		fs.readFile(filepath, 'utf-8', function(err, file) {
		    if (err) return cb(err)
		    console.log('t5')
		    options.cert = cert.name
		    let nginx = ejs.render(file, options)
		    let destination = path.resolve(nginxPath, `${options.port}.conf`)
			const data = new Uint8Array(Buffer.from(nginx))
			fs.writeFile(destination, data, (err) => {
				if (err) return cb(err)
				// update cert
				console.log('t6')
				let domains = cert.domains.map(function(d) { return `-d ${d.replace('https://', '')}`}).join(' ')
				let command = `certbot certonly --nginx --cert-name ${cert.name} ${domains} --noninteractive --config-dir ~/.certbot/config --logs-dir ~/.certbot/logs --work-dir ~/.certbot/work --agree-tos --email ${secrets['EMAIL'][process.env.MODE]}`
				Util.exec(command, function(err) {
					if (err) {
						console.error(err)
						// return cb(`PLEASE RECORD: failed to update certificate "${cert.name}"`)
					}
					// add domain to cert
					console.log('t7')
					cert.domains.push(url)
					cert.ports.push(port)
					cert.markModified('domains')
					cert.markModified('ports')
					return cert.save(cb)
				})
			})
		})
	}

	function noCertHandler(cb /** common callback **/) {
		that.create(function(err, cert) {
			if (err || !cert) return cb(e)
			return finalAddHandler(cert, cb)
		})
	}

	Cert.findOne({
		locked: false
	}, function(err, cert) {
		if (err) return cb(err)
		console.log('t2')
		if (!cert) return noCertHandler(cb)
		console.log('t3')
		return finalAddHandler(cert, cb)
	})
}

exports.create = function(cb) {
	// name should not exist
	function isUniqueName(arg, next) {
		return Cert.findOne({
			name: arg
		}, function(err, cert) {
			if (err||cert) return next(false)
			return next(true)
		})
	}

	// serial async
	function findUniqueName(next) {
		let us = uniqueString()
		isUniqueName(us, function(isUnique) {
			if (isUnique) {
				return next(us)
			} else {
				return findUniqueName(next)
			}
		})
	}

	return findUniqueName(function(name) {
		let cert = new Cert({
			name: name
		})

		// add cert
		let command = `certbot --nginx -d ${name} --noninteractive`
		Util.exec(command, function(err) {
			if (err) {
				if (cb) return cb(err)
				else return
			}
			cert.save(function(err) {
				if (cb) {
					return cb(err, cert)
				}
			})
		})
	})
}

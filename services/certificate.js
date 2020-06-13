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
const print = require('../lib/print')
const Process = require('./process')
const Cert = require('../models/certificate').Cert
const Util = require('../lib/util')
const uniqueString = require('unique-string')
const secrets = require('../.secrets.json')
const nginxPath = secrets['DEPLOY'][process.env.MODE]['NGINX']

exports.add = function(port, cb) {
	/**find open cert to use**/
	console.log('!! add certificate !!')
	let url = `https://${port}.messengerup.com`
    let options = { port: port }
	let e = `PLEASE RECORD: failed to bind deployment ${port} to certificate`
	let that = this
	print(5, 'cert 1  ')

	function finalAddHandler(cert, cb /** common callback **/) {
		// config NGINX
		print(5, 'cert 4  ')
		let filepath = path.resolve('./builds/tpl.conf')
		fs.readFile(filepath, 'utf-8', function(err, file) {
		    if (err) return cb(err)
		    print(5, 'cert 5  ')
		    options.cert = cert.name
		    let nginx = ejs.render(file, options)
		    let destination = path.resolve(nginxPath, `${options.port}.conf`)
			const data = new Uint8Array(Buffer.from(nginx))
			fs.writeFile(destination, data, (err) => {
				if (err) return cb(err)
				// update cert
				print(5, 'cert 6  ')
				cert.domains.push(url)
				cert.ports.push(port)
				cert.markModified('domains')
				cert.markModified('ports')
				let domains = cert.domains.map(function(d) { return `-d ${d.replace('https://', '')}`}).join(' ')

				Process.nginx(cert.name, domains, function() {
					/** NGINX writes to stderr by default */
					print(5, 'cert 7  ')
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
		print(5, 'cert 2  ')
		if (!cert) return noCertHandler(cb)
		print(5, 'cert 3  ')
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

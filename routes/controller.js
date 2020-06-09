/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

require('dotenv').config()
const async = require('async')
const ejs = require('ejs')
const fs = require('fs')
const path = require('path')
const rimraf = require("rimraf")
const print = require('../lib/print')
const secrets = require('../.secrets.json')
const publicKey = secrets['STRIPE'][process.env.MODE]['PUBLIC']
const secretKey = secrets['STRIPE'][process.env.MODE]['PRIVATE']
const prices = secrets['STRIPE'][process.env.MODE]['PRICE']
const url = secrets['URL'][process.env.MODE]
const stripe = require('stripe')(secretKey)
const Auth = require('./auth')
const Util = require('../lib/util')
const Cert = require('../services/certificate')
const Mailer = require('../services/mailer')
const Process = require('../services/process')
const User = require('../models/user').User
const Payment = require('../models/payment').Payment
const Repo = require('../models/repo').Repo
const Deploy = require('../models/deploy').Deploy
const Dashboard = require('../bin/controllers/dashboard')

function assets(_id, cb) {
	Repo.find({user: _id}, function(err, repos) {
		repos = repos || []
		Deploy.find({user: _id}, function(err, deploys) {
			deploys = deploys || []
			cb({
				repos: repos,
				deploys: deploys
			})
		})
	})
}

exports.dashboard = Dashboard

exports.splash = function(req, res, next) {
	res.render('index', { 
		title: 'Messenger⇪',
		subtitle: 'FREE Messenger app. Deploy in seconds.',
		stripe: publicKey
	})
}

exports.email = function(req, res, next) {
	/*
		find user by email
		if !user || !repo > create user, offer free repo, offer deployment
		if user && repo > prompt payment / update subscription
	*/
	let email = Util.formatEmail(req.body.email)
	User.userFromEmail(email, function(err, user) {
		if (err) return Util.systemError(err, res)
		if (!user) {
			user = new User({email: email})
		} 
		let pin = user.setPIN()
		Mailer.verifyPIN(email, pin, function(err) {
			if (err) return Util.systemError(err, res)
			return res.json({
				status:200
			})
		})
	})
}

exports.verify = function(req, res, next) {
	/* equivalent to login, generate token */
	let pin = req.body.pin
	let email = Util.formatEmail(req.body.email)
	User.userFromEmail(email, function(err, user) {
		if (err||!user) return Util.systemError(err, res)
		if (user.pin!==pin) {
			return Util.verificationError(res)
		}
		assets(user._id, function(_assets) {
			let repos = _assets.repos
			let deploys = _assets.deploys
	        Auth.tokenForUser(user._id, function(err, token) {
	            if (err) return Util.systemError(res)
	            var data = token.toObject()
	            res.json({
	            	status: 200,
	            	repos: repos,
	            	deployments: deploys,
	            	token: data.token,
	            	type: user.type ? true : false
	            })
	        })
		})
	})
}

exports.checkout = function(req, res, next) {
	let _res = res
	assets(req.user._id, function(_assets) {
		let type = req.body.type
		let price = null
		let mode = ''

		if (type === 'download') {
			price = prices['DOWNLOAD']
			mode = 'payment'
		} else {
			mode = 'subscription'
			if (type=='basic') {
				price = prices['BASIC']
			} else {
				// TODO (ENHANCED, PREMIUM, ENTERPRISE)
			}
		}
		console.log('type', type)
		console.log('price', price)
		stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: [{
				price: price,
				quantity: 1,
			}],
			mode: mode,
			success_url: `${url}/success/{CHECKOUT_SESSION_ID}`,
			cancel_url: `${url}`,
			customer_email: req.user.email
		}, function(err, checkout) {
			if (err) return Util.systemError(err, _res)
			let payment = new Payment({
				user: req.user._id,
				id: checkout.id,
				checkout: checkout,
				type: type
			})
			payment.save(function(err) {
				if (err) return Util.systemError(err, _res)
				res.json({
					status: 200,
					session: checkout.id
				})
			})
		})
	})
}

exports.success = function(req, res, next) {
	let session = req.params.id
	Payment.findOne({id: session}, function(err, checkout) {
		if (err) return Util.successError(session, `payment fetch fail for ${session}`, res)
		Auth.tokenForUser(checkout.user, function(err, token) {
			if (err) return Util.successError(session, 'token create fail', res)
			checkout.deployed = true
			checkout.save()
			res.render('success', {
				session: session,
				title: 'Messenger⇪',
				subtitle: 'FREE Messenger app. Deploy in seconds.',
				token: token.token
			})
		})
	})
}

exports.build = function(req, res) {
	Util.defaultPortConfig({
		user: req.user._id,
		json: req.body,
		deployed: false
	}, function(err, build) {
		if (err) return Util.systemError(err, res)
		let _port = build.port
		let _path = path.join(build.path, `${_port}.zip`)
		fs.readFile(_path, 'base64', function(err, data) {
			if (err) return Util.systemError(err, res)
			// send zip file for download
			res.set('Content-Type', 'application/zip')
			res.set('Content-Disposition', 'attachment; filename=MessengerUp.zip');
			res.set('Content-Length', data.length);
			res.end(data, 'binary');
			rimraf(build.path, Util.nonceFunc)
		})
	})
}

exports.deploy = function(req, res) {
	const _res = res
	const session = req.body.session
	const json = req.body.json
	const user = req.user
	const that = this

	async.waterfall([
	    function(callback) {
	    	print(5, 'step 1  ')
	    	Util.defaultPortConfig({
	    		user: user._id,
	    		json: json,
	    		deployed: true
	    	}, function(err, build) {
	    		if (err) return callback(Util.buildError(session, 'CREATE PORT', _res))
				callback(null, build)
	    	})
	    },
	    function(build, callback) {
	    	print(5, 'step 2  ')
	    	console.log(build)
	    	console.log(callback)
			let deploy = new Deploy({
				user: user._id,
				repo: build.repo,
				port: build.port
			})
			deploy.save(function(err) {
				if (err) return callback(
					Util.buildError(session, `DEPLOY SAVE PORT ${build.port}`, _res))
				callback(null, build)
			})
	    },
	    function(build, callback) {
	    	print(5, 'step 3  ')
	    	Cert.add(build.port, function(err) {
	    		if (err) return callback(Util.buildError(session, err, _res))
		        callback(null, build)
		    })
	    },
	    function(build, callback) {
	    	print(5, 'step 4  ')
			build.origin = path.join(build.path, build.port)
			build.destination = path.join(secrets['DEPLOY'][process.env.MODE]['PATH'], build.port)
	    	fs.rename(build.origin, build.destination, function(err) {
	    		if (err) return callback(Util.buildError(session, `MV BUILD PORT ${_port}`, _res))
		        callback(null, build)
		    })
	    },
	    function(build, callback) {
	    	print(5, 'step 5  ')
	    	Process.start(build.destination, function(err) {
	    		if (err) return callback(Util.buildError(session, `PROCESS START PORT ${build.port}`, _res))
	    		callback(null, build)
	    	})
	    },
	    function(build, callback) {
	    	print(5, 'step 6  ')
	    	console.log(build.path)
			rimraf(build.path, callback)
	    }
	], function (err, result) {
	    if (!err) {
	    	console.log('build finished!', new Date())
	    	res.json({
	    		status: 200
	    	})
	    } else {
	    	return Util.buildError(session, err, res)
	    }
	});
}

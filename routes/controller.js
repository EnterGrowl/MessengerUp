/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

require('dotenv').config()
const ejs = require('ejs')
const secrets = require('../.secrets.json')
const publicKey = secrets['STRIPE'][process.env.MODE]['PUBLIC']
const secretKey = secrets['STRIPE'][process.env.MODE]['PRIVATE']
const prices = secrets['STRIPE'][process.env.MODE]['PRICE']
const path = require('path')
const url = secrets['URL'][process.env.MODE]
const stripe = require('stripe')(secretKey)
const Auth = require('./auth')
const Mailer = require('../services/mailer')
const User = require('../models/user').User
const Payment = require('../models/payment').Payment
const Repo = require('../models/repo').Repo
const Deploy = require('../models/deploy').Deploy
const Port = require('../lib/port')
const Util = require('../lib/util')

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
	assets(req.user._id, function(_assets) {
		if (!req.user.type) {
			if (!req.body.type) {
				return Util.accountTypeError(res)
			}
			req.user.type = req.body.type
			req.user.save()
		}
		let type = req.user.type
		let bulk = _assets.deploys.length > 9
		let price = null
		if (type === 'extended') {
			price = prices['EXTENDED']
		} else {
			if (bulk) {
				price = prices['BULK']
			} else {
				price = prices['BASIC']
			}
		}
		stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: [{
				price: price,
				quantity: 1,
			}],
			mode: 'subscription',
			success_url: `${url}/success/{CHECKOUT_SESSION_ID}`,
			cancel_url: `${url}/cancel`,
		}, function(err, checkout) {
			console.log(err, checkout)
			if (err) return Util.systemError(res)
			let payment = new Payment({
				user: req.user._id,
				checkout: checkout
			})
			res.json({
				status: 200,
				session: checkout.id
			})
		})
	})
}

exports.success = function(req, res, next) {
	let sessionId = req.params.id
	Payment({'checkout.id': sessionId}, function(err, checkout) {
		if (checkout) {
			// authenticate

			// display deployments


		} else {
			return Util.systemError(res)
		}
	})
}

exports.dashboard = function(req, res) {
	assets(req.user._id, function(assets) {
		var truthy = false
		for (var key in assets) {
			if (assets[key].length) {
				truthy = true
			}
		}

		if (truthy) {
			// render dashboard and send {status: html:}
    		let filepath = path.resolve('../views/partials/dashboard.ejs')
		    fs.readFile(filepath, 'utf-8', function(err, file) {
		        if (err) return Util.systemError(err, res)
		        let html = ejs.render(file, {
		            deployments: assets.deploys
		        })
		        return res.json({
		        	status: 200,
		        	html: html
		        })
			})
		} else {
			return res.json({status: 200})
		}
	})
}

exports.build = function(req, res) {

	let json = req.body
	let repo = new Repo({
		user: req.user._id,
		json: json
	})

	Port(function(port) {
		console.log('create on PORT:', port)
		let deploy = new Deploy({
			user: req.user._id,
			port: port
		})

		let filepath = `./s${port}/messenger.json`
		let directory = `./s${port}`
		console.log(1)
		Util.createSystemFolder(directory, function(err) {
			if (err) return Util.systemError(res)
			console.log(2)
			Util.writeFile(filepath, JSON.stringify(json), function(err) {
				if (err) return Util.systemError(res)
				console.log(3)
				// docker run --interactive --tty --rm -v ~/Desktop/myfoobar:/app/store ex0 /bin/sh
				let command = `docker run -v ${directory}:/app/store ex0 -c "python app.py"`
				Util.exec(command)
				res.json({status: 200})
			})
		})
	})
}

exports.deploy = function(req, res) {
	let type = req.body.type
	console.log(req.body)
	
}

/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const ejs = require('ejs')
const Auth = require('./auth')
const Mailer = require('../services/mailer')
const User = require('../models/user').User
const Repo = require('../models/repo').Repo
const Deploy = require('../models/deploy').Deploy
const Util = require('../lib/util')

exports.splash = function(req, res, next) {
	res.render('index', { 
		title: 'Messenger⇪',
		subtitle: 'FREE Messenger app. Deploy in seconds.'
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
		Repo.find({user: user._id}, function(err, repos) {
			repos = repos || []
			Deploy.find({user: user._id}, function(err, deploys) {
				deploys = deploys || []
		        Auth.tokenForUser(user._id, function(err, token) {
		            if (err) return Util.systemError(res)
		            var data = token.toObject()
		            res.json({
		            	status: 200,
		            	repos: repos,
		            	deployments: deploys,
		            	token: data.token
		            })
		        })
			})
		})
	})
}

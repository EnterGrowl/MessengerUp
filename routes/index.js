/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const Controller = require('./controller')

module.exports = function(express, passport) {
	let router = express.Router()

	router.all('/api/*',function(req, res, next) {
	    next()
	}, passport.authenticate('bearer', {
	    session : false
	}), function(req, res, next) {
	    next()
	})

	/* GET home page. */
	router.get('/', Controller.splash)
	router.get('/create', Controller.create)
	router.get('/success/:id', Controller.success)
	router.get('/api/dashboard', Controller.dashboard)

	/** POST get email */
	router.post('/email', Controller.email)
	router.post('/verify', Controller.verify)
	router.post('/api/checkout', Controller.checkout)
	router.post('/api/build', Controller.build)

	return router

}

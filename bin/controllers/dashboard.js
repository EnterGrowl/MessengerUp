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
const print = require('../../lib/print')
const secrets = require('../../.secrets.json')
const Mailer = require('../../services/mailer')
const Process = require('../../services/process')
const Util = require('../../lib/util')
const User = require('../../models/user').User
const Payment = require('../../models/payment').Payment
const Repo = require('../../models/repo').Repo
const Deploy = require('../../models/deploy').Deploy


function assets(_id, cb) {
	Repo.find({user: _id}, function(err, repos) {
		let _repos = repos.filter(function(r) { if (!r.deployed) return r })
		let _deploys = repos.filter(function(r) { if (r.deployed) return r })
		cb({
			repos: _repos,
			deploys: _deploys
		})
	})
}

module.exports = function(req, res) {
	assets(req.user._id, function(assets) {
		var truthy = false
		for (var key in assets) {
			if (assets[key].length) {
				truthy = true
			}
		}

		if (truthy) {
			// render dashboard and send {status: html:}
    		let filepath = path.resolve('./views/partials/dashboard.ejs')
		    fs.readFile(filepath, 'utf-8', function(err, file) {
		        if (err) return Util.systemError(err, res)
		        let html = ejs.render(file, {
		        	title: 'Messenger⇪ Dashboard',
		            deploys: assets.deploys,
		            repos: assets.repos
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

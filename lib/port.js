/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const Domain = require('../models/domain').Domain
const Random = require("random-js").Random

function getDomain(port, cb) {
	return Domain.findOne({
		address: port
	}, function(err, p) {
		if (err||p) return cb(true)
		return cb(null)
	})
}

function randomPort() {
	let random = new Random()
	return random.integer(10999, 11999) + '';
}

function findPort(cb) {
	let port = randomPort()
	return getDomain(port, function(found) {
		if (found) {
			return findPort(cb)
		} else {
			return cb(port)
		}
	})
}

module.exports = function(cb) {
	/**find open port to use**/
	return findPort(cb)
}

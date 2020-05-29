/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

function sendError(res, msg) {
	return res.status(400).json({
		status:400,
		message: msg
	})
}

exports.formatEmail = function(email) {
	return email.toLowerCase().replace(/ /g, '')
}

exports.systemError = function(err, res) {
	console.error(err)
	sendError(res, 'There was an error on our end, please try again at a later time.')
}

exports.verificationError = function(res) {
	sendError(res, 'Verification failed. Please try again.')
}
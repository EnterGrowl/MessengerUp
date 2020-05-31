/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

function sendError(res, msg, code=400) {
	return res.status(code).json({
		status: code,
		message: msg
	})
}

exports.formatEmail = function(email) {
	return email.toLowerCase().replace(/ /g, '')
}

exports.accountTypeError = function(res) {
	sendError(res, 'Please select type of account to continue.')
}

exports.authError = function(err, msg) {
	// only on system errors (others are auth errors)
	if (err) {
		console.error(err)
	}
	return {
		status: 403,
		message: msg
	}
}

exports.systemError = function(err, res) {
	console.error(err)
	sendError(res, 'There was an error on our end, please try again at a later time.')
}

exports.verificationError = function(res) {
	sendError(res, 'Verification failed. Please try again.')
}

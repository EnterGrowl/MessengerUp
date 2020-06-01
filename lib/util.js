/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const fs = require('fs')
const path = require('path')
const process = require('child_process')


function sendError(res, msg, code=400) {
	return res.status(code).json({
		status: code,
		message: msg
	})
}

function preErrorCallback(err, cb) {
	if (err) console.error(err)
	return cb()
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


exports.exec = function(command) {
	let spawn = process.spawn
	let child = spawn(command)

	child.stdout.on('data', (data) => {
	  console.log(`stdout: ${data}`)
	})

	child.stderr.on('data', (data) => {
	  console.error(`stderr: ${data}`)
	})

	child.on('close', (code) => {
	  console.log(`child process exited with code ${code}`)
	  child.kill()
	})

}

exports.createSystemFolder = function(__path, cb) {
	let _path = path.resolve(__path)
	fs.mkdir(_path, {
		recursive: true
	}, function(err) {
		return preErrorCallback(err, cb)
	})
}

exports.deleteSystemFolder = function(__path, cb) {
	let _path = path.resolve(__path)
	fs.rmdir(_path, {
		recursive: true
	}, function(err) {
		return preErrorCallback(err, cb)
	})
}

exports.writeFile = function(__path, text, cb) {
	let _path = path.resolve(__path)
	fs.writeFile(_path, text, function(err) {
		return preErrorCallback(err, cb)
	})
}

exports.removeFile = function(__path, cb) {
	let _path = path.resolve(__path)
	fs.unlink(_path, function(err) {
		return preErrorCallback(err, cb)
	})
}
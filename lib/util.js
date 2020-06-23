/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const fs = require('fs')
const path = require('path')
const _process = require('child_process')
const Repo = require('../models/repo').Repo
const Critical = require('../models/critical').Critical
const Deploy = require('../models/deploy').Deploy
const Port = require('../services/port')

function sendError(res, msg, code=400) {
	return res.status(code).json({
		status: code,
		message: msg
	})
}

function logErrorCallback(err, cb) {
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

exports.buildError = function(session, msg, res) {
	console.error(msg)
	let err = new Critical({
		session: session,
		message: msg
	})
	err.save()
	sendError(res, 'We encountered an error processing your deployment. We have been notified and you can email us (info@messengerup.com).')
}

exports.systemError = function(err, res) {
	console.error(err)
	sendError(res, 'There was an error on our end, please try again at a later time.')
}

exports.verificationError = function(res) {
	sendError(res, 'Verification failed. Please try again.')
}

exports.exec = function(command, cb) {
	let spawn = _process.spawn
	let child = spawn(command, {
		shell: true
	})

	child.stdout.on('data', (data) => {
	  console.log(`stdout: ${data}`)
	})

	child.stderr.on('data', (data) => {
	  console.error(`ERROR ON: ${command}`)
	  console.error(new Date())
	  console.error(`stderr: ${data}`)
	})

	child.on('close', (code) => {
	  console.log(`child process exited with code ${code}`)
	  child.kill()
	  cb(code)
	})
}

exports.createSystemFolder = function(__path, cb) {
	let _path = path.resolve(__path)
	fs.mkdir(_path, {
		recursive: true
	}, function(err) {
		return logErrorCallback(err, cb)
	})
}

exports.deleteSystemFolder = function(__path, cb) {
	let _path = path.resolve(__path)
	fs.rmdir(_path, {
		recursive: true
	}, function(err) {
		return logErrorCallback(err, cb)
	})
}

exports.writeFile = function(__path, text, cb) {
	let _path = path.resolve(__path)
	fs.writeFile(_path, text, function(err) {
		return logErrorCallback(err, cb)
	})
}

exports.removeFile = function(__path, cb) {
	let _path = path.resolve(__path)
	fs.unlink(_path, function(err) {
		return logErrorCallback(err, cb)
	})
}

exports.defaultPortConfig = function(options, cb) {
	let that = this
	let user = options.user
	let json = options.json
	let deployed = options.deployed

	let repo = new Repo({
		user: user,
		json: json,
		deployed: deployed
	})

	if (options.session) {
		repo.session = options.session
		Repo.findOne({session: options.session}, function(err, repo) {
			if (repo) {
				return cb(true)
			} else {
				return _exec()
			}
		})
	} else {
		_exec()
	}

	function _exec() {
		repo.save(function(err) {
			if (err) return cb(true)
			Port(function(port) {
				let filepath = `./builds/${port}/messenger.json`
				let directory = path.resolve(`./builds/${port}`)
				that.createSystemFolder(directory, function(err) {
					if (err) return cb(err)
					that.writeFile(filepath, JSON.stringify(json), function(err) {
						if (err) return cb(err)
						let command = `docker run --interactive --env PORT=${port} --mount 'type=bind,src=${directory},dst=/app/store' --rm ex0 /bin/sh -c 'python app.py'`
						that.exec(command, function(err) {
							// if build directory proceed else send err
							return cb(err, {
								port: port,
								path: directory,
								repo: repo._id
							})
						})
					})
				})
			})
		})
	}
}

exports.nonceFunc = function() {}

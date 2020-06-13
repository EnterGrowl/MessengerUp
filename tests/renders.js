/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const assert = require('assert')
const ejs = require('ejs')
const fs = require('fs')
const path = require('path')

function testNGINXConf(cb) {
 	let filepath = path.resolve('./builds/tpl.conf')
	fs.readFile(filepath, 'utf-8', function(err, file) {
	    if (err) return cb(err)
	    let options = {
	    	cert: 'foo',
	    	port: '123'
	    }
	    assert(err === null)
		cb()
	})
}

let tests = [
	testNGINXConf
]

function async(arg) {
	if (arg) {
		arg(function(e) {
			if (e) {
				console.error(e)
				process.exit(1)
			}
			async(tests.shift())
		})
	} else {
		process.exit(0)
	}
}

async(tests.shift())
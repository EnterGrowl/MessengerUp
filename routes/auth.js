/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const Token = require('../models/token').Token
const crypto = require('crypto')

/** @module authentication token for user */
exports.tokenForUser = function(_id, cb) {
    crypto.randomBytes(128, function(err, buf) {
        if (err) return cb(err)
        var token = new Token()
        token.user = _id
        token.token = crypto.createHmac(
            'sha384', buf.toString('base64')).update(Date.now().toString(16)).digest('hex')
        token.save(function(err) {
            cb(err, token)
        })
    })
}
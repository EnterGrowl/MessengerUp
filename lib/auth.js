/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const BearerStrategy = require('passport-http-bearer').Strategy
const Token = require('../models/token').Token
const User = require('../models/user').User
const Util = require('./util')

module.exports = function(passport) {
    passport.use('bearer', new BearerStrategy(function(token, callback) {
        if (token) {
            console.log('query token', token)
            Token.findOne({
                token: token
            }, function(err, token) {
                // is token ?
                console.log(err, token)
                if (err) return callback(Util.authError(err, 'System error. We\'re working on it'))
                if (!token) return callback(Util.authError(null, 'Invalid token.'))
                // is expired ?
                var d = new Date()
                if (token.expirationTime < d) return callback(Util.authError(null, 'Session expired. Please sign in.'))
                User.findOne({_id: token.user}, function(err, user) {
                    if (err) callback(Util.authError(err, 'System error. We\'re working on it'))
                    if (!user) return callback(Util.authError(null, 'We could not find your account! Please contact us.'))
                    callback(null, user, {
                        scope : '*',
                        accessToken : accessToken
                    })
                })
            })
        }
    }))
}

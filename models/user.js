/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const mongoose = require('mongoose')
const randomize = require('randomatic')

var User = new mongoose.Schema({
    email: {
        unique: true,
        required: true,
        type: String
    },
    type: {
        enum: ['basic', 'extended'],
        type: String
    },
    created: {
        type: Date,
        default: new Date()
    },
    pin: {
        type: String,
        default: new Date()
    },
    lastVisited: {
        type: Date,
        default: new Date()
    },
}, {
    versionKey: false
})

User.methods.setPIN = function() {
    this.pin = randomize('0', 4)
    this.save()
    return this.pin
}

User.statics.userFromEmail = function(email, cb) {
    return this.findOne({ email: email }).exec(cb)
}

User.statics.userForDashboard = function(email, cb) {
    return this.findOne()
        .populate('deploys repos')
        .exec(cb)
}

// before save, if not Stripe customer create
// process.env.MODE

exports.User = mongoose.model('User', User)

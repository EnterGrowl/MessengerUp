/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const mongoose = require('mongoose')
const Create = require('../services/certificate').create

var Cert = new mongoose.Schema({
  name: String,
  ports: {
    type: [String],
    default: []
  },
  domains: {
      type: [String],
      default: []
  },
  locked: {
      type: Boolean,
      default: false
  },
  created: {
    type: Date,
    default: new Date()
  },
}, {
  versionKey: false
})

Cert.set('toObject', {
  transform : function(doc, ret, options) {
    delete ret._id
    delete ret.user
  }
})

Cert.pre('save', function(next) {
  if (this.domains.length >= 90) {
    this.locked = true
    // create new cert
    Create()
  }
  next()
})

exports.Cert = mongoose.model('Cert', Cert)

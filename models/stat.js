/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const mongoose = require('mongoose')

var Stat = new mongoose.Schema({
  port: {
    type: String,
    required: true,
    index: true
  },
  payload: {
    type: String,
    required: true
  },
  // TODO: parse out date and value from payload
  created: {
    type: Date,
    default: new Date()
  },
}, {
  versionKey: false
})

Stat.set('toObject', {
  transform : function(doc, ret, options) {
    delete ret._id
  }
});

exports.Stat = mongoose.model('Stat', Stat)

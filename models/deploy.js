/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const mongoose = require('mongoose')

var Deploy = new mongoose.Schema({
  user: {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'User'
  },
  port: String,
  created: {
    type: Date,
    default: new Date()
  },
}, {
  versionKey: false
})

Deploy.set('toObject', {
  transform : function(doc, ret, options) {
    delete ret._id
    delete ret.user
  }
});

exports.Deploy = mongoose.model('Deploy', Deploy)

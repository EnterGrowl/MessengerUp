/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const mongoose = require('mongoose')

var Domain = new mongoose.Schema({
  deploy: {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'Deploy'
  },
  address: String,
}, {
  versionKey: false
})

Domain.set('toObject', {
  transform : function(doc, ret, options) {
    delete ret._id
    delete ret.deploy
  }
});

exports.Domain = mongoose.model('Domain', Domain)

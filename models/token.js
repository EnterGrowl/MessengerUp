/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const mongoose = require('mongoose')

var Token = new mongoose.Schema({
  token: {
    type : String,
    unique : true
  },
  user: {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User'
  },
  expirationTime: {
    type: Date,
    default: new Date().setMonth(new Date().getMonth() + 3)
  },
  created: {
    type : Date,
    'default' : Date.now()
  }
}, {
  versionKey : false
});

exports.Token = mongoose.model('Token', Token)
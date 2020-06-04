/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const mongoose = require('mongoose')

var Critical = new mongoose.Schema({
  message: String,
  session: String,
  created: {
    type : Date,
    'default' : Date.now()
  }
}, {
  versionKey : false
});

exports.Critical = mongoose.model('Critical', Critical)
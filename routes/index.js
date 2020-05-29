/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const Controller = require('./controller')
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', Controller.splash)

/** POST get email */
router.post('/email', Controller.email)
router.post('/verify', Controller.verify)

module.exports = router

/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const secrets = require('./.secrets.json')
const createError = require('http-errors')
const express = require('express')
const path = require('path')
const logger = require('morgan')
const indexRouter = require('./routes/index')
const mongoose = require('mongoose')
require('dotenv').config()

const mongooseOptions = {
    useNewUrlParser: true,
    autoIndex: false,
    poolSize: 10,
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
    useUnifiedTopology: true
}

const connectionKey = `MONGO_${process.env.MODE}`
const connectionURL = secrets[connectionKey]
mongoose.connect(connectionURL, mongooseOptions)

let app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = process.env.MODE === 'DEV' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app

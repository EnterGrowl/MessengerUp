/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const aws = require('aws-sdk')
const ejs = require('ejs')
const fs = require('fs')
const path = require('path')
const secrets = require('../.secrets.json')
const ses = new aws.SESV2({ 
  "accessKeyId": secrets.SES.AWS_KEY, 
  "secretAccessKey": secrets.SES.AWS_SECRET, 
  "region": secrets.SES.AWS_REGION 
})

const origin = 'noreply@messengerup.com'

/**
 *	EMAIL SERVICE
 *	@param options: object
 *		- subject: String
 *		- html: String
 *		- text: String
 *		- to: [String]
 *	@param cb: function
 */
function doSendEmail(options, cb) {
    var params = {
        Destination: {
            ToAddresses: options.to
        },
        Content: {
            Simple: {
                Body: {
                    Html: {
                        Data: options.html
                    },
                    Text: {
                        Data: options.text
                    }
                },
                Subject: {
                    Data: options.subject
                }
            }
        },
        FromEmailAddress: origin,
    };     
    return ses.sendEmail(params, function(err, msg) {
        console.log(err, msg)
        cb(err, msg)
    });
}

exports.verifyPIN = function(email, pin, cb) {
    let filepath = path.resolve('./views/emails/pin.ejs')
    fs.readFile(filepath, 'utf-8', function(err, file) {
        if (err) return cb(err)
        let options = {
            title: 'Your verification PIN',
            subtitle: pin
        }
        let html = ejs.render(file, options)
        let text = `Your verification PIN is ${pin}`
        return doSendEmail({
            to: [email],
            subject: 'Please validate your account',
            html: html,
            text: text
        }, cb)
    })
}

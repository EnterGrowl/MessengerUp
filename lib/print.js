/**
 * Copyright 2020, MessengerUp All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

module.exports = function(num, char, message) {
	console.log(Array(num).join(char))
	if (!message) return
	console.log(message)
	console.log(Array(num).join(char))
	console.log('\n')
}
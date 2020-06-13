makeRequestWithHeaders = function(url, body, cb, skip) {
    if (url.indexOf('/api/')>-1&&!window.localStorage.getItem('token')) {
        if (cb) cb({ status: 403 })
        return
    }
    var method = body&&Object.keys(body).length ? 'POST' : 'GET'
    console.log(new Array(40).join('* '))
    console.log('makeRequestWithHeaders', method, 'to:', url)
    console.log(new Date())
    if (!skip) preloader.show()
    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP")
    xhr.open(method, url, true)
    var token = getToken()
    xhr.setRequestHeader("Authorization", ('Bearer ' + token))
    if (body) {
        xhr.setRequestHeader("Content-type","application/json")
        xhr.send(JSON.stringify(body))
    } else {
        xhr.send()
    }
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (!skip) preloader.hide()
            var response = xhrResponseFormat(xhr, this.status)
            if (this.status === 403) {
                setToken('')
                alert('Please login and verify to continue.')
            }
            
            if (cb) return cb(response)
        }
    }
}

xhrResponseFormat = function(xhr, status) {
    var response
    try {
        response = JSON.parse(xhr.responseText)
    } catch (e) {
        response = {
            status: status,
            text: xhr.responseText
        }
    }

    return response
}

resetCache = function() {
    localStorage.setItem('cached-object', '')
}

setCache = function(json) {
    localStorage.setItem('cached-object', JSON.stringify(json))
}

getCache = function() {
    return JSON.parse(localStorage.getItem('cached-object'))
}

resetToken = function() {
    localStorage.setItem('token', '')
}

setToken = function(token) {
    localStorage.setItem('token', token)
}

getToken = function() {
    return localStorage.getItem('token')
}

resetAuthenticated = function() {
    localStorage.setItem('authenticated', '')
}

setAuthenticated = function() {
    localStorage.setItem('authenticated', true)
}

getAuthenticated = function() {
    return localStorage.getItem('authenticated')
}

downloadFile = function(file, name, type) {
    var blob = null
    /** base64 to blob, else just blob */
    var byteCharacters = atob(file)
    var byteNumbers = new Array(byteCharacters.length)
    for (var i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    var byteArray = new Uint8Array(byteNumbers)
    blob = new Blob([byteArray], {type: type})
    saveAs(blob, name)
}

initSequence = function(show) {
    $('.splash').hide()
    $('.log-button').hide()
    $('#setConfiguration').hide()
    $('#step2').hide()
    $('#generator').show()
    $('#2').show()
    $('#step1').show()
}

showSplash = function(noLogin) {
    $('#generator').hide()
    $('.log-button').hide()
    $('.splash').show()
    if (!noLogin) {
        $('.login').show()
        $('.login').off().on('click', authLogin)
    }
    $('#preloader').hide()
}

showVerify = function() {
    $('.onboard').hide()
    $('#verify').show()
}

showWelcome = function() {
    $('.onboard').hide()
    $('#welcome').show()   
}

showDashboard = function(html) {
    var newHTML = document.open('text/html', 'replace');
    newHTML.write(html);
    newHTML.close();
}

authLogin = function(e, root) {
    console.log('make authLogin')
    // if token present try logging in dashboard or go to login
    makeRequestWithHeaders('/api/dashboard', null, function(response) {
        if (response.status === 200) {
            initSequence()
            if (response.html) {
                showDashboard(response.html)
            } else {
                showWelcome()
            }
        } else {
            if (response.status === 403 && !root) {
                initSequence()
                showVerify()
                initVerify()
            }
        }
    }, true)
}

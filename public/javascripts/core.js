makeRequestWithHeaders = function(url, body, cb) {
    if (url.indexOf('/api/')>-1&&!window.localStorage.getItem('token')) return
    var method = body&&Object.keys(body).length ? 'POST' : 'GET'
    console.log(new Array(40).join('* '))
    console.log('makeRequestWithHeaders', method, 'to:', url)
    console.log(new Date())
    preloader.show()
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
            preloader.hide()
            var response = xhrResponseFormat(xhr)
            if (cb) cb(response)
        }
    }
}

xhrResponseFormat = function(xhr) {
    var response
    try {
        response = JSON.parse(xhr.responseText)
    } catch (e) {
        response = xhr.responseText
    }

    return response
}

setToken = function(token) {
    localStorage.setItem('token', token)
}

getToken = function() {
    localStorage.getItem('token')
}
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
            if (this.status == 403) {
                alert('Operation timeout. Please start again.')
                if (body) {
                    localStorage.setItem('cached-object', JSON.stringify(body))
                }
                window.location.assign('/')
                return
            }
            preloader.hide()
            var response = xhrResponseFormat(xhr, this.status)
            if (cb) cb(response)
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

setToken = function(token) {
    localStorage.setItem('token', token)
}

getToken = function() {
    return localStorage.getItem('token')
}

downloadFile = function(file, name, type) {

    var blob = null;

    try {
        
        /** base64 to blob, else just blob */
        var byteCharacters = atob(file);
        var byteNumbers = new Array(byteCharacters.length);
        for (var i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        };
        var byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], {type: type});
        saveAs(blob, name);

    } catch(e) {

        blob = new Blob([file], {type: type}),
        saveAs(blob, name);
    }
};
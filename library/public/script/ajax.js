function ajaxRequest(method, url, callback, error, data) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if(this.readyState === 4) {
            if(this.status === 200) {
                if(callback) callback(this.responseText);
            } else {
                if(error) error(this.status);
            }
        }
    };
    xhttp.open(method, url, true);
    if(data)
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(data);
}
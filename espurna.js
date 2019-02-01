var espurnaHostField = new mdc.textField.MDCTextField(document.getElementById('espurnaHost'));
espurnaHostField.value = getCookie('host');

var importFlowDialog = new mdc.dialog.MDCDialog(document.getElementById('import-flow-dialog'));
var importFlowText = new mdc.textField.MDCTextField(document.getElementById('import-flow-text-div'))
importFlowDialog.listen('MDCDialog:closed', (event) => {
    if (event.detail.action == 'accept')
        loadGraph(JSON.parse(importFlowText.value));
});

var exportFlowDialog = new mdc.dialog.MDCDialog(document.getElementById('export-flow-dialog'));
var exportFlowText = new mdc.textField.MDCTextField(document.getElementById('export-flow-text-div'))

document.getElementById('import-flow-button').addEventListener('click', function() {
    importFlowDialog.open();
});

document.getElementById('export-flow-button').addEventListener('click', function() {
    exportFlowText.value = JSON.stringify(window.getGraph(), null, 2);
    exportFlowDialog.open();
});

function loadJSON(page, message, callback) {
    var loading = document.getElementById("loading");
    var loadingMessage = document.getElementById("loading-message");
    loadingMessage.innerHTML = message;
    loading.style.display = "visible";

    var xhr = new XMLHttpRequest();
    xhr.open('GET', page, true);
    xhr.withCredentials = true;

    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var text = xhr.responseText;
                callback(text != '' ? JSON.parse(text) : {});
            } else {
                alert('Error fetching page ' + page + ' (' + xhr.status + ': ' + xhr.statusText + ')');
            }

            // Remove loading message
            loading.style.display = "none";
        }
    };
    xhr.onerror = function (e) {
        // Remove loading message
        loading.style.display = "none";
        alert('Error fetching page ' + page + ' (' + xhr.status + ': ' + xhr.statusText + ')');
    };

    xhr.send(null);
}

document.getElementById('load-flow-button').addEventListener('click', function() {
    var host = getHost();
    loadJSON(host + 'flow_library', 'loading library...', function(library) {
        window.loadLibrary(library);

        loadJSON(host + 'flow', 'loading flow...', function(flow) {
            loadGraph(flow);
        });
    });
});

document.getElementById('save-flow-button').addEventListener('click', function() {
    var json = JSON.stringify(window.getGraph());

    var boundary = 'nVenJ7H4puv'
    var body = '--' + boundary
             + '\r\nContent-Disposition: form-data; name=flow.json'
             + '\r\nContent-type: text/json'
             + '\r\n\r\n' + json + '\r\n';
    body += '--' + boundary + '--\r\n'

    var xhr = new XMLHttpRequest();
    xhr.open('POST', getHost() + 'flow', true)
    xhr.withCredentials = true;

    xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary)
//    xhr.setRequestHeader('Content-Length', body.length) // Chrome error: Refused to set unsafe header 'Content-Length'
    xhr.send(body)
});

document.getElementById('restart-button').addEventListener('click', function() {
    if (confirm('OK to restart device?')) {
        var socket = new WebSocket(getHost('ws') + 'ws');
        socket.onopen = function() {
            socket.send('{"action": "reboot"}');
        };
    }
});

function getHost(protocolParam) {
    var protocol = typeof protocolParam !== 'undefined' ? protocolParam : 'http';

    var page = espurnaHostField.value;
    setCookie('host', page);

    if (!page.endsWith('/'))
        page += '/';

    var protocolIndex = page.indexOf('://');
    if (protocolIndex < 0)
        page = protocol + '://' + page;
    else if (typeof protocolParam !== 'undefined') // not default protocol
        page = protocol + page.substring(protocolIndex);

    return page;
}

function setCookie(name, value) {
    document.cookie = name + "=" + (value || "")  + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

var espurnaHostField = new mdc.textField.MDCTextField(document.getElementById('espurnaHost'));
espurnaHostField.value = getCookie('host');

var importFlowDialog = new mdc.dialog.MDCDialog(document.getElementById('import-flow-dialog'));
var importFlowText = new mdc.textField.MDCTextField(document.getElementById('import-flow-text-div'))
importFlowDialog.listen('MDCDialog:closed', (event) => {
    if (event.detail.action == 'accept') {
        loadGraph(JSON.parse(importFlowText.value));
        importFlowText.value = '';
    }
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
        // values could be put out of them component to special holder property
        if ('_values' in library) {
            var values = library['_values'];
            delete library['_values'];
            for (var i = 0; i < values.length; i++) {
                var item = values[i];
                var properties = library[item.component].properties;
                var property = properties.find(function(p) {return p.name == item.property});
                property.values = item.values;
            }
        }
        window.loadLibrary(library);

        loadJSON(host + 'flow', 'loading flow...', function(flow) {
            loadGraph(looseFlow(flow));
        });
    });
});

document.getElementById('save-flow-button').addEventListener('click', function() {
    var json = JSON.stringify(compactFlow(window.getGraph()));

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
        try {
            var socket = new WebSocket(getHost('ws') + 'ws');
            socket.onerror = function(e) {
              alert('Reboot error: ' + e.message);
            };
            socket.onopen = function() {
                socket.send('{"action": "reboot"}');
            };
        } catch (e) {
            alert('Reboot error: ' + e);
        }
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

function compactFlow(obj) {
    return process(obj,
        {
            'processes': 'P',
            'component': 'C',
            'metadata': 'M',
            'label': 'L',
            'properties': 'R',
            'connections': 'X',
            'src': 'S',
            'tgt': 'T',
            'process': 'I',
            'port': 'N',
        },
        ['caseSensitive', 'inports', 'outports', 'groups', 'width', 'height', 'route']
    );
}

function looseFlow(obj) {
    return process(obj,
        {
            'P': 'processes',
            'C': 'component',
            'M': 'metadata',
            'L': 'label',
            'R': 'properties',
            'X': 'connections',
            'S': 'src',
            'T': 'tgt',
            'I': 'process',
            'N': 'port',
        },
        []
    );
}

function process(obj, replacements, removes) {
    var result = {};

    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (removes.includes(property))
                continue; // skip removed

            var val = obj[property];
            if (val == null)
                continue;

            if (property in replacements)
                property = replacements[property];

            if (val.constructor === Array) {
                for (var i = 0; i < val.length; i++) {
                    val[i] = process(val[i], replacements, removes);
                }
            } else if (typeof val == 'object') {
                val = process(val, replacements, removes);
                if (Object.keys(val).length === 0)
                    continue; // skip empty
            }

            result[property] = val;
        }
    }
    return result;
}

"use strict";
var fbpGraph = window.TheGraph.fbpGraph;

var componentsListElement = document.getElementById('components-list');
var componentList = new mdc.list.MDCList(componentsListElement);
componentList.singleSelection = true;
componentsListElement.addEventListener('click', addNode);

var editComponentDialog = new mdc.dialog.MDCDialog(document.getElementById('edit-component-dialog'));
editComponentDialog.listen('MDCDialog:closed', (event) => {
    if (event.detail.action == 'accept')
        updateNode();
});

function addNode() {
    var component = Object.keys(appState.library)[componentList.selectedIndex];

    var id = Math.round(Math.random() * 100000).toString(36);
    var metadata = {
        label: component,
        x: 100,
        y: 100
    };
    appState.graph.addNode(id, component, metadata);
}

var editedItem;
function editNode(graph, itemKey, item) {
    var component = appState.library[item.component];

    document.getElementById('edit-component-dialog-title').innerHTML = item.metadata.label;

    var dialogContent = document.getElementById('edit-component-dialog-content');
    while (dialogContent.firstChild) dialogContent.removeChild(dialogContent.firstChild);

    var labelInput = addInput(dialogContent, 'Label', 'componentLabel', 'string');
    labelInput.value = item.metadata.label;

    for (var i = 0; i < component.properties.length; i++) {
        var property = component.properties[i];
        var input = addInput(dialogContent, property.name, 'componentProperty-' + property.name, property.type);
        input.value = item.metadata.properties ? item.metadata.properties[property.name] : '';
    }

    editedItem = item;
    editComponentDialog.open();
}

function updateNode() {
    var component = appState.library[editedItem.component];
    var properties = editedItem.metadata.properties
    if (!properties) properties = editedItem.metadata.properties = {};

    editedItem.metadata.label = document.getElementById('componentLabel').value;

    for (var i = 0; i < component.properties.length; i++) {
        var property = component.properties[i].name;
        var input = document.getElementById('componentProperty-' + property);
        properties[property] = input.value;
    }

    appState.graph.emit('changeNode', editedItem);
    editedItem = null;
}

function addInput(parent, name, id, type) {
    var mainDiv = document.createElement('div');
    {
        mainDiv.id = id + 'Div';
        mainDiv.className = 'mdc-text-field mdc-text-field--outlined';

        var input = document.createElement('input');
        {
            input.type = type == 'number' ? 'number' : 'text';
            input.id = id;
            input.className = 'mdc-text-field__input';
        }
        mainDiv.appendChild(input);

        var outlineDiv = document.createElement('div');
        {
            outlineDiv.className = 'mdc-notched-outline';

            var outlineDivLeading = document.createElement('div');
            {
                outlineDivLeading.className = 'mdc-notched-outline__leading';
            }
            outlineDiv.appendChild(outlineDivLeading);

            var outlineDivNotch = document.createElement('div');
            {
                outlineDivNotch.className = 'mdc-notched-outline__notch';
                var label = document.createElement('label');
                {
                    label.for = id;
                    label.className = 'mdc-floating-label';
                    label.innerHTML = name;
                }
                outlineDivNotch.appendChild(label);
            }
            outlineDiv.appendChild(outlineDivNotch);

            var outlineDivTrailing = document.createElement('div');
            {
                outlineDivTrailing.className = 'mdc-notched-outline__trailing';
            }
            outlineDiv.appendChild(outlineDivTrailing);
        }
        mainDiv.appendChild(outlineDiv);
    }
    parent.appendChild(mainDiv);

    return new mdc.textField.MDCTextField(document.getElementById(id + 'Div'));
}

function deleteNode(graph, itemKey, item) {
    graph.removeNode(itemKey);
}
function deleteEdge(graph, itemKey, item) {
    graph.removeEdge(item.from.node, item.from.port, item.to.node, item.to.port);
}
var contextMenus = {
    main: null,
    selection: null,
    nodeInport: null,
    nodeOutport: null,
    graphInport: null,
    graphOutport: null,
    edge: {
        icon: "long-arrow-right",
        s4: {
            icon: "trash-o",
            iconLabel: "delete",
            action: deleteEdge
        }
    },
    node: {
        n4: {
            icon: "edit",
            iconLabel: "edit",
            action: editNode
        },
        s4: {
            icon: "trash-o",
            iconLabel: "delete",
            action: deleteNode
        },
    }
};

var appState = {
    graph: new fbpGraph.Graph(),
    library: {},
    theme: 'light',
};

function renderApp() {
    var editor = document.getElementById('editor');
    editor.className = 'the-graph-' + appState.theme;

    var props = {
        width: window.innerWidth - componentsListElement.offsetWidth,
        height: window.innerHeight,
        graph: appState.graph,
        library: appState.library,
        menus: contextMenus
    }

    var editor = document.getElementById('editor');
    editor.width = props.width;
    editor.height = props.height;
    var element = React.createElement(TheGraph.App, props);
    ReactDOM.render(element, editor);
}

renderApp(); // initial
// Follow changes in window size
window.addEventListener("resize", renderApp);

window.loadLibrary = function (library) {
    while (componentsListElement.firstChild) componentsListElement.removeChild(componentsListElement.firstChild);

    appState.library = library;

    for (var key in library) {
        var li = document.createElement('li');
        {
            li.className = 'mdc-list-item';

            var iconSpan = document.createElement('span')
            {
                iconSpan.className = 'mdc-list-item__graphic fa fa-' + library[key].icon;
                iconSpan.areaHidden = true;
            }
            li.appendChild(iconSpan);

            var span = document.createElement('span')
            {
                span.className = 'mdc-list-item__text';
                span.appendChild(document.createTextNode(key))
            }
            li.appendChild(span);
        }
        componentsListElement.appendChild(li);
    }
};

window.loadGraph = function (json) {
    // create mock components in library for unknown components
    for (var id in json.processes) {
        var component = json.processes[id].component;
        if (!(component in appState.library)) {
            var metadata = json.processes[id].metadata
            var properties = metadata.properties ? Object.keys(metadata.properties) : [];
            appState.library[component] = {
                name: component,
                icon: 'question',
                inports: [],
                outports: [],
                properties: properties.map(function(p) {return {name: p, type: 'any'};})
            };
        }
    }

    fbpGraph.graph.loadJSON(json, function(err, graph){
        if (err) {
            alert("error loading graph: " + err.toString());
            return;
        }
        appState.graph = graph;
        appState.graph.on('endTransaction', renderApp); // graph changed
        renderApp();
    });
};

window.getGraph = function () {
    return appState.graph.toJSON();
};

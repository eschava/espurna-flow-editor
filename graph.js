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
        var value = item.metadata.properties ? item.metadata.properties[property.name] : '';
        if (property.type == 'bool') {
            var checkbox = addCheckbox(dialogContent, property.name, 'componentProperty-' + property.name);
            checkbox.checked = value;
        } else if (property.type == 'list') {
            var combobox = addCombobox(dialogContent, property.name, 'componentProperty-' + property.name, property.values);
            combobox.value = value;
        } else {
            var input = addInput(dialogContent, property.name, 'componentProperty-' + property.name, property.type);
            input.value = value;
        }
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
        var property = component.properties[i];
        var input = document.getElementById('componentProperty-' + property.name);
        properties[property.name] = property.type == 'bool' ? input.checked : input.value;
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

function addCheckbox(parent, name, id) {
    var mainDiv = document.createElement('div');
    {
        mainDiv.className = 'mdc-form-field';

        var checkboxDiv = document.createElement('div');
        {
            checkboxDiv.className = 'mdc-checkbox';
            checkboxDiv.id = id + 'Div';

            var input = document.createElement('input');
            {
                input.type = 'checkbox';
                input.id = id;
                input.className = 'mdc-checkbox__native-control';
            }
            checkboxDiv.appendChild(input);

            var backgroundDiv = document.createElement('div');
            {
                backgroundDiv.className = 'mdc-checkbox__background';

                var svg = document.createElement('svg');
                {
                    svg.className = 'mdc-checkbox__checkmark';
                    svg.setAttribute('viewBox', '0 0 24 24');

                    var path = document.createElement('path');
                    {
                        path.className = 'mdc-checkbox__checkmark-path';
                        path.setAttribute('fill', 'none');
                        path.setAttribute('d', 'M1.73,12.91 8.1,19.28 22.79,4.59');
                    }
                    svg.appendChild(path);
                }
                backgroundDiv.appendChild(svg);

                var mixedmarkDiv = document.createElement('div');
                {
                    mixedmarkDiv.className = 'mdc-checkbox__mixedmark';
                }
                backgroundDiv.appendChild(mixedmarkDiv);
            }
            checkboxDiv.appendChild(backgroundDiv);
        }
        mainDiv.appendChild(checkboxDiv);

        var label = document.createElement('label');
        {
            label.for = id;
            label.innerHTML = name;
        }
        mainDiv.appendChild(label);
    }
    parent.appendChild(mainDiv);

    return new mdc.checkbox.MDCCheckbox(document.getElementById(id + 'Div'));
}

function addCombobox(parent, name, id, values) {
    var mainDiv = document.createElement('div');
    {
        mainDiv.className = 'mdc-select mdc-select--outlined';
        mainDiv.id = id + 'Div';

        var input = document.createElement('input');
        {
            input.type = 'hidden';
            input.name = id;
            input.id = id;
        }
        mainDiv.appendChild(input);

        var i = document.createElement('i');
        {
            i.className = 'mdc-select__dropdown-icon';
        }
        mainDiv.appendChild(i);

        var textDiv = document.createElement('div');
        {
            textDiv.className = 'mdc-select__selected-text';
        }
        mainDiv.appendChild(textDiv);

        var menuDiv = document.createElement('div');
        {
            menuDiv.className = 'mdc-select__menu mdc-menu mdc-menu-surface demo-width-class';

            var ul = document.createElement('ul');
            {
                ul.className = 'mdc-list';

                var li = document.createElement('li');
                {
                    li.className = 'mdc-list-item mdc-list-item--selected';
                    li.setAttribute('data-value', '');
                    li.setAttribute('aria-selected', 'true');
                }
                ul.appendChild(li);

                for (var value in values) {
                    var li = document.createElement('li');
                    {
                        li.className = 'mdc-list-item';
                        li.setAttribute('data-value', value);
                        li.innerHTML = value;
                    }
                    ul.appendChild(li);
                }
            }
            menuDiv.appendChild(ul);
        }
        mainDiv.appendChild(menuDiv);

        var notchedDiv = document.createElement('div');
        {
            notchedDiv.className = 'mdc-notched-outline';

            var notchedLeadingDiv = document.createElement('div');
            {
                notchedLeadingDiv.className = 'mdc-notched-outline__leading';
            }
            notchedDiv.appendChild(notchedLeadingDiv);

            var notchedMainDiv = document.createElement('div');
            {
                notchedMainDiv.className = 'mdc-notched-outline__notch';

                var label = document.createElement('label');
                {
                    label.className = 'mdc-floating-label';
                    label.innerHTML = name;
                }
                notchedMainDiv.appendChild(label);
            }
            notchedDiv.appendChild(notchedMainDiv);

            var notchedTrailingDiv = document.createElement('div');
            {
                notchedTrailingDiv.className = 'mdc-notched-outline__trailing';
            }
            notchedDiv.appendChild(notchedTrailingDiv);
        }
        mainDiv.appendChild(notchedDiv);
    }
    parent.appendChild(mainDiv);

    return new mdc.select.MDCSelect(document.getElementById(id + 'Div'));
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

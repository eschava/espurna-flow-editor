"use strict";
var fbpGraph = window.TheGraph.fbpGraph;

var controlsElement = document.getElementById('controls');
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

    showInfo(item.component);
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
        } else if (property.type == 'any') {
            var tuple = addMultiInput(dialogContent, property.name, 'componentProperty-' + property.name);
            if (typeof value == 'number') {
                tuple.type.selectedIndex = Number.isInteger(value) ? 1 : 2;
                tuple.value.value = value;
            } else if (typeof value == 'boolean') {
                tuple.type.selectedIndex = value ? 3 : 4;
            } else {
                tuple.type.selectedIndex = 0;
                tuple.value.value = value;
            }
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
        properties[property.name] = property.type == 'bool' ? input.checked :
                                    property.type == 'int' ? parseInt(input.value) :
                                    property.type == 'double' ? parseFloat(input.value) :
                                    property.type == 'any' ? parseMultiValue(input.value, document.getElementById('componentProperty-' + property.name + 'Type').value) :
                                    input.value;
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
            input.type = type == 'int' /*|| type == 'double'*/ ? 'number' : 'text';
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

                for (var i = 0; i < values.length; i++) {
                    var value = values[i];
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

function addMultiInput(parent, name, id) {
    var values = ['String', 'Integer', 'Double', 'True', 'False'];

    var typeMainDiv = document.createElement('div');
    {
        typeMainDiv.className = 'mdc-select mdc-select--outlined mdc-multi-input-type';
        typeMainDiv.id = id + 'TypeDiv';

        var input = document.createElement('input');
        {
            input.type = 'hidden';
            input.name = id + 'Type';
            input.id = id + 'Type';
        }
        typeMainDiv.appendChild(input);

        var i = document.createElement('i');
        {
            i.className = 'mdc-select__dropdown-icon';
        }
        typeMainDiv.appendChild(i);

        var textDiv = document.createElement('div');
        {
            textDiv.className = 'mdc-select__selected-text';
        }
        typeMainDiv.appendChild(textDiv);

        var menuDiv = document.createElement('div');
        {
            menuDiv.className = 'mdc-select__menu mdc-menu mdc-menu-surface demo-width-class';

            var ul = document.createElement('ul');
            {
                ul.className = 'mdc-list';

                for (var i in values) {
                    var value = values[i];
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
        typeMainDiv.appendChild(menuDiv);

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
        typeMainDiv.appendChild(notchedDiv);
    }
    parent.appendChild(typeMainDiv);

    var valueMainDiv = document.createElement('div');
    {
        valueMainDiv.id = id + 'ValueDiv';
        valueMainDiv.className = 'mdc-text-field mdc-text-field--outlined mdc-multi-input-value';

        var input = document.createElement('input');
        {
//            input.type = type == 'int' || type == 'double' ? 'number' : 'text';
            input.type = 'text';
            input.id = id;
            input.className = 'mdc-text-field__input';
        }
        valueMainDiv.appendChild(input);

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
        valueMainDiv.appendChild(outlineDiv);
    }
    parent.appendChild(valueMainDiv);

    var type = new mdc.select.MDCSelect(document.getElementById(id + 'TypeDiv'));
    var value = new mdc.textField.MDCTextField(document.getElementById(id + 'ValueDiv'));

    type.listen('MDCSelect:change', () => {
        var i = type.selectedIndex;
        value.disabled = i >= 3;
        if (i < 3) {
            var input = document.getElementById(id);
            input.type = i == 1 /*|| i == 2*/ ? 'number' : 'text';
        }
    });

    return {value: value, type: type};
}

function parseMultiValue(value, type) {
    if (type == 'Integer') return parseInt(value);
    if (type == 'Double') return parseFloat(value);
    if (type == 'True') return true;
    if (type == 'False') return false;
    return value;
}

function cloneNode(graph, itemKey, item) {
    var id = Math.round(Math.random() * 100000).toString(36);
    var metadata = JSON.parse(JSON.stringify(item.metadata)); // clone
    metadata.label += " copy";
    metadata.x += 20;
    metadata.y += 20;

    appState.graph.addNode(id, item.component, metadata);
}

function deleteNode(graph, itemKey, item) {
    graph.removeNode(itemKey);
}

function showNodeInfo(e) {
    var component = Object.keys(appState.library)[componentList.getListItemIndex_(e)];
    showInfo(component);
}

function showInfo(component) {
    var info = "<b>" + component + "</b><br/><br/>";
    info += getInfo(component);
    document.getElementById('description').innerHTML = info;
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
        w4: {
            icon: "edit",
            iconLabel: "edit",
            action: editNode
        },
        e4: {
            icon: "clone",
            iconLabel: "clone",
            action: cloneNode
        },
        s4: {
            icon: "trash-o",
            iconLabel: "delete",
            action: deleteNode
        },
    }
};

var appState = {
    graph: new fbpGraph.Graph('', {caseSensitive: true}),
    library: {},
    theme: 'light',
};

function renderApp() {
    var props = {
        width: window.innerWidth - componentsListElement.offsetWidth - controlsElement.offsetWidth,
        height: window.innerHeight,
        offsetX: componentsListElement.offsetWidth,
        graph: appState.graph,
        library: appState.library,
        menus: contextMenus
    }

    var editor = document.getElementById('editor');
    editor.className = 'the-graph-' + appState.theme;
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
            li.addEventListener('mouseenter', showNodeInfo);
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
    json.caseSensitive = true;

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

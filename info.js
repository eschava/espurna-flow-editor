function getInfo(component) {
    if (component == 'Start') {
        return 'Sends predefined value when system is started';
    }
    if (component == 'Debug') {
        return 'Outputs any received value to the console with [FLOW DEBUG] marker and custom prefix (optionally)';
    }
    if (component == 'Change') {
        return 'Always sends the predefined value when triggered';
    }
    if (component == 'Math') {
        return 'Sends the result of mathematical operation when both operands are received. ' +
               'After new value is send on any new value received.<br/>' +
               'Type of value is determined by first operand.<br/>' +
               'String values are always concatenated';
    }
    if (component == 'Compare') {
        return 'Compares received value with test value. Test value is specified by property or can be overridden ' +
               'using "Test" input. If result of comparison is true then received value is sent to first ("True") ' +
               'output, otherwise to second ("False") output';
    }
    if (component == 'Delay') {
        return 'Delays the received value for given number of seconds. If <b>Last only</b> property is specified, ' +
               'then value waiting in queue is dropped when new value is received. <br/>' +
               'If any value is received on <b>Reset</b> input then all values waiting in queue are dropped.';
    }
    if (component == 'Timer') {
        return 'Sends the same predefined value periodically';
    }
    if (component == 'Gate') {
        return 'Has open and close states. In open state (by default or after "True" message received on <b>State</b> ' +
               'input) any value received on <b>Data</b> input is pass through. In close state (after "False" message ' +
               'on <b>State</b> input) any received data value is dropped';
    }
    if (component == 'Hysteresis') {
        return 'Sends received value message to the <b>Rise</b> output if it crosses the <b>Min</b> property value and ' +
               'to the <b>Fall</b> output if it crosses the <b>Max</b> property value. Also values of min and max ' +
               'properties could be overridden with values from <b>Min</b> and <b>Max</b> values';
    }
    if (component == 'Save setting') {
        return 'Saves received string value to the key-value map stored at the EEPROM memory that is persisted across ' +
               'restarts.<br/>The same storage is used for storing parameters of Espurna firmware (such as hostname, ' +
               'ssid) so this component could be used to change system settings';
    }
    if (component == 'Load setting') {
        return 'Sends stored string value for received key name. This storage is key-value map stored at the EEPROM ' +
               'memory that is persisted across restarts for received.<br/>The same storage is used for storing ' +
               'parameters of Espurna firmware (such as hostname, ssid) so this component could be used to retrieve ' +
               'system settings';
    }
    if (component == 'Relay') {
        return 'Switches on/off the relay specified by number depending on the boolean message received on <b>State</b> ' +
               'input or toggles the state for any value received on <b>Toggle</b> input';
    }
    if (component == 'Button') {
        return 'Sends int value describing state of the button (2 for click on switch button, 1 for pressing push button ' +
               ' and 2/4/5 for releasing after normal/long/very long delay)';
    }
    if (component == 'MQTT subscribe') {
        return 'Subscribes for MQTT topic and sends received payload as string message';
    }
    if (component == 'MQTT publish') {
        return 'Publishes received value to MQTT topic';
    }
    if (component == 'Sensor') {
        return 'Sends numeric value received from sensor';
    }
    if (component == 'Schedule') {
        return 'Sends predefined value at time specified as HH:MM. Also weekdays could be optionally specified in format ' +
               'like 1,3,5,7 where 1 is Monday, 2 is Tuesday, etc';
    }
    return '';
}
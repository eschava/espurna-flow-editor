function getInfo(component) {
    if (component == 'Start') {
        return 'Sends predefined value when the system is started';
    }
    if (component == 'Debug') {
        return 'Outputs any received value to the console with [FLOW DEBUG] marker and custom prefix (optionally)';
    }
    if (component == 'Change') {
        return 'Always sends the predefined value when triggered';
    }
    if (component == 'Math') {
        return 'Sends the result of the mathematical operation when both operands are received. ' +
               'After new output value is sent on any new input value received.<br/>' +
               'Type of the output value is determined by the first operand.<br/>' +
               'String values are always concatenated';
    }
    if (component == 'Compare') {
        return 'Compares received value with test value. The test value is specified by property or can be overridden ' +
               'using <b>Test</b> input. If the result of the comparison is true then received value is sent to first ' +
               '(<b>True</b>) output, otherwise to second (<b>False</b>) output';
    }
    if (component == 'Delay') {
        return 'Delays the received value for the given number of seconds. If <b>Last only</b> property is specified, ' +
               'then value waiting in the queue is dropped when a new value is received. <br/>' +
               'If any value is received on <b>Reset</b> input then all values waiting in the queue are dropped.';
    }
    if (component == 'Timer') {
        return 'Sends the same predefined value periodically';
    }
    if (component == 'Gate') {
        return 'Has open and closed states. In open state (by default or after "True" message received on <b>State</b> ' +
               'input) any value received on <b>Data</b> input is pass through. In closed state (after "False" message ' +
               'on <b>State</b> input) any received data value is dropped';
    }
    if (component == 'Hysteresis') {
        return 'Sends received value message to the <b>Rise</b> output if it crosses the <b>Max</b> property value and ' +
               'to the <b>Fall</b> output if it crosses the <b>Min</b> property value. Also, values of min and max ' +
               'properties could be overridden with values from <b>Min</b> and <b>Max</b> inputs';
    }
    if (component == 'Save setting') {
        return 'Saves received string value to the key-value map stored at the EEPROM memory that is persisted across ' +
               'restarts.<br/>The same storage is used for storing parameters of Espurna firmware (such as hostname, ' +
               'ssid) so this component could be used to change system settings';
    }
    if (component == 'Load setting') {
        return 'Sends stored string value for received key name. This storage is a key-value map stored at the EEPROM ' +
               'memory that is persisted across restarts.<br/>The same storage is used for storing ' +
               'parameters of Espurna firmware (such as hostname, ssid) so this component could be used to retrieve ' +
               'system settings';
    }
    if (component == 'Light') {
        return 'Changes color and brightness of the light. <br/> Usually, value for the <b>Color</b> input is RGB value ' +
               'having format #RRGGBB or #RRGGBBWW to change warmness of color using WW part from warm (00) to cold (FF). ' +
               '<br/><b>Brightness</b> should be an integer number from 0 (lowest brightness) to 255 (highest).<br/>' +
               'Use <b>Relay</b> component to switch on/off light.'
    }
    if (component == 'Relay') {
        return 'Switches on/off the relay specified by number depending on the boolean message received on <b>State</b> ' +
               'input or toggles the state for any value received on <b>Toggle</b> input';
    }
    if (component == 'Button') {
        return 'Sends integer value describing state of the button (2 for click on switch button, 1 for pressing push ' +
               'button and 2/4/5 for releasing after a normal/long/very long delay)';
    }
    if (component == 'MQTT subscribe') {
        return 'Subscribes for MQTT topic and sends received payload as a string message. You can use the following ' +
               'placeholders: {hostname}, {mac} in the topic';
    }
    if (component == 'MQTT publish') {
        return 'Publishes received value to MQTT topic. You can use the following placeholders: {hostname}, {mac} ' +
               'in the topic';
    }
    if (component == 'Sensor') {
        return 'Sends numeric value received from the sensor';
    }
    if (component == 'Schedule') {
        return 'Sends predefined value at time specified as HH:MM. Also weekdays could be optionally specified in the format ' +
               'like 1,3,5,7 where 1 is Monday, 2 is Tuesday, etc';
    }
    return '';
}
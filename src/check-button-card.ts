console.info(`%cCHECK-BUTTON-CARD\n%cVersion: 1.0.0b0`, 'color: green; font-weight: bold;', '');

export interface config {
  button_style: any;
  card_style: any;
  entity: string;
  height: any;
  remove: boolean;
  saturation: any;
  title_position: string;
  title_style: any;
  title: string | null;
  topic: any;
  width: string;
}

class CheckButtonCard extends HTMLElement {
  shadowRoot: any;
  _config: any;
  _hass: any;
  _counter: number = 0;
  _entityState: number = 0;
  _configSet: boolean = false;
  _undoEntityState: number = 0;
  _currentTimestamp: number = 0;
  _clearUndo: any;
  _showInputTimeout: any;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  setConfig(config: config) {
    config = Object.assign({}, config);
    const root = this.shadowRoot;

    // Default Config Settings
    if (root.lastChild) root.removeChild(root.lastChild);

    const defaultConfig = {
      height: '40px',
      saturation: '50%',
      mode: 'homeassistant',
      discovery_prefix: 'homeassistant',
      undo_timeout: 15,
      visibility_timeout: 'none',
      text: {
        year: 'year',
        years: 'years',
        month: 'month',
        months: 'months',
        week: 'week',
        weeks: 'weeks',
        day: 'day',
        days: 'days',
        hour: 'hour',
        hours: 'hours',
        minute: 'minute',
        minutes: 'minutes',
        less_than_1: 'less than 1',
        ago: 'ago'
      }
    };
    if (config.title_position != 'inside') {
      if (!config.width) config.width = '70%';
    } else {
      if (!config.width) config.width = '100%';
    }
    config = Object.assign(config, defaultConfig);

    const sensorNameArray = config.entity.split('.');
    config.topic = sensorNameArray[1];

    // Create card elements
    const card = document.createElement('ha-card');
    const background = document.createElement('div');
    background.id = 'background';
    const button = document.createElement('cb-card-button');
    button.id = 'button';
    const buttonText = document.createElement('cb-card-buttontext');
    buttonText.id = 'buttonText';
    const undo = document.createElement('cb-card-undo');
    undo.id = 'undo';
    undo.style.setProperty('visibility', 'hidden');
    undo.textContent = 'undo';
    const buttonBlocker = document.createElement('cb-card-buttonblocker');
    buttonBlocker.id = 'buttonBlocker';
    buttonBlocker.style.setProperty('visibility', 'hidden');
    const title = document.createElement('cb-card-title');
    title.id = 'title';
    title.textContent = config.title;
    const titleBar = document.createElement('cb-card-titlebar');
    titleBar.id = 'titleBar';
    const inputBar = document.createElement('cb-card-inputbar');
    inputBar.id = 'inputBar';
    inputBar.style.setProperty('visibility', 'hidden');
    const minutesInput = document.createElement('input');
    minutesInput.type = 'number';
    minutesInput.id = 'minutesInput';
    minutesInput.placeholder = 'mm';
    const hoursInput = document.createElement('input');
    hoursInput.type = 'number';
    hoursInput.id = 'hoursInput';
    hoursInput.placeholder = 'hh';
    const daysInput = document.createElement('input');
    daysInput.type = 'number';
    daysInput.id = 'daysInput';
    daysInput.placeholder = 'dd';
    const inputForm = document.createElement('cb-card-inputform');
    inputForm.id = 'inputForm';
    const submitButton = document.createElement('cb-card-submitbutton');
    submitButton.id = 'submitButton';
    submitButton.textContent = '✔';
    const cancelButton = document.createElement('cb-card-cancelbutton');
    cancelButton.id = 'cancelButton';
    cancelButton.textContent = '✖';

    // Config Bar
    const configBar = document.createElement('cb-card-configbar');
    configBar.id = 'configBar';
    if (config.remove !== true) configBar.style.setProperty('visibility', 'hidden');
    const configInput = document.createElement('cb-card-configinput');
    configInput.textContent = "Entity doesn't exist. Create?";
    configInput.id = 'configInput';
    const configForm = document.createElement('cb-card-configform');
    configForm.id = 'configForm';
    const submitConfigButton = document.createElement('cb-card-submitconfigbutton');
    submitConfigButton.id = 'submitConfigButton';
    submitConfigButton.textContent = '✔';

    // Update Bar
    const updateBar = document.createElement('cb-card-updatebar');
    updateBar.id = 'updateBar';
    updateBar.style.setProperty('visibility', 'hidden');
    const updateInput = document.createElement('cb-card-updateinput');
    updateInput.textContent = 'Entity config outdated. Update?';
    updateInput.id = 'updateInput';
    const updateForm = document.createElement('cb-card-updateform');
    updateForm.id = 'updateForm';
    const submitUpdateButton = document.createElement('cb-card-submitupdatebutton');
    submitUpdateButton.id = 'submitUpdateButton';
    submitUpdateButton.textContent = '✔';

    // Style
    const style = document.createElement('style');
    style.textContent = `
      ha-card {
        background-color: var(--paper-card-background-color);
        padding: 4px;
      }
      #background {
        position: relative;
        height: ${config.height};
      }
      #button {
        position: absolute;
        height: ${config.height};
        color: #FFF;
        text-align: center;
        font-weight: bold;
        text-shadow: 1px 1px #000;
        border-radius: 3px;
        width: ${config.width};
        --background-color: #000;
        right: 0;
        background-color: var(--background-color);
      }
      #button:hover {
        cursor: pointer;
      }
      #button:active {
        --active-background-color: #000;
        background-color: var(--active-background-color);
      }
      #buttonText {
        white-space: pre;
        display: table-cell;
        height: ${config.height};
        width: 1000px;
        vertical-align: middle;
      }
      #buttonBlocker {
        position: absolute;
        height: ${config.height};
        line-height: ${config.height};
        width: ${config.width};
        right: 0;
        background-color: hsla(220, ${config.saturation}, 50%, 0);
      }
      #undo {
        position: absolute;
        text-align: center;
        height: ${config.height};
        line-height: ${config.height};
        width: 80px;
        background-color: hsl(220, 40%, 50%);
        right: 0px;
        border-radius: 3px;
        text-shadow: 1px 1px #000;
        color: #FFF;
        font-size: 12px;
        cursor: pointer;
      }
      #undo:active {
        background-color: hsl(220, 50%, 40%);
      }
      #title {
        display: table-cell;
        height: ${config.height};
        width: 100%;
        padding-left: 10px;
        text-align: left;
        font-size: 14px;
        vertical-align: middle;
        color: var(--primary-text-color);
      }
      #titleBar {
        position: absolute;
        height: ${config.height};
        width: 100%;
      }
      #inputBar, #configBar, #updateBar {
        position: absolute;
        display: table-cell;
        box-sizing: border-box;
        vertical-align: middle;
        height: ${config.height};
        line-height: ${config.height};
        border-radius: 3px;
        width: ${config.width};
        right: 0;
        --background-color: hsl(220, 50%, 50%);
        background-color: var(--background-color);
      }
      #secondsInput, #minutesInput, #hoursInput, #daysInput, #monthsInput, #yearsInput {
        height: 25px;
        width: 30px;
        text-align: center;
        margin-right: 4px;
        border-color: #000;
        border: 2px solid gray;
      }
      #configInput, #updateInput {
        right: 0px;
        text-shadow: 1px 1px #000;
        color: #FFF;
        font-weight: bold;
        text-align: center;
      }
      #submitButton, #submitConfigButton, #submitUpdateButton {
        text-align: center;
        cursor: pointer;
        position: relative;
        float: left;
        width: 50px;
        color: #00FF00;
        font-size: 22px;
        font-weight: bold;
      }
      #submitButton:hover, #submitConfigButton:hover, #submitUpdateButton:hover {
        font-size: 30px;
      }
      #submitConfigButton, #submitUpdateButton {
        float: right;
      }
      #cancelButton {
        text-align: center;
        cursor: pointer;
        position: relative;
        float: right;
        width: 50px;
        color: #FF0000;
        font-size: 22px;
        font-weight: bold;
      }
      #cancelButton:hover {
        font-size: 30px;
      }
      #inputForm {
        position: absolute;
        left: 50%;
        margin-left: -57px;
      }
      #configForm, #updateForm{
        position: absolute;
        width: 100%;
      }
      input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    `;

    // Build card.
    titleBar.appendChild(title);

    // Create Button
    button.appendChild(buttonText);

    // Create Input Bar
    inputForm.appendChild(daysInput);
    inputForm.appendChild(hoursInput);
    inputForm.appendChild(minutesInput);
    inputBar.appendChild(cancelButton);
    inputBar.appendChild(inputForm);
    inputBar.appendChild(submitButton);

    // Create Config Bar
    configForm.appendChild(configInput);
    configBar.appendChild(configForm);
    configBar.appendChild(submitConfigButton);

    // Create Update Bar
    updateForm.appendChild(updateInput);
    updateBar.appendChild(updateForm);
    updateBar.appendChild(submitUpdateButton);

    // Inside check
    if (config.title_position != 'inside') {
      background.appendChild(titleBar);
    }

    // Create Background
    background.appendChild(button);
    background.appendChild(inputBar);
    background.appendChild(configBar);
    background.appendChild(updateBar);
    background.appendChild(buttonBlocker);
    background.appendChild(undo);
    background.appendChild(style);

    card.appendChild(background);

    // Events
    button.addEventListener('mousedown', event => {
      this._buttonHold('down');
    });
    button.addEventListener('touchstart', event => {
      this._buttonHold('down');
    });
    button.addEventListener('mouseup', event => {
      this._buttonHold('up');
      this._action();
    });
    button.addEventListener('touchend', event => {
      this._buttonHold('up');
    });
    buttonBlocker.addEventListener('mouseup', event => {
      this._buttonHold('up');
    });
    buttonBlocker.addEventListener('touchend', event => {
      this._buttonHold('up');
    });
    undo.addEventListener('mouseup', event => {
      this._undoAction();
    });
    submitButton.addEventListener('mouseup', event => {
      this._setInputAction();
    });
    cancelButton.addEventListener('mouseup', event => {
      this._hideInputAction();
    });
    submitConfigButton.addEventListener('mouseup', event => {
      this._setConfigAction();
    });
    submitUpdateButton.addEventListener('mouseup', event => {
      this._setUpdateAction();
    });

    // Add to root
    root.appendChild(card);

    this._config = config;
  }

  // Create card.
  set hass(hass: any) {
    const config = this._config;
    this._hass = hass;
    let entityState;
    if (hass.states[config.entity] == undefined || config.remove == true) {
      this._showConfigBar();
    }
    if (hass.states[config.entity] != undefined) {
      if (hass.states[config.entity].attributes.unit_of_measurement != 'timestamp' && this._configSet != true) {
        this._showConfigBar();
      }
      entityState = hass.states[config.entity].state;
    }

    var counter = this._startTimer();
    clearInterval(this._counter);
    this._counter = counter;
    this._entityState = entityState;
  }

  _convertToSeconds(time: string) {
    let output;
    const timeFix = time + '';
    let timeArray: any[] = timeFix.split(' ');
    if (timeArray.length <= 1) {
      output = time;
    } else {
      switch (timeArray[1]) {
        case 'year':
        case 'years':
          output = timeArray[0] * 29030400;
          break;
        case 'month':
        case 'months':
          output = timeArray[0] * 2419200;
          break;
        case 'week':
        case 'weeks':
          output = timeArray[0] * 604800;
          break;
        case 'day':
        case 'days':
          output = timeArray[0] * 86400;
          break;
        case 'hour':
        case 'hours':
          output = timeArray[0] * 3600;
          break;
        case 'minute':
        case 'minutes':
          output = timeArray[0] * 60;
          break;
      }
    }
    output = Number(output);
    return output;
  }

  _startTimer() {
    this._timeIncrease();
    var counter = setInterval(() => this._timeIncrease(), 10000);
    return counter;
  }

  _timeIncrease(): void {
    const root = this.shadowRoot;
    const config = this._config;
    const hass = this._hass;
    let entityState;
    if (hass.states[config.entity] == undefined) {
      entityState = 'undefined';
    } else {
      entityState = hass.states[config.entity].state;
    }
    const convertTime = this._convertTime(entityState);
    let displayTime = convertTime.displayTime;
    let displayText = convertTime.displayText;
    let hue;

    if (!config.severity) {
      hue = 220;
      if (config.hue) {
        hue = config.hue;
      }
    } else {
      hue = this._computeSeverity(convertTime.seconds, config.severity);
    }
    if (config.title_position == 'inside') {
      root.getElementById('buttonText').textContent = `${config.title} \r\n${displayTime} ${displayText} ${this._config.text.ago}`;
    } else {
      root.getElementById('buttonText').textContent = `${displayTime} ${displayText} ${this._config.text.ago}`;
    }
    root.getElementById('button').style.setProperty('--background-color', 'hsl(' + hue + ', ' + config.saturation + ', 50%');
    root.getElementById('button').style.setProperty('--hover-background-color', 'hsl(' + hue + ', ' + config.saturation + ', 60%');
    root.getElementById('button').style.setProperty('--active-background-color', 'hsl(' + hue + ', ' + config.saturation + ', 40%');
  }

  _computeSeverity(stateValue: number, sections: any[]) {
    let numberValue = Number(stateValue);
    let hue: any;
    const arrayLength = sections.length;
    sections.forEach(section => {
      const computedSeconds: number = this._convertToSeconds(section.value);
      if (numberValue <= computedSeconds && !hue) {
        hue = section.hue;
      }
    });
    if (!hue) hue = sections[arrayLength - 1].hue;
    return hue;
  }

  _calculateVisibilityTimestamp(current_timestamp: number, visibility_timeout: string, payload: string) {
    let json_payload;
    let timestamp: number = this._convertToSeconds(visibility_timeout);
    if (Number.isInteger(timestamp)) {
      json_payload = JSON.parse(payload);
      json_payload.visibility_timestamp = current_timestamp + timestamp;
      payload = JSON.stringify(json_payload);
    }
    return payload;
  }

  _convertTime(entityState: number) {
    let elapsedTime = Date.now() / 1000 - Number(entityState);
    let displayTime;
    let displayText;
    let seconds = elapsedTime;
    seconds = Math.trunc(seconds);
    let minutes = seconds / 60;
    minutes = Math.trunc(minutes);
    let hours = minutes / 60;
    hours = Math.trunc(hours);
    let days = hours / 24;
    days = Math.trunc(days);
    let weeks = seconds / 604800;
    weeks = Math.trunc(weeks);
    let months = seconds / 2678400;
    months = Math.trunc(months);
    let years = seconds / 31536000;
    years = Math.trunc(years);

    if (years > 0) {
      displayTime = years;
      if (years == 1) displayText = this._config.text.year;
      else displayText = this._config.text.years;
    } else if (months > 0) {
      displayTime = months;
      if (months == 1) displayText = this._config.text.month;
      else displayText = this._config.text.months;
    } else if (weeks > 0) {
      displayTime = weeks;
      if (weeks == 1) displayText = this._config.text.week;
      else displayText = this._config.text.weeks;
    } else if (days > 0) {
      displayTime = days;
      displayText = this._config.text.days;
      if (days == 1) displayText = this._config.text.day;
      else displayText = this._config.text.days;
    } else if (hours > 0) {
      displayTime = hours;
      if (hours == 1) displayText = this._config.text.hour;
      else displayText = this._config.text.hours;
    } else if (minutes > 0) {
      displayTime = minutes;
      if (minutes == 1) displayText = this._config.text.minute;
      else displayText = this._config.text.minutes;
    } else {
      displayTime = this._config.text.less_than_1;
      displayText = this._config.text.minute;
    }
    return {
      displayTime: displayTime,
      displayText: displayText,
      seconds: seconds
    };
  }

  _action() {
    const config = this._config;
    const root = this.shadowRoot;
    root.getElementById('undo').style.removeProperty('visibility');
    root.getElementById('buttonBlocker').style.removeProperty('visibility');
    this._undoEntityState = this._entityState;
    this._currentTimestamp = Math.trunc(Date.now() / 1000);
    this._clearUndo = this._showUndo();
    let payload: any;

    if (config.mode == 'homeassistant') {
      payload = '{"timestamp":' + this._currentTimestamp + ',"visibility_timeout":"' + config.visibility_timeout + '","visible":true,"unit_of_measurement":"timestamp"}';
      if (config.visibility_timeout != 'none') {
        payload = this._calculateVisibilityTimestamp(this._currentTimestamp, config.visibility_timeout, payload);
      }
    } else {
      payload = this._currentTimestamp;
    }
    this._publish(payload);
  }

  _showUndo() {
    const root = this.shadowRoot;
    const config = this._config;
    const mqttPublish = this._hass;
    const currentTimestamp = this._currentTimestamp;
    const visibilityTimeout: number = this._convertToSeconds(config.visibility_timeout);

    let visibility;
    if (Math.trunc(Date.now() / 1000) - visibilityTimeout >= currentTimestamp) {
      visibility = true;
    } else {
      visibility = false;
    }

    let payload: any;
    if (config.mode == 'homeassistant') {
      payload = '{"timestamp":' + currentTimestamp + ',"visibility_timeout":"' + config.visibility_timeout + '","visible":' + visibility + ',"unit_of_measurement":"timestamp"}';
      if (config.visibility_timeout != 'none') {
        payload = this._calculateVisibilityTimestamp(currentTimestamp, config.visibility_timeout, payload);
      }
    } else {
      payload = this._currentTimestamp;
    }

    const sensorNameArray = config.entity.split('.');
    const sensorName = sensorNameArray[1];

    function clearUndo() {
      root.getElementById('undo').style.setProperty('visibility', 'hidden');
      root.getElementById('buttonBlocker').style.setProperty('visibility', 'hidden');
      if (config.visibility_timeout != 'none') {
        mqttPublish.callService('mqtt', 'publish', {
          topic: config.discovery_prefix + '/sensor/' + sensorName + '/state',
          payload: payload,
          retain: true
        });
      }
    }

    var clearUndoReturn = setTimeout(clearUndo, config.undo_timeout * 1000);
    return clearUndoReturn;
  }

  _undoAction() {
    const config = this._config;
    const root = this.shadowRoot;
    root.getElementById('undo').style.setProperty('visibility', 'hidden');
    root.getElementById('buttonBlocker').style.setProperty('visibility', 'hidden');

    let payload: any;
    if (config.mode == 'homeassistant') {
      payload = '{"timestamp":' + this._undoEntityState + ',"visibility_timeout":"' + config.visibility_timeout + '","visible":true,"unit_of_measurement":"timestamp"}';
      if (config.visibility_timeout != 'none') {
        payload = this._calculateVisibilityTimestamp(this._undoEntityState, config.visibility_timeout, payload);
      }
    } else {
      payload = this._currentTimestamp;
    }

    this._publish(payload);
    clearTimeout(this._clearUndo);
  }

  _setInputAction() {
    const config = this._config;
    const root = this.shadowRoot;
    const minutes = root.getElementById('minutesInput').value;
    const hours = root.getElementById('hoursInput').value;
    const days = root.getElementById('daysInput').value;
    const totalTime = minutes * 60 + hours * 3600 + days * 86400;
    const timestamp = Math.trunc(Date.now() / 1000) - totalTime;
    root.getElementById('inputBar').style.setProperty('visibility', 'hidden');
    root.getElementById('minutesInput').value = '';
    root.getElementById('hoursInput').value = '';
    root.getElementById('daysInput').value = '';

    let payload: any;
    if (config.mode == 'homeassistant') {
      payload = '{"timestamp":' + timestamp + ',"visibility_timeout":"' + config.visibility_timeout + '","visible":true,"unit_of_measurement":"timestamp"}';
      if (config.visibility_timeout != 'none') {
        payload = this._calculateVisibilityTimestamp(timestamp, config.visibility_timeout, payload);
      }
    } else {
      payload = this._currentTimestamp;
    }
    this._publish(payload);
    root.getElementById('undo').style.removeProperty('visibility');
    root.getElementById('buttonBlocker').style.removeProperty('visibility');
    this._currentTimestamp = timestamp;
    this._undoEntityState = this._entityState;
    this._clearUndo = this._showUndo();
  }

  _showInputAction() {
    const root = this.shadowRoot;
    root.getElementById('inputBar').style.removeProperty('visibility');
  }

  _hideInputAction() {
    const root = this.shadowRoot;
    root.getElementById('inputBar').style.setProperty('visibility', 'hidden');
  }

  _showConfigBar() {
    const root = this.shadowRoot;
    const config = this._config;
    root.getElementById('configBar').style.removeProperty('visibility');
    if (config.remove == true) {
      if (this._hass.states[config.entity] != undefined) {
        root.getElementById('configInput').textContent = 'Remove Entity?';
      } else {
        root.getElementById('submitConfigButton').style.setProperty('visibility', 'hidden');
        root.getElementById('configInput').textContent = 'Entity removed. Set remove to false.';
      }
      root.getElementById('configBar').style.setProperty('--background-color', '#FF0000');
    }
    if (this._hass.states[config.entity] != undefined) {
      if (this._hass.states[config.entity].attributes.unit_of_measurement != 'timestamp') {
        root.getElementById('submitConfigButton').style.setProperty('visibility', 'hidden');
        root.getElementById('configInput').textContent = 'Already exists. Incorrect entity type.';
        root.getElementById('configBar').style.setProperty('--background-color', '#FF0000');
      }
    }
  }

  _showUpdateBar() {
    const root = this.shadowRoot;
    const config = this._config;
    root.getElementById('updateBar').style.removeProperty('visibility');
    if (this._hass.states[config.entity].attributes.version == undefined) {
    }
  }

  _setUpdateAction() {
    const root = this.shadowRoot;
    const config = this._config;
    const sensorNameArray = config.entity.split('.');
    const sensorName = sensorNameArray[1];
    root.getElementById('updateBar').style.setProperty('visibility', 'hidden');
    const discoveryConfig =
      '{"value_template": "{{ value_json.timestamp }}","json_attributes_topic":"' +
      config.discovery_prefix +
      '/sensor/' +
      sensorName +
      '/state","state_topic":"' +
      config.discovery_prefix +
      '/sensor/' +
      sensorName +
      '/state","name": "' +
      sensorName +
      '","unique_id": "' +
      sensorName +
      '_homeassistant"}';
    this._hass.callService('mqtt', 'publish', {
      topic: config.discovery_prefix + '/sensor/' + sensorName + '/state/config',
      payload: discoveryConfig,
      retain: true
    });
    let payload = '{"timestamp":' + this._hass.states[config.entity].state + ',"visibility_timeout":"' + config.visibility_timeout + '","visible":true,"unit_of_measurement":"timestamp"}';
    if (config.visibility_timeout != 'none') {
      payload = this._calculateVisibilityTimestamp(this._hass.states[config.entity].state, config.visibility_timeout, payload);
    }
    this._publish(payload);
  }

  _publish(payload: string) {
    const config = this._config;
    const sensorNameArray = config.entity.split('.');
    const sensorName = sensorNameArray[1];
    this._hass.callService('mqtt', 'publish', {
      topic: config.discovery_prefix + '/sensor/' + sensorName + '/state',
      payload: payload,
      retain: true
    });
  }

  _setConfigAction() {
    const root = this.shadowRoot;
    const config = this._config;
    const sensorNameArray = config.entity.split('.');
    const sensorName = sensorNameArray[1];
    root.getElementById('configBar').style.setProperty('visibility', 'hidden');
    const discoveryConfig =
      '{"value_template": "{{ value_json.timestamp }}","json_attributes_topic":"' +
      config.discovery_prefix +
      '/sensor/' +
      sensorName +
      '/state","state_topic":"' +
      config.discovery_prefix +
      '/sensor/' +
      sensorName +
      '/state","name": "' +
      sensorName +
      '","unique_id": "' +
      sensorName +
      '_homeassistant"}';
    if (config.remove == true) {
      this._hass.callService('mqtt', 'publish', {
        topic: config.discovery_prefix + '/sensor/' + sensorName + '/state',
        payload: '',
        retain: true
      });
      this._hass.callService('mqtt', 'publish', {
        topic: config.discovery_prefix + '/sensor/' + sensorName + '/state/config',
        payload: '',
        retain: true
      });
    } else {
      this._hass.callService('mqtt', 'publish', {
        topic: config.discovery_prefix + '/sensor/' + sensorName + '/state/config',
        payload: discoveryConfig,
        retain: true
      });
      this._configSet = true;
      this._action();
    }
  }

  _buttonHold(state: string) {
    const root = this.shadowRoot;

    function showConfig() {
      root.getElementById('inputBar').style.removeProperty('visibility');
      root.getElementById('buttonBlocker').style.removeProperty('visibility');
    }

    if (state == 'down') {
      this._showInputTimeout = setTimeout(showConfig, 1000);
    } else if (state == 'up') {
      root.getElementById('buttonBlocker').style.setProperty('visibility', 'hidden');
      clearTimeout(this._showInputTimeout);
    }
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('check-button-card', CheckButtonCard);

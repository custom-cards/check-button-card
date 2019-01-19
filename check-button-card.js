class CheckButtonCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  setConfig(config) {
    const root = this.shadowRoot;

    // Default Config Settings
    if(root.lastChild) root.removeChild(root.lastChild);
    if(!config.height) config.height = "40px";
    if(!config.width) config.width = "70%"; 
    if(!config.mode) config.mode = "homeassistant";
    if(!config.undo_timeout) config.undo_timeout = 10;
    
    // Create card elements
    const card = document.createElement('ha-card');
    const background = document.createElement('div');
    background.id = "background";

    // Button
    const button = document.createElement('div');
    button.id = "button";
    const buttonText = document.createElement('div');
    buttonText.id = "buttonText";

    // Undo
    const undo = document.createElement('div');
    undo.id = "undo";
    undo.style.setProperty('visibility', 'hidden');
    undo.textContent = "undo";
    const buttonBlocker = document.createElement('div');

    // Button Blocker
    buttonBlocker.id = "buttonBlocker";
    buttonBlocker.style.setProperty('visibility', 'hidden');
    const title = document.createElement('div');
    title.id = "title";
    title.textContent = config.title;
    const titleBar = document.createElement('div');
    titleBar.id = "titleBar";
    const inputBar = document.createElement('div');

    // Input Bar
    inputBar.id = "inputBar";
    inputBar.style.setProperty('visibility', 'hidden');
    const minutesInput = document.createElement("input");
    minutesInput.type = "number";
    minutesInput.id = "minutesInput";
    minutesInput.placeholder = "mm";
    const hoursInput = document.createElement("input");
    hoursInput.type = "number";
    hoursInput.id = "hoursInput";
    hoursInput.placeholder = "hh";
    const daysInput = document.createElement("input");
    daysInput.type = "number";
    daysInput.id = "daysInput";
    daysInput.placeholder = "dd";
    const form = document.createElement("div");
    form.id = "form";
    const submitButton = document.createElement("div");
    submitButton.id = "submitButton";
    submitButton.textContent = "✔";
    const cancelButton = document.createElement("div");
    cancelButton.id = "cancelButton";
    cancelButton.textContent = "✖";

    // Config Bar
    const configBar = document.createElement('div');
    configBar.id = "inputBar";
    configBar.style.setProperty('visibility', 'hidden');

    // Style
    const style = document.createElement('style');
    style.textContent = `
      ha-card {
        text-align: center;
        background-color: var(--paper-card-background-color);
        height: ${config.height};
        margin-bottom: 4px;
        position: relative;
      }
      #background {
        position: relative;
        margin: 4px;
      }
      #button {
        position: absolute;
        height: ${config.height};
        color: #FFF;
        font-weight: bold;
        text-shadow: 1px 1px #000000;
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
        width: 100%;
        background-color: hsla(220, 50%, 50%, 0);
      }
      #undo {
        position: absolute;
        height: ${config.height};
        line-height: ${config.height};
        width: 80px;
        background-color: hsl(220, 50%, 50%);
        right: 0px;
        border-radius: 3px;
        text-shadow: 1px 1px #000000;
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
      #inputBar, #configBar {
        position: absolute;
        display: table-cell;
        box-sizing: border-box;
        vertical-align: middle;
        height: ${config.height};
        line-height: ${config.height};
        border-radius: 3px;
        width: ${config.width};
        right: 0;
        background-color: hsl(220, 50%, 50%);
      }
      #secondsInput, #minutesInput, #hoursInput, #daysInput, #monthsInput, #yearsInput {
        height: 25px;
        width: 30px;
        text-align: center;
        margin-right: 4px;
        border-color: #000;
        border: 2px solid gray;
      }
      #submitButton {
        position: relative;
        float: left;
        width: 50px;
        color: #00FF00;
        font-size: 22px;
        font-weight: bold;
      }
      #submitButton:hover {
        font-size: 30px;
      }
      #cancelButton {
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
      #form {
        position: absolute;
        left: 50%;
        margin-left: -57px;
      }
      input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { 
        -webkit-appearance: none; 
        margin: 0; 
      }
    `;

    // Build card.
    titleBar.appendChild(title);
    background.appendChild(titleBar);
    button.appendChild(buttonText);
    background.appendChild(button);
    background.appendChild(buttonBlocker);
    background.appendChild(undo);
    form.appendChild(daysInput);
    form.appendChild(hoursInput);
    form.appendChild(minutesInput);
    inputBar.appendChild(cancelButton);
    inputBar.appendChild(form);
    inputBar.appendChild(submitButton);
    background.appendChild(inputBar);
    background.appendChild(configBar);
    background.appendChild(style);
    card.appendChild(background);
    button.addEventListener('mouseup', event => { this._action(config, this._counter); });
    undo.addEventListener('mouseup', event => { this._undoAction(); });
    titleBar.addEventListener('mouseup', event => { this._showInputAction(); });
    submitButton.addEventListener('mouseup', event => { this._setInputAction(); });
    cancelButton.addEventListener('mouseup', event => { this._hideInputAction(); });
    root.appendChild(card);
    this._config = config;
  }
  
  // Create card.
  set hass(hass) {
    const config = this._config;
    let entityState;
    if(hass.states[config.entity] == undefined){
      entityState = "undefined"
    }
    else{
      entityState = hass.states[config.entity].state;
    }
    this._hass = hass;
    var counter = this._startTimer();
    clearInterval(this._counter);
    this._counter = counter;
    this._entityState = entityState;
  }

  _convertToSeconds(time){
    let output;
    const timeFix = time+"";
    let timeArray = timeFix.split(" ");
    if(timeArray.length <= 1){
      output = time;
    }
    else{
      switch(timeArray[1]){
        case "year":
        case "years":
          output = timeArray[0]*29030400;
          break;
        case "month":
        case "months":
          output = timeArray[0]*2419200
          break;
        case "week":
        case "weeks":
          output = timeArray[0]*604800;
          break;
        case "day":
        case "days":
          output = timeArray[0]*86400;
          break;
        case "hour":
        case "hours":
          output = timeArray[0]*3600;
          break; 
        case "minute":   
        case "minutes":
          output = timeArray[0]*60;
          break;    
      }
    }
    return output;
  }

  _startTimer() {
    this._timeIncrease();
    var counter = setInterval(this._timeIncrease(), 10000);
    return counter;
  }

  _timeIncrease(){
    const root = this.shadowRoot; 
    const config = this._config; 
    const hass = this._hass;
    let entityState;
    if(hass.states[config.entity] == undefined){
      entityState = "undefined";
    }
    else{
      entityState = hass.states[config.entity].state;
    } 
    const convertTime = this._convertTime(entityState); 
    let displayTime = convertTime.displayTime;
    let displayText = convertTime.displayText;
    let hue;

    if(!config.severity) {
      hue = 220;
      if(config.hue){
        hue = config.hue;
      }
    }
    else{
      hue = this._computeSeverity(convertTime.seconds, config.severity);
    }      
    root.getElementById("buttonText").textContent = displayTime + " " + displayText + " ago" ;
    root.getElementById("button").style.setProperty('--background-color', "hsl("+hue+", 50%, 50%");
    root.getElementById("button").style.setProperty('--hover-background-color', "hsl("+hue+", 50%, 60%");
    root.getElementById("button").style.setProperty('--active-background-color', "hsl("+hue+", 50%, 40%");
  }

  _computeSeverity(stateValue, sections) {
    let numberValue = Number(stateValue);
    let hue;
    const arrayLength = sections.length;
    sections.forEach(section => {
      const computedSeconds = this._convertToSeconds(section.value);
      if (numberValue <= computedSeconds && !hue) {
        hue = section.hue;
      }
    });
    if(!hue) hue = sections[arrayLength - 1].hue;
    return hue;
  }

  _convertTime(entityState){
    let elapsedTime = (Date.now()/1000 - Number(entityState));
    let displayTime;
    let displayText;
    let seconds = elapsedTime;
    seconds = Math.trunc(seconds);
    let minutes = seconds/60;
    minutes = Math.trunc(minutes);
    let hours = minutes/60;
    hours = Math.trunc(hours)
    let days = hours/24;
    days = Math.trunc(days);
    let weeks = seconds/604800;
    weeks = Math.trunc(weeks);
    let months = seconds/2678400;
    months = Math.trunc(months);
    let years = seconds/31536000;
    years = Math.trunc(years);

    if(years > 0){
      displayTime = years;
      if(years == 1) displayText = "year"
      else displayText = "years";
    }
    else if(months > 0){
      displayTime = months;
      if(months == 1) displayText = "month"
      else displayText = "months";
    }
    else if(weeks > 0){
      displayTime = weeks;
      if(weeks == 1) displayText = "week"
      else displayText = "weeks";
    }
    else if(days > 0){
      displayTime = days;
      displayText = "days";
      if(days == 1) displayText = "day";
      else displayText = "days";
    }
    else if(hours > 0){
      displayTime = hours;
      if(hours == 1) displayText = "hour";
      else displayText = "hours";     
    }
    else if(minutes > 0){
      displayTime = minutes;
      if(minutes == 1) displayText = "minute";
      else displayText = "minutes";
    }
    else {
      displayTime = "less than 1";
      displayText = "minute";
    }
    return {"displayTime":displayTime, "displayText":displayText, "seconds":seconds};
  }

  _action() {
    const config = this._config;
    const root = this.shadowRoot;
    root.getElementById("undo").style.removeProperty('visibility');
    root.getElementById("buttonBlocker").style.removeProperty('visibility');
    this._undoEntityState = this._entityState;
    this._currentTimestamp = (Math.trunc(Date.now()/1000));
    this._clearUndo = this._showUndo();
    let payload;

    if(config.mode == "homeassistant"){
      payload = '{"timestamp":'+this._currentTimestamp+',"visibility_timeout":"'+config.visibility_timeout+'","visible":true}';
    }
    else{
      payload = this._currentTimestamp;
    }
    this._hass.callService("mqtt", "publish", {"topic" : config.topic, "payload" : payload, "retain": true});
  }

  _showUndo(){
    const root = this.shadowRoot;
    const config = this._config;
    const mqttPublish = this._hass;
    const currentTimestamp = this._currentTimestamp;
    const visibilityTimeout = this._convertToSeconds(config.visibility_timeout);

    let visibility;
    if((Math.trunc(Date.now()/1000)) - visibilityTimeout >= currentTimestamp){
      visibility = true;
    }
    else{
      visibility = false;
    }

    let payload;
    if(config.mode == "homeassistant"){
      payload = '{"timestamp":'+currentTimestamp+',"visibility_timeout":"'+config.visibility_timeout+'","visible":'+visibility+'}';
    }
    else{
      payload = this._currentTimestamp;
    }

    function clearUndo(){
      root.getElementById("undo").style.setProperty('visibility', 'hidden');
      root.getElementById("buttonBlocker").style.setProperty('visibility', 'hidden');
      mqttPublish.callService("mqtt", "publish", {"topic" : config.topic, "payload" : payload, "retain": true});
    }

    var clearUndoReturn = setTimeout(clearUndo, config.undo_timeout*1000);
    return clearUndoReturn;
  }

  _undoAction(){
    const config = this._config; 
    const root = this.shadowRoot;
    root.getElementById("undo").style.setProperty('visibility', 'hidden');
    root.getElementById("buttonBlocker").style.setProperty('visibility', 'hidden');

    let payload;
    if(config.mode == "homeassistant"){
      payload = '{"timestamp":'+this._undoEntityState+',"visibility_timeout":"'+config.visibility_timeout+'","visible":true}';
    }
    else{
      payload = this._currentTimestamp;
    }

    this._hass.callService("mqtt", "publish", {"topic" : config.topic, "payload" : payload, "retain": true});
    clearTimeout(this._clearUndo);
  }

  _setInputAction(){
    const config = this._config; 
    const root = this.shadowRoot;
    const minutes = root.getElementById("minutesInput").value;
    const hours = root.getElementById("hoursInput").value;
    const days = root.getElementById("daysInput").value;
    const totalTime = (minutes*60)+(hours*3600)+(days*86400);
    const timestamp = (Math.trunc(Date.now()/1000))-totalTime;
    root.getElementById("inputBar").style.setProperty('visibility', 'hidden');

    let payload;
    if(config.mode == "homeassistant"){
      payload = '{"timestamp":'+timestamp+',"visibility_timeout":"'+config.visibility_timeout+'","visible":true}';
    }
    else{
      payload = this._currentTimestamp;
    }
    this._hass.callService("mqtt", "publish", {"topic" : config.topic, "payload" : payload, "retain": true});
    root.getElementById("undo").style.removeProperty('visibility');
    root.getElementById("buttonBlocker").style.removeProperty('visibility');
    this._currentTimestamp = timestamp;
    this._undoEntityState = this._entityState;
    this._clearUndo = this._showUndo();
  }

  _showInputAction(){
    const root = this.shadowRoot;
    root.getElementById("inputBar").style.removeProperty('visibility');
  }

  _hideInputAction(){
    const root = this.shadowRoot;
    root.getElementById("inputBar").style.setProperty('visibility', 'hidden');
  }

  _showConfigBar(){
    
  }

  _setConfigAction(){
    const message = '{"value_template": "{{ value_json.timestamp }}","json_attributes": ["visible","visibility_timeout"],"state_topic": "homeassistant/animals_'+msg.animal+'_'+msg.topic+'","name": "animals_'+msg.animal+'_'+msg.topic+'","unique_id": "animals_'+msg.animal+'_'+msg.topic+'_homeassistant"}'
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('check-button-card', CheckButtonCard);
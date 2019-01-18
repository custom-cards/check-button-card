class CheckButtonCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  setConfig(config) {
    const root = this.shadowRoot;

    if (root.lastChild) root.removeChild(root.lastChild);
    if (!config.height) config.height = "40px";
    if (!config.rounding) config.rounding = "3px";
    if (!config.width) config.width = "70%";    
    
    // Create card elements.
    const card = document.createElement('ha-card');
    const background = document.createElement('div');
    background.id = "background";
    const button = document.createElement('div');
    button.id = "button";
    const undo = document.createElement('div');
    undo.id = "undo";
    undo.style.setProperty('visibility', 'hidden');
    undo.textContent = "undo";
    const buttonBlocker = document.createElement('div');
    buttonBlocker.id = "buttonBlocker";
    buttonBlocker.style.setProperty('visibility', 'hidden');
    const title = document.createElement('div');
    title.id = "title";
    title.textContent = config.title;
    const titleBar = document.createElement('div');
    titleBar.id = "titleBar";
    const style = document.createElement('style');
    style.textContent = `
      ha-card {
        text-align: center;
        background-color: var(--paper-card-background-color);
        padding: 2px;
        padding-right: 4px;
        height: ${config.height};
        position: relative;
      }
      #button {
        height: 40px;
        line-height: 40px;
        color: #FFF;
        font-weight: bold;
        text-shadow: 1px 1px #000000;
        border-radius: 3px;
        width: 70%;
        float: right;
        --background-color: #000;
        background-color: var(--background-color);
      }
      #button:hover {
        --hover-background-color: #000;
        background-color: var(--hover-background-color);
        cursor: pointer;
      }
      #button:active {
        --active-background-color: #000;
        background-color: var(--active-background-color);
      }
      #buttonBlocker {
        position: absolute;
        height: ${config.height};
        line-height: ${config.height};
        width: 100%;
        background-color: hsla(220, 50%, 50%, 0);
        right: 0px;
        border-radius: 3px;
        text-shadow: 1px 1px #000000;
        color: #FFF;
        font-size: 12px;
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
        margin-right: 4px;
      }
      #undo:hover {
        background-color: hsl(220, 50%, 60%);
      }
      #undo:active {
        background-color: hsl(220, 50%, 40%);
      }
      #title {
        display: table-cell;
        height: ${config.height};
        width: ${100-config.width}%;
        text-align: left;
        font-size: 14px;
        vertical-align: middle;
        color: var(--primary-text-color);
        padding-left: 10px;
        padding-right: 10px;
      }
      #titleBar {
        position: absolute;
        left: 0px;
        height: ${config.height};
        width: ${100-config.width}%;
      }
    `;

    // Build card.
    titleBar.appendChild(title);
    card.appendChild(titleBar);
    card.appendChild(button);
    card.appendChild(buttonBlocker);
    card.appendChild(undo);
    card.appendChild(style);
    button.addEventListener('mouseup', event => { this._action(config, this._counter); });
    undo.addEventListener('mouseup', event => { this._undoAction(); });
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

  _startTimer() {
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

    function convertToSeconds(time){
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

    function computeSeverity(stateValue, sections) {
      let numberValue = Number(stateValue);
      let hue;
      const arrayLength = sections.length;
      sections.forEach(section => {
        const computedSeconds = convertToSeconds(section.value);
        if (numberValue <= computedSeconds && !hue) {
          hue = section.hue;
        }
      });
      if(!hue) hue = sections[arrayLength - 1].hue;
      return hue;
    }

    const convertTime = this._convertTime(entityState);

    // Update displayed time
    function timeIncrease(){      
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
        hue = computeSeverity(convertTime.seconds, config.severity);
      }      
      root.getElementById("button").textContent = displayTime + " " + displayText + " ago" ;
      root.getElementById("button").style.setProperty('--background-color', "hsl("+hue+", 50%, 50%");
      root.getElementById("button").style.setProperty('--hover-background-color', "hsl("+hue+", 50%, 60%");
      root.getElementById("button").style.setProperty('--active-background-color', "hsl("+hue+", 50%, 40%");
    }
    timeIncrease();
    var counter = setInterval(timeIncrease(), 1000);
    return counter;
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
    this._currentTimestamp = (Math.trunc(Date.now()/1000))
    this._clearUndo = this._showUndo();
    this._hass.callService("mqtt", "publish", {"topic" : config.topic, "payload" : '{"timestamp":'+this._currentTimestamp+',"timeout_high":"'+config.timeout_high+'","timeout_low":"'+config.timeout_low+'","visible":true}', "retain": true});
  }

  _showUndo(){
    const root = this.shadowRoot;
    const config = this._config;
    const mqttPublish = this._hass;
    const currentTimestamp = this._currentTimestamp
    function clearUndo(){
      root.getElementById("undo").style.setProperty('visibility', 'hidden');
      root.getElementById("buttonBlocker").style.setProperty('visibility', 'hidden');
      mqttPublish.callService("mqtt", "publish", {"topic" : config.topic, "payload" : '{"timestamp":'+currentTimestamp+',"timeout_high":"'+config.timeout_high+'","timeout_low":"'+config.timeout_low+'","visible":false}', "retain": true});
    }
    var clearUndoReturn = setTimeout(clearUndo, 30000);
    return clearUndoReturn;
  }

  _undoAction(){
    const config = this._config; 
    const root = this.shadowRoot;
    root.getElementById("undo").style.setProperty('visibility', 'hidden');
    root.getElementById("buttonBlocker").style.setProperty('visibility', 'hidden');
    this._hass.callService("mqtt", "publish", {"topic" : config.topic, "payload" : '{"timestamp":'+this._undoEntityState+',"timeout_high":"'+config.timeout_high+'","timeout_low":"'+config.timeout_low+'","visible":true}', "retain": true});
    clearTimeout(this._clearUndo);
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('check-button-card', CheckButtonCard);
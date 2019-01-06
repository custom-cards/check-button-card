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
        padding: 5px;
        height: ${config.height};
        position: relative;
      }
      #button {
        height: 40px;
        border: none;
        line-height: 40px;
        text-shadow: 1px 1px #000000;
        border-radius: 3px;
        width: 70%;
        float: right;
      }
      #button:hover {
        background-color: hsl(120, 50%, 65%);
        cursor: pointer;
      }
      #button:active {
        background-color: hsl(120, 50%, 40%);
      }
      #undo {
        position: absolute;
        height: ${config.height};
        line-height: ${config.height};
        width: 80px;
        background-color: hsla(0, 0%, 50%, 50%);
        right: 5px;
        border-radius: 3px;
        text-shadow: 1px 1px #000000;
        font-size: 12px;
      }
      #undo:hover {
        background-color: hsl(0, 0%, 50%);
      }
      #undo:active {
        background-color: hsl(0, 0%, 40%);
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
    card.appendChild(undo);
    card.appendChild(style);
    button.addEventListener('mouseup', event => {
      this._action(config, this._counter);
    });
    undo.addEventListener('mouseup', event => {
      this._undoAction();
    });
    root.appendChild(card);
    this._config = config;
  }
  
  // Create card
  set hass(hass) {
    const config = this._config;
    const root = this.shadowRoot;
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
    this._undoEntityState = this._entityState;
    this._counter = counter;
    this._entityState = entityState;
  }

  _startTimer() {
    const root = this.shadowRoot;
    const config = this._config;
    const hass = this._hass;
    let entityState;
    if(hass.states[config.entity] == undefined){
      entityState = "undefined"
    }
    else{
      entityState = hass.states[config.entity].state;
    }
    function convertToSeconds(time){
      let output;
      const timeFix = time+"";
      let timeArray = timeFix.split(" ");
      //alert(timeArray);
      if(timeArray.length <= 1){
        output = time;
      }
      else{
        if(timeArray[1] == "days"){
          output = timeArray[0]*86400;
        }
        if(timeArray[1] == "hours"){
          output = timeArray[0]*3600;
        }
        if(timeArray[1] == "minutes"){
          output = timeArray[0]*60;
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
      if(!hue){
        hue = sections[arrayLength - 1].hue;
      }
      return hue;
    }

    function timeIncrease(){
      let elapsedTime = ((Date.now()/1000) - Number(entityState));
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

      if(days > 0){
        displayTime = days;
        displayText = "days";
      }
      else if(hours > 0){
        displayTime = hours;
        if(hours <= 1) displayText = "hour";
        if(hours > 1) displayText = "hours";     
      }
      else if(minutes > 0){
        displayTime = minutes;
        if(minutes <= 1) displayText = "minute";
        if(minutes > 1) displayText = "minutes";
      }
      else {
        displayTime = "less than 1";
        displayText = "minute";
      }

      let hue;
      if(!config.severity) {
        hue = 220;
        if(config.hue){
          hue = config.hue;
        }
      }
      else{
        hue = computeSeverity(seconds, config.severity);
      }      
      root.getElementById("button").textContent = displayTime + " " + displayText + " ago" ;
      root.getElementById("button").style.setProperty('background-color', "hsl("+hue+", 50%, 50%");
    }
    timeIncrease();
    var counter = setInterval(timeIncrease, 1000);
    return counter;
  }

  // Returns hue value based on severity array
  _computeSeverity(stateValue, sections) {
    let numberValue = Number(stateValue);
    let hue;
    sections.forEach(section => {
      if (numberValue <= section.value && !hue) {
        hue = section.hue;
      }
    });
    return hue;
  }
  
  _calculateTime(entityState){
    let elapsedTime = (Date.now() - Number(entityState));
    let displayTime;
    let displayText;
    let seconds = elapsedTime/1000;
    seconds = Math.trunc(seconds);
    let minutes = seconds/60;
    minutes = Math.trunc(minutes);
    let hours = minutes/60;
    hours = Math.trunc(hours)
    let days = hours/24;
    days = Math.trunc(days);
    displayTime = seconds + "," + minutes;
    displayText = "";
    if(days > 0){
      displayTime = days;
      displayText = "days";
    }
    else if(hours > 0){
      displayTime = hours;
      if(hours <= 1) displayText = "hour";
      if(hours > 1) displayText = "hours";       
    }
    else if(minutes > 0){
      displayTime = minutes;
      if(minutes <= 1) displayText = "minute";
      if(minutes > 1) displayText = "minutes";
    }
    else {
      displayTime = "less than 1";
      displayText = "minute";
    }
    return [displayTime, displayText];
  }

  _action() {
    const config = this._config;
    const root = this.shadowRoot;
    function enableButton(){
      root.getElementById("undo").style.removeProperty('visibility');
    }
    setTimeout(enableButton, 3000);
    this._startUndo();
    this._hass.callService("mqtt", "publish", {"topic" : config.topic, "payload" : (Math.trunc(Date.now()/1000)), "retain": true});
  }

  _startUndo(){
    const root = this.shadowRoot;
    function clearUndo(){
      root.getElementById("undo").style.setProperty('visibility', 'hidden');
    }
    var clearUndoReturn = setTimeout(clearUndo, 30000);
    return clearUndoReturn;
  }

  _undoAction(){
    const config = this._config; 
    const root = this.shadowRoot;
    root.getElementById("undo").style.setProperty('visibility', 'hidden');
    this._hass.callService("mqtt", "publish", {"topic" : config.topic, "payload" : this._undoEntityState, "retain": true});
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('check-button-card', CheckButtonCard);
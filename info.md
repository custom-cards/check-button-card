# check-button-card

![](https://github.com/Gluwc/check-button-card/raw/master/images/example.gif)

## Description

Check Button Card is a button that tracks when it is last pressed, for the Home Assistant Lovelace front-end using MQTT auto discovery.

### Features
- Shows how long ago you've pressed the button.
- Automatic sensor configuration using Home Assistant MQTT discovery.
- Hold button to set custom time.
- Undo unwanted changes.
- Due mode to display the due time instead of last press time.

## Installation
Requires a working MQTT setup with discovery enabled in Home Assistant. For more information check out the Home Assistant [documentation](https://www.home-assistant.io/docs/mqtt/discovery/).

The card will start in configuration mode and prompt you to create the MQTT config required for auto discovery. If the entity doesn't exist it will be created with the entity provided in the card config. After the button is configured the sensor will show up as a Home Assistant entity and is used by the card to track the last button press.

## MQTT

It is possible to publish to the MQTT topic using automations to update the button state using physical buttons for example (instead of using the UI button).

The payload should be published to the relevant sensor. If you sensor is named `sensor.test_button` the topic should be `homeassistant/sensor/test_button/state`. For more information check out the Home Assistant [documentation](https://www.home-assistant.io/docs/mqtt/discovery/). 

### Payload Example
``` json
{"timestamp":"**timestamp here**","timeout":"2 hours","unit_of_measurement":"timestamp"}
```
### Node Red Example
```
// Define entity_id
const entityId = "sensor.test_button";

// Get global object
const haObject = global.get("homeassistant");

// Get attributes object from entity
let payloadObject = haObject.homeAssistant.states[entityId].attributes;

// Get current timestamp in seconds
const currentTime = Math.trunc(Date.now()/1000);

// Modify timestamp in payloadObject.
payloadObject.timestamp = currentTime;

// Modify timeout_timestamp in payloadObject if defined
if (payloadObject.timeout_seconds !== undefined) {
    const timeoutTime = currentTime + payloadObject.timeout_seconds
    payloadObject.timeout_timestamp = timeoutTime;
}

// Create string from object
msg.payload = JSON.stringify(payloadObject);

return msg;
```

## Options

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| type | string | **Required** | `custom:check-button-card`
| entity | string | **Required** | Sensor entity used to create and publish to.
| title | string | none | Title displayed next to the button.
| title_position | string | left | Sets the position of the title `left`, `inside`.
| color | string | var(--primary-color) | Change the base color of the button. Also definable in themes as `checkbutton-card-color`.
| height | string | 40px | Scales the height of the button.
| width | string | 70% | Scales the width of the button.
| severity | array | none | A list of severity options. `* minutes`, `* hours`, `* days`, `* months`, `* years`.
| display_limit | string | none | Limits the display of time to a certain value `minutes`, `hours`, `days`, `weeks`, `months`, `years`.
| timeout | string | none | Attribute **required** for `due` config option. `minutes`, `days`, `weeks`, `months`, `years`.
| text | object | none | A list defining the text displayed. `minute(s)`, `day(s)`, `week(s)`, `month(s)`, `year(s)`, `ago`, `less_than`, `more_than`, `due_by`, `over_by`.
| due | boolean | false | Sets the card to display the due time based on `timeout` value set in the config.
| unit_of_measurement | string | none | Define the unit of measurement of the sensor.
| icon | string | mdi:checkbox-marked | Define a custom icon for this sensor.
| undo_timeout | number | 15 | Time until undo button times out in seconds.
| remove | boolean | false | Set to `true` for removal config mode. Used to remove entity from MQTT discovery.
| discovery_prefix | string | homeassistant | Define custom MQTT discovery prefix.
| automation | object | none | Allows publishing of custom variables to the sensor attributes.

## Default

```yaml
- type: custom:check-button-card
  title: Default
  entity: sensor.test_button
```
## `severity`

```yaml
color: Green
severity:
  - value: 5 days
    color: Purple
  - value: 3 days
    color: Red
  - value: 10 days
    color: Yellow
  - value: 1 day
    color: Blue
```

## `text`
```yaml
text:
  year: jaar
  years: jaar
  month: maand
  months: maanden
  week: week
  weeks: weken
  day: dag
  days: dagen
  hour: uur
  hours: uur
  minute: minuut
  minutes: minuten
  less_than: minder dan
  ago: geleden
  due_in: over
  over_by: over met
```

## `automation`

```yaml
automation:
  example_value_1: as many values
  example_value_2: as you want
```

# check-button-card
![](images/example.gif)

## Description

Check Button Card is a button that tracks when it is last pressed, for the Home Assistant Lovelace front-end using MQTT auto discovery.

### Features
- Shows how long ago you've pressed the button.
- Automatic sensor configuration using Home Assistant MQTT discovery.
- Enter custom time by pressing the button title.
- Undo unwanted changes.
- Publishes visibility attribute for use with conditional cards.
- Possible to change button state by publishing to the topic with automations (Node-Red, etc).

## Installation
Requires a working MQTT setup with discovery enabled in Home Assistant. For more information check out the Home Assistant [documentation](https://www.home-assistant.io/docs/mqtt/discovery/).

The card will start in configuration mode and prompt you to create the MQTT config required for auto discovery. If the enitity doesn't exist it will be created with the entity provided in the card config. After the button is configured the sensor will show up in your Home Assistant entity list and is used by the card to track the last button press.

A visibility timeout can be used in combination with a conditional card to show and hide items on the front-end. This requires custom automation to achieve (I personally use Node-Red for this).
![](images/vis_example.gif)
## Options

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| type | string | **Required** | `custom:check-button-card`
| entity | string | **Required** | Sensor entity used to create and publish to.
| title | string | none | Title displayed next to the bar.
| visibility_timeout | string | none | Attribute added to entity for use in automation.
| undo_timeout | number | 15 | Time until undo button times out in seconds.
| hue | number | 220 | Changed the color hue of the bar `0`-`360`.
| saturation | string | 50% | Scales saturation of the bar.
| height | string | 40px | Scales the height of the bar.
| width | string | 70% | Scales the width of the bar.
| severity | object | none | A list of severity values. Can use `* minutes`,`* hours`,`* days`, `* months`,`* years`
| button_style | object | none | A list of CSS styles applied to the bar.
| title_style | object | none | A list of CCS styles applied to the title.
| remove | boolean | false | Set to `true` for removal config mode. Used to remove entity from MQTT discovery.
| discovery_prefix | string | homeassistant | Define custom MQTT discovery prefix.

## Default

```yaml
- type: custom:check-button-card
  title: Default
  entity: sensor.test_button
```
## Severity

```yaml
- type: custom:check-button-card
  title: Severity
  entity: sensor.test_button
  severity:
  - value: 5 minutes
    hue: '120'
  - value: 10 minutes
    hue: '40'
  - value: 20 minutes
    hue: '0'
```

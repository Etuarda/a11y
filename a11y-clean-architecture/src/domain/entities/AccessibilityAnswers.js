export class AccessibilityAnswers {
  constructor({
    interfaceType,
    keyboardOnly,
    screenReader,
    sensorySensitivity,
    highCognitiveLoad,
    timePressure
  }) {
    this.interfaceType = interfaceType;
    this.keyboardOnly = keyboardOnly;
    this.screenReader = screenReader;
    this.sensorySensitivity = sensorySensitivity;
    this.highCognitiveLoad = highCognitiveLoad;
    this.timePressure = timePressure;
  }
}

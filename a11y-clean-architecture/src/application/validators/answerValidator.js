import { HttpError } from '../../shared/HttpError.js';
import { AccessibilityAnswers } from '../../domain/entities/AccessibilityAnswers.js';

const ALLOWED_INTERFACE_TYPES = ['form', 'modal', 'navigation', 'content'];

function requireBoolean(value, fieldName) {
  if (typeof value !== 'boolean') {
    throw new HttpError(`Field "${fieldName}" must be a boolean.`, 400);
  }
}

function requireNonEmptyString(value, fieldName) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(`Field "${fieldName}" must be a non-empty string.`, 400);
  }
}

export function validateAndCreateAnswers(rawAnswers) {
  const {
    interfaceType,
    keyboardOnly,
    screenReader,
    sensorySensitivity,
    highCognitiveLoad,
    timePressure
  } = rawAnswers ?? {};

  requireNonEmptyString(interfaceType, 'interfaceType');

  if (!ALLOWED_INTERFACE_TYPES.includes(interfaceType)) {
    throw new HttpError(
      `Field "interfaceType" must be one of: ${ALLOWED_INTERFACE_TYPES.join(', ')}.`,
      400
    );
  }

  requireBoolean(keyboardOnly, 'keyboardOnly');
  requireBoolean(screenReader, 'screenReader');
  requireBoolean(sensorySensitivity, 'sensorySensitivity');
  requireBoolean(highCognitiveLoad, 'highCognitiveLoad');
  requireBoolean(timePressure, 'timePressure');

  return new AccessibilityAnswers({
    interfaceType,
    keyboardOnly,
    screenReader,
    sensorySensitivity,
    highCognitiveLoad,
    timePressure
  });
}

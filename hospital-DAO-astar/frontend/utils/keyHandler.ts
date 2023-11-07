import React from 'react';

import {
  KEYBOARD_EVENT_KEY_ENTER,
  KEYBOARD_EVENT_KEY_ESC
} from 'constants/keys';

export function handleSpecificKeyPress(key: string, callback?: () => void) {
  return (e?: KeyboardEvent | React.KeyboardEvent) => {
    if (e?.key === key && callback && typeof callback === 'function') {
      e.preventDefault();
      callback();
    }
  };
}

export function handleEnterKeyPress(
  callback?: () => void
): (e?: KeyboardEvent | React.KeyboardEvent) => void {
  return handleSpecificKeyPress(KEYBOARD_EVENT_KEY_ENTER, callback);
}

export function handleEscKeyPress(
  callback?: () => void
): (e?: KeyboardEvent | React.KeyboardEvent) => void {
  return handleSpecificKeyPress(KEYBOARD_EVENT_KEY_ESC, callback);
}

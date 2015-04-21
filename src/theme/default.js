import React from 'react';
import TextInput from '../inputs/text';

export default function defaultTheme() {
  let map = new WeakMap();
  map.set(TextInput, 'input');

  return {
    Component: 'div',
    views: map
  };
}

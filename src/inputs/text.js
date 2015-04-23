'use strict';
import React from 'react';
import InputBase from './input-base';
import lengthValidator from '../validators/length';

export default class TextInput extends React.Component {
  render() {
    let {
      length,
      validators,
      ...otherProps
    } = this.props;

    if (length !== undefined) {
      length = lengthValidator(length);
    } else {
      length = undefined;
    }

    return (
      <InputBase validators={[length].concat(validators)}
                 viewFor={this.constructor}
                 {...otherProps} />
    );
  }
};

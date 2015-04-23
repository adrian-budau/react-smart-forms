import React from 'react';
import {SmartForm, Inputs} from '../../src/main';

let form = (
  <SmartForm action={window.location} method="post">
    <Inputs.TextInput length={8} placeholder="Username" name="username"/>
  </SmartForm>
);

React.render(form, document.getElementById('react'));

'use strict';
import React from 'react/addons';
import classNames from 'classnames';
import {mergeValidators} from './utils';
import FormDataStore from './form-data-store';
import defaultTheme from './theme/default';
import I18N from './i18n/default';

class SmartForm extends React.Component {
  constructor(props) {
    super(props);
    this.i18n = props.i18n || new I18N;
    this.theme = props.theme || defaultTheme();
    this.store = new FormDataStore(props.defaultFormState);
  }

  getChildContext() {
    return {
      smartForm: this,
      viewComponents: this.theme.views
    };
  }

  _handleChange() {
  }

  render() {
    const {
      className,
      children,
      theme,
      i18n,
      validators,
      submitValidators,
      onSubmit,
      onSubmitValid,
      onChange,
      onChangeValid,
      defaultFormState,
      ...otherProps
    } = this.props;

    const changeValidatorsPromise = mergeValidators(
      validators || [],
      this.i18n,
      this.store
    );

    const submitValidatorsPromise = mergeValidators(
      submitValidators || [],
      this.i18n,
      this.store
    );

    let realClassName = classNames(className, this.theme.className);
    return (
      <form {...otherProps} className={realClassName}>
        <this.theme.Component>
          {/*FIXME: remove this after react 0.14 ships, when context transfers from owner to parent*/}
          {React.addons.cloneWithProps(children)}
        </this.theme.Component>
      </form>
    );
  }
}

SmartForm.childContextTypes = {
  smartForm: React.PropTypes.object,
  viewComponents: React.PropTypes.object,
}

export default SmartForm;

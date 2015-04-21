'use strict';
import React from 'react';
import {mergeValidators, arrayCompare} from '../utils';

export default class InputBase extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.smartForm = context.smartForm;
    this.store = context.smartForm.store;
    this.i18n = context.smartForm.i18n;
    this.viewComponents = context.viewComponents;
    this.state = {}

    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.updateStateFromStore = this.updateStateFromStore.bind(this);
  }

  // lifecycle methods
  componentWillMount() {
    this.subscription = this.store.listenForChanges(
      this.props.name,
      this.updateStateFromStore
    );

    this.updateChangePromise(this.props);
    this.updateBlurPromise(this.props);
    this.updateStateFromStore();
  }

  componentWillUnmount() {
    this.subscription.dispose();

    if (this.changeValidatorPromise) {
      this.changeValidatorPromise.cleanContexts();
    }

    if (this.blurValidatorPromise) {
      this.blurValidatorPromise.cleanContexts();
    }
  }

  componentWillReceiveProps(props) {
    if (arrayCompare(this.props.validators, props.validators)) {
        updateChangePromise(props);
    }

    if (arrayCompare(this.props.blurValidators, props.blurValidators)) {
        updateBlurPromise(props);
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.data !== nextState.data) {
      this.changeValidatorPromise().then(function() {
        this.smartForm._handleChange();
      }.bind(this));
    }
  }

  // normal methods
  updateStateFromStore() {
    let store = this.store;
    this.setState({
      data: store.getData(this.props.name) || null,
      error: store.getError(this.props.name) || null,
      async: store.getAsync(this.props.name) || false
    });
  }

  updateChangePromise(props) {
    if (this.changeValidatorPromise) {
      this.changeValidatorPromise.cleanContexts();
    }

    this.changeValidatorPromise = mergeValidators(
      props.validators || [],
      this.i18n,
      this.store,
      props.name
    );
  }

  updateBlurPromise(props) {
    if (this.blurValidatorPromise) {
      this.blurValidatorPromise.cleanContexts();
    }

    this.blurValidatorPromise = mergeValidators(
      props.blurValidators || [],
      this.i18n,
      this.store,
      props.name
    );
  }

  onChange(event) {
    this.store.setData(this.props.name, event.target.value);
  }

  onBlur() {
    return this.blurValidatorPromise();
  }

  render() {
    const {
      validators,
      blurValidators,
      viewFor,
      name,
      ...otherProps
    } = this.props;

    let Component = this.viewComponents.get(viewFor);

    return (
      <Component {...otherProps} error={this.state.error} value={this.state.data} async={this.state.async}
        onChange={this.onChange} onBlur={this.onBlur}
      />
    );
  }
};

InputBase.contextTypes = {
  smartForm: React.PropTypes.object,
  viewComponents: React.PropTypes.object,
}

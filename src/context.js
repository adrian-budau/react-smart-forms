'use strict';
import Immutable from 'immutable';
import {Disposable} from 'event-kit';

export default class ValidatorContext {
  constructor(fieldName, store, i18n) {
    this.fieldName = fieldName;
    this.store = store;
    this.i18n = i18n;
    this.fields = Immutable.Set();
  }

  subscription() {
    return new Disposable(() => {
      let fields = this.fields;
      this.fields = Immutable.Set();
      fields.forEach((fieldName) => {
        this.store.clearErrorAsync(fieldName, this);
      });
    });
  }

  ok(fieldName) {
    this.fields = this.fields.add(fieldName || this.fieldName);
    this.store.setAsync(fieldName || this.fieldName, this, undefined);
    this.store.setError(fieldName || this.fieldName, this, undefined);
  }

  error(error, fieldName) {
    this.fields = this.fields.add(fieldName || this.fieldName);
    this.store.setAsync(fieldName || this.fieldName, this, undefined);
    this.store.setError(fieldName || this.fieldName, this, error);
  }

  async(data, fieldName) {
    this.fields = this.fields.add(fieldName || this.fieldName);
    this.store.setError(fieldName || this.fieldName, this, undefined);
    this.store.setAsync(fieldName || this.fieldName, this, data);
  }

  data(fieldName) {
    return this.store.getData(fieldName || this.fieldName);
  }

  hasError() {
    return this.fields.some((fieldName) =>
      this.store.getError(fieldName) !== undefined
    );
  }
};

'use strict';

import Immutable from 'immutable';
import {Emitter} from 'event-kit';

export default class FormDataStore {
  constructor(initialData) {
    this.data = Immutable.Map(this.initialData);
    this.error = Immutable.Map();
    this.async = Immutable.Map();

    this.defaultEmitter = new Emitter;
    this.emitters = Object.create(null);
  }

  getEmitter(name) {
    if (!name) {
      return this.defaultEmitter;
    }

    if (!(name in this.emitters)) {
      this.emitters[name] = new Emitter;
    }
    return this.emitters[name];
  }

  getData(name) {
    return this.data.get(name);
  }

  setData(name, value) {
    this.data = this.data.set(name, value);
    this.defaultEmitter.emit('change');
    this.getEmitter(name).emit('change');
    return this;
  }

  getAsync(name) {
    if (!this.async.has(name)) {
      return undefined;
    }
    return this.async.get(name).find((value) => (value !== undefined));
  }

  setAsync(name, context, value) {
    if (!this.async.has(name)) {
      this.async = this.async.set(name, Immutable.OrderedMap());
    }

    let newAsync = this.async.get(name).set(context, value);
    this.async = this.async.set(name, newAsync);

    this.defaultEmitter.emit('change');
    this.getEmitter(name).emit('change');
  }

  getError(name) {
    if (!this.error.has(name)) {
      return undefined;
    }
    return this.error.get(name).find((value) => (value !== undefined));
  }

  setError(name, context, value) {
    if (!this.error.has(name)) {
      this.error = this.error.set(name, Immutable.OrderedMap());
    }

    let newError = this.error.get(name).set(context, value);
    this.error = this.error.set(name, newError);

    this.defaultEmitter.emit('change');
    this.getEmitter(name).emit('change');
  }

  listenForChanges(name, func) {
    return this.getEmitter(name).on('change', func);
  }
};

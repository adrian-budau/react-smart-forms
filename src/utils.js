'use strict';
import Promise from 'bluebird';
import ValidatorContext from './context';
import {CompositeDisposable} from 'event-kit';

// Just a constant, not exposed
const ValidationError = {};

function isThenable(value) {
  return value && value.then instanceof Function
}

function throwAtError(validatorPromise) {
  return function() {
    return validatorPromise.call(this).then((value) => {
      if (this.hasError()) {
        return Promise.reject(ValidationError);
      }
      return value;
    });
  };
}

function promisifyValidator(validator) {
  function updateContext(value) {
    if (value === undefined) {
      this.ok();
    } else {
      this.error(value);
    }
  }

  if (validator.length === 0) {
    // no length, he knows what he's doing, using contexts and promises
    return Promise.method(validator);
  }

  if (validator.length === 1) {
    // length 1, just the callback, he's using contexts but with callback parameter
    return Promise.promisify(validator);
  }

  if (validator.length === 2) {
    // length 2, he's not using the context so he doesn't need anything special, wrap it up
    return function () {
      // Don't pass the arguments, we don't want anything fishy going on
      let returnedValue = validator.call(undefined, this.data(), this.fieldName);
      if (isThenable(returnedValue)) {
        // so it's a promise, but with no context the function can't explicitly
        // tell us it's an async function, let's help him
        this.async();
        return returnedValue.then(updateContext.bind(this));
      }
      return Promise.resolve(updateContext.call(this, returnedValue));
    };
  }

  if (validator.length > 3) {
    console.warn(
       `You have supplied a validator that expects ${validator.length} arguments.\n` +
       `Normally a validator should expect between 0 and 3 arguments. We're considering` +
       ` yours as one that expects 3 arguments, but check your code anyway.`);
  }

  // length 3, the 3rd one is a callback to be called
  // that means this is an async validator
  return function() {
    // we know it's asynchronous but the function can't explicitly say this
    this.async();
    return Promise.promisify(validator).call(
      undefined,
      this.data(),
      this.fieldName
    ).then(updateContext.bind(this));
  }
}

export function mergeValidators(validators, i18n, store, fieldName) {
  let subscriptions = new CompositeDisposable;

  validators = validators
    .filter(x => x)
    .map(validator => {
      let context = new ValidatorContext(fieldName, store, i18n);
      subscriptions.add(context.subscription());
      return throwAtError(promisifyValidator(validator)).bind(context);
    });

  function promise() {
    return validators.reduce(
      (a, b) => a.then(b),
      Promise.resolve()
    ).catch(reason => {
      if (reason === ValidationError)
        return;
      else
        return Promise.reject(reason);
    });
  }

  promise.cleanContexts = function() {
    subscriptions.dispose();
  }

  return promise;
}

export function arrayCompare(array1, array2) {
  if (array1.length !== array2.length) {
    return false;
  }

  for (let i = 0; i < array1.length; ++i) {
    if (array1[i] != array2[i]) {
      return false;
    }
  }

  return true;
}

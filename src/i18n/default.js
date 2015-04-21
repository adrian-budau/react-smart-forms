'use strict';

import {sprintf} from 'sprintf-js';

export default class I18N {
  translate(text, ...args) {
    return sprintf(text, ...args);
  }

  translatePlural(number, text, ...args) {
    return sprintf(text, ...args);
  }
};

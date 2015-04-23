'use strict';

export default function length(length) {
  return function () {
    if ((this.data() || '').length !== length) {
      this.error(
        this.i18n.translate(
          'Field %s should have length at least %s, but has length %s',
          this.fieldName,
          this.data(),
          (this.data() || '').length
        )
      );
    } else {
      this.ok();
    }
  }
}

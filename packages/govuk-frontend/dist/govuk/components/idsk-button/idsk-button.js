(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('GOVUKFrontend.IdskButton', factory) :
  (global.GOVUKFrontend = global.GOVUKFrontend || {}, global.GOVUKFrontend.IdskButton = factory());
}(this, (function () { 'use strict';

  /* eslint-disable */

  var KEY_SPACE = 32;
  var DEBOUNCE_TIMEOUT_IN_SECONDS = 1;

  /**
   * JavaScript enhancements for the Button component
   *
   * @param {object} $module - HTML element to use for button
   */
  function IdskButton ($module) {
    this.$module = $module;
    this.debounceFormSubmitTimer = null;
  }

  /**
   * JavaScript 'shim' to trigger the click event of element(s) when the space key is pressed.
   *
   * Created since some Assistive Technologies (for example some Screenreaders)
   * will tell a user to press space on a 'button', so this functionality needs to be shimmed
   * See https://github.com/alphagov/govuk_elements/pull/272#issuecomment-233028270
   *
   * @param {object} event - event
   */
  IdskButton.prototype.handleKeyDown = function (event) {
    // get the target element
    var target = event.target;
    // if the element has a role='button' and the pressed key is a space, we'll simulate a click
    if (target.getAttribute('role') === 'button' && event.keyCode === KEY_SPACE) {
      event.preventDefault();
      // trigger the target's click event
      target.click();
    }
  };

  /**
   * If the click quickly succeeds a previous click then nothing will happen.
   * This stops people accidentally causing multiple form submissions by
   * double clicking buttons.
   *
   * @param {object} event - event
   * @returns {boolean|undefined} - false if the click should be prevented
   */
  IdskButton.prototype.debounce = function (event) {
    var target = event.target;
    // Check the button that is clicked on has the preventDoubleClick feature enabled
    if (target.getAttribute('data-prevent-double-click') !== 'true') {
      return
    }

    // If the timer is still running then we want to prevent the click from submitting the form
    if (this.debounceFormSubmitTimer) {
      event.preventDefault();
      return false
    }

    this.debounceFormSubmitTimer = setTimeout(
      function () {
        this.debounceFormSubmitTimer = null;
      }.bind(this),
      DEBOUNCE_TIMEOUT_IN_SECONDS * 1000
    );
  };

  /**
   * Initialise an event listener for keydown at document level
   * this will help listening for later inserted elements with a role="button"
   */
  IdskButton.prototype.init = function () {
    this.$module.addEventListener('keydown', this.handleKeyDown);
    this.$module.addEventListener('click', this.debounce);
  };

  return IdskButton;

})));
//# sourceMappingURL=idsk-button.js.map

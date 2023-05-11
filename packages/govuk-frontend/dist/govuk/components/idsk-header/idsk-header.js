(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('GOVUKFrontend.IdskHeader', factory) :
  (global.GOVUKFrontend = global.GOVUKFrontend || {}, global.GOVUKFrontend.IdskHeader = factory());
}(this, (function () { 'use strict';

  /**
   * Common helpers which do not require polyfill.
   *
   * IMPORTANT: If a helper require a polyfill, please isolate it in its own module
   * so that the polyfill can be properly tree-shaken and does not burden
   * the components that do not need that helper
   *
   * @module common/index
   */

  /**
   * Toggle class
   *
   * @param {object} node - element
   * @param {string} className - to toggle
   */
  function toggleClass (node, className) {
    if (node === null) {
      return
    }

    if (node.className.indexOf(className) > 0) {
      node.className = node.className.replace(' ' + className, '');
    } else {
      node.className += ' ' + className;
    }
  }

  // Implementation of common function is gathered in the `common` folder

  /* eslint-disable */

  /**
   * Header component
   *
   * @class
   * @param {Element} $module - HTML element to use for header
   */
  function IdskHeader($module) {
    this.$module = $module;
  }

  /**
   * Initialise header
   */
  IdskHeader.prototype.init = function () {
    // Check for module
    var $module = this.$module;
    if (!$module) {
      return
    }

    // Check for button
    var $toggleButton = $module.querySelector('.govuk-js-header-toggle');
    if (!$toggleButton) {
      return
    }

    // Handle $toggleButton click events
    $toggleButton.addEventListener('click', this.handleClick.bind(this));
  };

  /**
   * Toggle class
   *
   * @param {object} node - element
   * @param {string} className - className to toggle
   */
  IdskHeader.prototype.toggleClass = function (node, className) {
    if (node.className.indexOf(className) > 0) {
      node.className = node.className.replace(' ' + className, '');
    } else {
      node.className += ' ' + className;
    }
  };

  /**
   * An event handler for click event on $toggleButton
   *
   * @param {object} event - event
   */
  IdskHeader.prototype.handleClick = function (event) {
    var $module = this.$module;
    var $toggleButton = event.target || event.srcElement;
    var $target = $module.querySelector('#' + $toggleButton.getAttribute('aria-controls'));

    // If a button with aria-controls, handle click
    if ($toggleButton && $target) {
      toggleClass($target, 'idsk-header__navigation--open');
      toggleClass($toggleButton, 'idsk-header__menu-button--open');

      $toggleButton.setAttribute('aria-expanded', $toggleButton.getAttribute('aria-expanded') !== 'true');
      $target.setAttribute('aria-hidden', ($target.getAttribute('aria-hidden') === 'false').toString());
    }
  };

  return IdskHeader;

})));
//# sourceMappingURL=idsk-header.js.map

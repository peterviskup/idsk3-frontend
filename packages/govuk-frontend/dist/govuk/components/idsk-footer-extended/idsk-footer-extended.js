(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('GOVUKFrontend.IdskFooterExtended', factory) :
  (global.GOVUKFrontend = global.GOVUKFrontend || {}, global.GOVUKFrontend.IdskFooterExtended = factory());
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
   * Footer for extended websites
   */
  function IdskFooterExtended ($module) {
    this.$module = $module;
  }

  /**
   * FooterExtended init function
   */
  IdskFooterExtended.prototype.init = function () {
    var $module = this.$module;
    // check for module
    if (!$module) {
      return
    }

    var $yesButton = $module.querySelector(
      '#idsk-footer-extended-feedback-yes-button'
    );
    var $noButton = $module.querySelector(
      '#idsk-footer-extended-feedback-no-button'
    );
    var $errorButton = $module.querySelector('#idsk-footer-extended-error-button');
    var $closeErrorFormButton = $module.querySelector(
      '#idsk-footer-extended-close-error-form-button'
    );
    var $closeHelpFormButton = $module.querySelector(
      '#idsk-footer-extended-close-help-form-button'
    );
    var $textAreaCharacterCount = $module.querySelector(
      '#idsk-footer-extended-error-form #with-hint'
    );
    var $submitErrorButton = $module.querySelector('#submit-button-error-form');
    var $writeUsButton = $module.querySelector(
      '#idsk-footer-extended-write-us-button'
    );
    var $upButton = $module.querySelector('#footer-extended-up-button');

    if ($yesButton && $noButton) {
      $yesButton.addEventListener('click', this.handleYesButtonClick.bind(this));
      $noButton.addEventListener('click', this.handleNoButtonClick.bind(this));
    }

    if ($errorButton) {
      $errorButton.addEventListener(
        'click',
        this.handleErrorButtonClick.bind(this)
      );
    }

    if ($writeUsButton) {
      $writeUsButton.addEventListener(
        'click',
        this.handleErrorButtonClick.bind(this)
      );
    }

    if ($closeHelpFormButton) {
      $closeHelpFormButton.addEventListener(
        'click',
        this.handleCloseHelpFormButtonClick.bind(this)
      );
    }

    if ($closeErrorFormButton) {
      $closeErrorFormButton.addEventListener(
        'click',
        this.handleCloseErrorFormButtonClick.bind(this)
      );
    }

    if ($submitErrorButton) {
      $submitErrorButton.addEventListener(
        'click',
        this.handleSubmitButtonClick.bind(this)
      );
    }

    if ($textAreaCharacterCount) {
      $textAreaCharacterCount.addEventListener(
        'input',
        this.handleStatusOfCharacterCountButton.bind(this)
      );
    }

    // Get the button
    // When the user scrolls down window screen heiht From the top of the document, show the button
    if ($upButton != null) {
      window.addEventListener('scroll', this.scrollFunction.bind(this));
    }
  };

  /**
   * FooterExtended handleSubmitButtonClick handler
   */
  IdskFooterExtended.prototype.handleSubmitButtonClick = function (e) {
    var $noOption = this.$module.querySelector('#idsk-footer-extended-help-form');
    var $errorOption = this.$module.querySelector(
      '#idsk-footer-extended-error-form'
    );
    var $infoQuestion = this.$module.querySelector(
      '#idsk-footer-extended-info-question'
    );
    var $heartSymbol = this.$module.querySelector('#idsk-footer-extended-heart');
    var $feedbackQuestion = this.$module.querySelector(
      '#idsk-footer-extended-feedback'
    );
    var $helpAndErrorContainer = this.$module.querySelector(
      '#idsk-footer-extended-feedback-content'
    );

    toggleClass($helpAndErrorContainer, 'idsk-footer-extended-feedback-content');
    $noOption.classList.add('idsk-footer-extended-display-hidden');
    $errorOption.classList.add('idsk-footer-extended-display-hidden');
    $noOption.classList.remove('idsk-footer-extended-open');
    $errorOption.classList.remove('idsk-footer-extended-open');

    toggleClass($infoQuestion, 'idsk-footer-extended-heart');
    toggleClass($heartSymbol, 'idsk-footer-extended-heart-visible');
    toggleClass($feedbackQuestion, 'idsk-footer-extended-display-none');

    var $selection = this.$module.querySelector('#sort');
    var $issueTextArea = this.$module.querySelector('#with-hint');
    var $feedbackInfo = this.$module.querySelector(
      '.idsk-footer-extended__feedback-info'
    );

    var selectedOption = $selection.value;
    var issueText = $issueTextArea.value;

    if ($feedbackInfo) {
      var email = $feedbackInfo.getAttribute('data-email');
      var subject = $feedbackInfo.getAttribute('data-subject');
      var emailBody = $feedbackInfo.textContent;
      emailBody = emailBody
        .replace('%issue%', selectedOption)
        .replace('%description%', issueText);
      document.location =
        'mailto:' + email + '?subject=' + subject + '&body=' + emailBody;
    }
  };

  /**
   * FooterExtended handleStatusOfCharacterCountButton handler
   */
  IdskFooterExtended.prototype.handleStatusOfCharacterCountButton = function (e) {
    var $textAreaCharacterCount = this.$module.querySelector('#with-hint');
    var $remainingCharacterCountMessage =
      this.$module.querySelector('#with-hint-info');

    var $submitButton = this.$module.querySelector('#submit-button-error-form');

    setTimeout(function () {
      if (
        $textAreaCharacterCount.classList.contains('govuk-textarea--error') ||
        $remainingCharacterCountMessage.classList.contains('govuk-error-message')
      ) {
        $submitButton.disabled = true;
      } else {
        $submitButton.disabled = false;
      }
    }, 300);
  };

  /**
   * Hiding feedback question text and showing thank notice with heart
   */
  IdskFooterExtended.prototype.handleYesButtonClick = function (e) {
    var $noOption = this.$module.querySelector('#idsk-footer-extended-help-form');
    var $errorOption = this.$module.querySelector(
      '#idsk-footer-extended-error-form'
    );
    var $infoQuestion = this.$module.querySelector(
      '#idsk-footer-extended-info-question'
    );
    var $heartSymbol = this.$module.querySelector('#idsk-footer-extended-heart');

    $noOption.classList.add('idsk-footer-extended-display-hidden');
    $errorOption.classList.add('idsk-footer-extended-display-hidden');

    toggleClass($infoQuestion, 'idsk-footer-extended-heart');
    toggleClass($heartSymbol, 'idsk-footer-extended-heart-visible');
    $heartSymbol.setAttribute('aria-label', 'Ďakujeme za Vašu spätnú väzbu');
  };

  /**
   * Hiding feedback question element and showing help form with animation
   */
  IdskFooterExtended.prototype.handleNoButtonClick = function (e) {
    var $helpOption = this.$module.querySelector(
      '#idsk-footer-extended-help-form'
    );
    var $feedbackQuestion = this.$module.querySelector(
      '#idsk-footer-extended-feedback'
    );
    var $helpInfo = this.$module.querySelector('.idsk-footer-extended-form-text');
    var $footerButton = this.$module.querySelector('#fill-feedback-help-form');

    var $helpAndErrorContainer = this.$module.querySelector(
      '#idsk-footer-extended-feedback-content'
    );

    toggleClass($helpAndErrorContainer, 'idsk-footer-extended-feedback-content');
    toggleClass($feedbackQuestion, 'idsk-footer-extended-display-none');
    toggleClass($helpOption, 'idsk-footer-extended-display-hidden');
    toggleClass($helpOption, 'idsk-footer-extended-open');
    $helpInfo.setAttribute(
      'aria-label',
      'Aby sme vedeli zlepšiť obsah na tejto stránke, chceli by sme vedieť o Vašej skúsenosti so stránkou. Pošleme Vám link na formulár spätnej väzby. Jeho vyplnenie Vám zaberie iba 2 minúty.'
    );
    $footerButton.setAttribute('aria-label', 'Vyplniť prieskum');
  };

  /**
   * Hiding feedback question element and showing error form with animation
   */
  IdskFooterExtended.prototype.handleErrorButtonClick = function (e) {
    var $errorOption = this.$module.querySelector(
      '#idsk-footer-extended-error-form'
    );
    var $helpOption = this.$module.querySelector(
      '#idsk-footer-extended-help-form'
    );
    var $feedbackQuestion = this.$module.querySelector(
      '#idsk-footer-extended-feedback'
    );

    var $helpAndErrorContainer = this.$module.querySelector(
      '#idsk-footer-extended-feedback-content'
    );

    toggleClass($helpAndErrorContainer, 'idsk-footer-extended-feedback-content');
    toggleClass($feedbackQuestion, 'idsk-footer-extended-display-none');
    $helpOption.classList.add('idsk-footer-extended-display-hidden');
    $helpOption.classList.remove('idsk-footer-extended-open');
    toggleClass($errorOption, 'idsk-footer-extended-display-hidden');
    toggleClass($errorOption, 'idsk-footer-extended-open');
  };

  /**
   * Hiding error form with animation and showing feedback question element
   */
  IdskFooterExtended.prototype.handleCloseErrorFormButtonClick = function (e) {
    var $errorOption = this.$module.querySelector(
      '#idsk-footer-extended-error-form'
    );
    var $feedbackQuestion = this.$module.querySelector(
      '#idsk-footer-extended-feedback'
    );
    var $helpAndErrorContainer = this.$module.querySelector(
      '#idsk-footer-extended-feedback-content'
    );

    toggleClass($helpAndErrorContainer, 'idsk-footer-extended-feedback-content');
    toggleClass($feedbackQuestion, 'idsk-footer-extended-display-none');
    toggleClass($errorOption, 'idsk-footer-extended-open');
    toggleClass($errorOption, 'idsk-footer-extended-display-hidden');
  };

  /**
   * Hiding help form with animation and showing feedback question element
   */
  IdskFooterExtended.prototype.handleCloseHelpFormButtonClick = function () {
    var $helpOption = this.$module.querySelector(
      '#idsk-footer-extended-help-form'
    );
    var $feedbackQuestion = this.$module.querySelector(
      '#idsk-footer-extended-feedback'
    );
    var $helpAndErrorContainer = this.$module.querySelector(
      '#idsk-footer-extended-feedback-content'
    );

    toggleClass($helpAndErrorContainer, 'idsk-footer-extended-feedback-content');
    toggleClass($feedbackQuestion, 'idsk-footer-extended-display-none');
    toggleClass($helpOption, 'idsk-footer-extended-open');
    toggleClass($helpOption, 'idsk-footer-extended-display-hidden');
  };

  /**
   * FooterExtended scrollFunction handler
   */
  IdskFooterExtended.prototype.scrollFunction = function () {
    var $upButton = this.$module.querySelector('#footer-extended-up-button');

    if (
      window.innerWidth > 768 &&
      (document.body.scrollTop > window.screen.height ||
        document.documentElement.scrollTop > window.screen.height)
    ) {
      $upButton.style.display = 'block';
    } else {
      $upButton.style.display = 'none';
    }
  };

  return IdskFooterExtended;

})));
//# sourceMappingURL=idsk-footer-extended.js.map

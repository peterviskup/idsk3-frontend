/* eslint-disable */

/**
 * SubscriptionForm
 *
 * @param {object} $module - The module to enhance
 */
function IdskSubscriptionForm ($module) {
  this.$module = $module;
}

/**
 * SubscriptionForm init function
 */
IdskSubscriptionForm.prototype.init = function () {
  // Check for module
  var $module = this.$module;
  if (!$module) {
    return
  }

  // button to toggle content
  var $form = $module.querySelector('.idsk-subscription-form__submit-handler');
  if ($form) {
    $form.addEventListener('submit', this.handleSubmitForm.bind(this));
  }

  var $input = $module.querySelector('.govuk-input');

  $input.addEventListener('change', this.handleInput.bind(this));
};

/**
 * An event handler for submit event on $form
 *
 * @param {object} e - The event object
 */
IdskSubscriptionForm.prototype.handleSubmitForm = function (e) {
  e.preventDefault();
  var $input = e.target.querySelector('#subscription-email-value');
  var $formGroup = $input.parentElement;

  // Handle email validation
  if (!$input.checkValidity()) {
    $formGroup.querySelectorAll('.govuk-error-message').forEach(function (e) {
      e.remove();
    });
    var $errorLabel = document.createElement('span');
    $errorLabel.classList.add('govuk-error-message');
    $errorLabel.textContent = $input.validationMessage;

    $input.classList.add('govuk-input--error');
    $formGroup.classList.add('govuk-form-group--error');
    $input.before($errorLabel);
    return
  }

  // set class for different state
  this.$module.classList.add('idsk-subscription-form__subscription-confirmed');
};

/**
 * SubscriptionForm handleInput handler
 *
 * @param {object} e - The event object
 */
IdskSubscriptionForm.prototype.handleInput = function (e) {
  var $el = e.target || e.srcElement || e;
  var $searchComponent = $el.closest('.idsk-subscription-form__input');
  var $searchLabel = $searchComponent.querySelector('label');

  // Handle label visibility
  if ($el.value === '') {
    $searchLabel.classList.remove('govuk-visually-hidden');
  } else {
    $searchLabel.classList.add('govuk-visually-hidden');
  }
};

export default IdskSubscriptionForm;
//# sourceMappingURL=components/idsk-subscription-form/idsk-subscription-form.mjs.map

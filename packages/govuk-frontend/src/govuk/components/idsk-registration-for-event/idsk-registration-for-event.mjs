/* eslint-disable */
/* eslint-disable es-x/no-function-prototype-bind -- Polyfill imported */

/**
 * RegistrationForEvent Component
 *
 * @param {object} $module - HTML element to use for RegistrationForEvent component
 */
function IdskRegistrationForEvent ($module) {
  this.$module = $module
}

/**
 * RegistrationForEvent Component init function
 */
IdskRegistrationForEvent.prototype.init = function () {
  // Check for module
  var $module = this.$module
  if (!$module) {
    return
  }

  // Check for button
  var $submitButtons = $module.querySelectorAll(
    '.idsk-registration-for-event-js-submit'
  )
  if (!$submitButtons) {
    return
  }

  // Handle $submitButtons click events
  $submitButtons.forEach(
    function ($submitButton) {
      $submitButton.addEventListener('click', this.handleSubmitClick.bind(this))
    }.bind(this)
  )
}

/**
 * RegistrationForEvent Component handle submit click function
 */
IdskRegistrationForEvent.prototype.handleSubmitClick = function (e) {
  e.preventDefault()

  var $module = this.$module
  var $form = $module.querySelector('.idsk-registration-for-event__form')
  var $thankYouMsg = $module.querySelector(
    '.idsk-registration-for-event__thank-you-msg'
  )
  var $requiredFormItems = $module.querySelectorAll('[required]')
  var $valid = true
  var emailRegex = /\S+@\S+\.\S+/

  $requiredFormItems.forEach(function ($item) {
    var $formGroup = $item.closest('.govuk-form-group')

    if (
      !$item.checkValidity() ||
      ($item.type === 'email' && !emailRegex.test($item.value))
    ) {
      $formGroup.querySelector('.govuk-error-message').style.display = 'block'
      $formGroup.classList.add('govuk-form-group--error')
      $item.classList.add('govuk-input--error')
      $valid = false
    } else {
      $formGroup.querySelector('.govuk-error-message').style.display = 'none'
      $formGroup.classList.remove('govuk-form-group--error')
      $item.classList.remove('govuk-input--error')
    }
  })

  if ($valid) {
    $thankYouMsg.style.display = 'block'
    $form.style.display = 'none'
  }
}

export default IdskRegistrationForEvent

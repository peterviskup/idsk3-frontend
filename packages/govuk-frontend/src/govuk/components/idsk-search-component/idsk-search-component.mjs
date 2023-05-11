/* eslint-disable */

/**
 * Search Component
 *
 * @param {object} $module - HTML element to use for search component
 */
function IdskSearchComponent ($module) {
  this.$module = $module
}

/**
 * Search Component init function
 */
IdskSearchComponent.prototype.init = function () {
  // Check for module
  var $module = this.$module
  if (!$module) {
    return
  }

  var $searchInputs = $module.querySelectorAll('.idsk-search-component__input')
  if (!$searchInputs) {
    return
  }

  $searchInputs.forEach(
    function ($searchInput) {
      $searchInput.addEventListener('change', this.handleSearchInput.bind(this))
    }.bind(this)
  )
}

/**
 * Handle search input
 *
 * @param {object} e
 */
IdskSearchComponent.prototype.handleSearchInput = function (e) {
  var $el = e.target || e.srcElement || e
  var $searchComponent = $el.closest('.idsk-search-component')
  var $searchLabel = $searchComponent.querySelector('label')

  if ($el.value === '') {
    $searchLabel.classList.remove('govuk-visually-hidden')
  } else {
    $searchLabel.classList.add('govuk-visually-hidden')
  }
}

export default IdskSearchComponent

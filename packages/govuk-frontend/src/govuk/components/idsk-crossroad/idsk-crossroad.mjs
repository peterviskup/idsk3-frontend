/* eslint-disable */

import { toggleClass } from '../../common.mjs'

/**
 * Crossroad Component
 */
function IdskCrossroad ($module) {
  this.$module = $module
  this.$items = $module.querySelectorAll('.idsk-crossroad-title')
}

/**
 * Crossroad init function
 */
IdskCrossroad.prototype.init = function () {
  var $module = this.$module
  var $items = this.$items
  var $uncollapseButton = $module.querySelector(
    '#idsk-crossroad__uncollapse-button'
  )

  if (!$module || !$items) {
    return
  }

  if ($uncollapseButton) {
    // eslint-disable-next-line es-x/no-function-prototype-bind
    $uncollapseButton.addEventListener('click', this.handleShowItems.bind(this))
  }

  $items.forEach(
    function ($item) {
      $item.addEventListener('click', this.handleItemClick.bind(this))
    }.bind(this)
  )
}

/**
 * Crossroad handleItemClick callback
 */
IdskCrossroad.prototype.handleItemClick = function (e) {
  var $item = e.target
  $item.setAttribute('aria-current', 'true')
}

/**
 * Crossroad setAriaLabel callback
 */
IdskCrossroad.prototype.setAriaLabel = function (arr) {
  arr.forEach(function (item) {
    if (item.classList.contains('idsk-crossroad__arria-hidden')) {
      item.setAttribute('aria-hidden', 'true')
      toggleClass(item, 'idsk-crossroad__arria-hidden')
    } else if (item.getAttribute('aria-hidden') === 'true') {
      item.setAttribute('aria-hidden', 'false')
      toggleClass(item, 'idsk-crossroad__arria-hidden')
    }
  })
}

/**
 * Crossroad handleShowItems callback
 */
IdskCrossroad.prototype.handleShowItems = function (e) {
  var $crossroadItems = this.$module.querySelectorAll('.idsk-crossroad__item')
  var $uncollapseButton = this.$module.querySelector(
    '#idsk-crossroad__uncollapse-button'
  )
  var $uncollapseDiv = this.$module.querySelector(
    '.idsk-crossroad__uncollapse-div'
  )
  var $crossroadTitles = this.$module.querySelectorAll('.idsk-crossroad-title')
  var $crossroadSubtitles = this.$module.querySelectorAll(
    '.idsk-crossroad-subtitle'
  )
  var $expandedButton = this.$module.querySelector(
    '.idsk-crossroad__colapse--button'
  )

  $crossroadItems.forEach(function (crossroadItem) {
    toggleClass(crossroadItem, 'idsk-crossroad__item--two-columns-show')
  })

  this.setAriaLabel($crossroadTitles)
  this.setAriaLabel($crossroadSubtitles)

  $uncollapseButton.innerHTML =
    $uncollapseButton.textContent === $uncollapseButton.dataset.line1
      ? $uncollapseButton.dataset.line2
      : $uncollapseButton.dataset.line1

  toggleClass(e.srcElement, 'idsk-crossroad__colapse--button-show')
  toggleClass($uncollapseDiv, 'idsk-crossroad__collapse--shadow')
  toggleClass($uncollapseDiv, 'idsk-crossroad__collapse--arrow')
  if (
    $expandedButton.classList.contains('idsk-crossroad__colapse--button-show')
  ) {
    $expandedButton.setAttribute('aria-expanded', 'true')
    $expandedButton.setAttribute(
      'aria-label',
      $expandedButton.getAttribute('data-text-for-show')
    )
  } else {
    $expandedButton.setAttribute('aria-expanded', 'false')
    $expandedButton.setAttribute(
      'aria-label',
      $expandedButton.getAttribute('data-text-for-hide')
    )
  }
}

export default IdskCrossroad

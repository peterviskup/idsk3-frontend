/*
  Accordion

  This allows a collection of sections to be collapsed by default,
  showing only their headers. Sections can be exanded or collapsed
  individually by clicking their headers. An "Open all" button is
  also added to the top of the accordion, which switches to "Close all"
  when all the sections are expanded.

  The state of each section is saved to the DOM via the `aria-expanded`
  attribute, which also provides accessibility.

*/

/* eslint-disable */

import '../../vendor/polyfills/Element/prototype/classList.mjs'

/**
 * Accordion Component
 *
 * @param {object} $module - The accordion module DOM element
 */
function IdskAccordion ($module) {
  this.$module = $module
  this.moduleId = $module.getAttribute('id')
  this.$sections = $module.querySelectorAll('.govuk-accordion__section')
  this.browserSupportsSessionStorage = helper.checkForSessionStorage()

  this.controlsClass = 'govuk-accordion__controls'
  this.openAllClass = 'govuk-accordion__open-all'
  this.iconClass = 'govuk-accordion__icon'

  this.sectionHeaderClass = 'govuk-accordion__section-header'
  this.sectionHeaderFocusedClass = 'govuk-accordion__section-header--focused'
  this.sectionHeadingClass = 'govuk-accordion__section-heading'
  this.sectionSummaryClass = 'govuk-accordion__section-summary'
  this.sectionButtonClass = 'govuk-accordion__section-button'
  this.sectionExpandedClass = 'govuk-accordion__section--expanded'

  this.$openAllButton = $module.querySelector('.govuk-accordion__open-all')
  this.$sectionSpan = $module.querySelector('.govuk-accordion__controls-span')
  this.openTitle = this.$openAllButton.dataset.openTitle
  this.closeTitle = this.$openAllButton.dataset.closeTitle
  this.sectionTitle = this.$sectionSpan.dataset.sectionTitle
}

/**
 * Initialise component
 */
IdskAccordion.prototype.init = function () {
  // Check for module
  if (!this.$module) {
    return
  }

  this.initControls()

  this.initSectionHeaders()

  // See if "Open all" button text should be updated
  var areAllSectionsOpen = this.checkIfAllSectionsOpen()
  this.updateOpenAllButton(areAllSectionsOpen)
}

/**
 * Initialise controls and set attributes
 */
IdskAccordion.prototype.initControls = function () {
  // Handle events for the controls
  this.$openAllButton.addEventListener(
    'click',
    this.onOpenOrCloseAllToggle.bind(this)
  )
}

/**
 * Initialise section headers
 */
IdskAccordion.prototype.initSectionHeaders = function () {
  // Loop through section headers
  this.$sections.forEach(
    function ($section, i) {
      // Set header attributes
      var header = $section.querySelector('.' + this.sectionHeaderClass)
      this.initHeaderAttributes(header, i)

      this.setExpanded(this.isExpanded($section), $section)

      // Handle events
      header.addEventListener(
        'click',
        this.onSectionToggle.bind(this, $section)
      )

      // See if there is any state stored in sessionStorage and set the sections to
      // open or closed.
      this.setInitialState($section)
    }.bind(this)
  )
}

/**
 * Set individual header attributes
 *
 * @param {object} $headerWrapper - The header wrapper DOM element
 * @param {number} index - The index of the header in the nodeList
 */
IdskAccordion.prototype.initHeaderAttributes = function ($headerWrapper, index) {
  var $module = this
  var $span = $headerWrapper.querySelector('.' + this.sectionButtonClass)
  var $heading = $headerWrapper.querySelector('.' + this.sectionHeadingClass)
  var $summary = $headerWrapper.querySelector('.' + this.sectionSummaryClass)

  // Copy existing span element to an actual button element, for improved accessibility.
  var $button = document.createElement('button')
  $button.setAttribute('type', 'button')
  $button.setAttribute('id', this.moduleId + '-heading-' + (index + 1))
  $button.setAttribute(
    'aria-controls',
    this.moduleId + '-content-' + (index + 1)
  )

  // Copy all attributes (https://developer.mozilla.org/en-US/docs/Web/API/Element/attributes) from $span to $button
  for (var i = 0; i < $span.attributes.length; i++) {
    var attr = $span.attributes.item(i)
    $button.setAttribute(attr.nodeName, attr.nodeValue)
  }

  $button.addEventListener('focusin', function (e) {
    if (!$headerWrapper.classList.contains($module.sectionHeaderFocusedClass)) {
      $headerWrapper.className += ' ' + $module.sectionHeaderFocusedClass
    }
  })

  $button.addEventListener('blur', function (e) {
    $headerWrapper.classList.remove($module.sectionHeaderFocusedClass)
  })

  if (typeof $summary !== 'undefined' && $summary !== null) {
    $button.setAttribute(
      'aria-describedby',
      this.moduleId + '-summary-' + (index + 1)
    )
  }

  // $span could contain HTML elements (see https://www.w3.org/TR/2011/WD-html5-20110525/content-models.html#phrasing-content)
  $button.innerHTML = $span.innerHTML

  $heading.removeChild($span)
  $heading.appendChild($button)

  // Add "+/-" icon
  var icon = document.createElement('span')
  icon.className = this.iconClass
  icon.setAttribute('aria-hidden', 'true')

  $heading.appendChild(icon)
}

/**
 * When section toggled, set and store state
 *
 * @param {object} $section - The section to toggle
 */
IdskAccordion.prototype.onSectionToggle = function ($section) {
  var expanded = this.isExpanded($section)
  this.setExpanded(!expanded, $section)

  // Store the state in sessionStorage when a change is triggered
  this.storeState($section)
}

/**
 * When Open/Close All toggled, set and store state
 */
IdskAccordion.prototype.onOpenOrCloseAllToggle = function () {
  var $module = this
  var $sections = this.$sections

  var nowExpanded = !this.checkIfAllSectionsOpen()

  $sections.forEach(function ($section) {
    $module.setExpanded(nowExpanded, $section)
    // Store the state in sessionStorage when a change is triggered
    $module.storeState($section)
  })

  $module.updateOpenAllButton(nowExpanded)
}

/**
 * Set section attributes when opened/closed
 *
 * @param {boolean} expanded - Whether the section is expanded or not
 * @param {object} $section - The section to toggle
 */
IdskAccordion.prototype.setExpanded = function (expanded, $section) {
  var $button = $section.querySelector('.' + this.sectionButtonClass)
  $button.setAttribute('aria-expanded', expanded)

  if (expanded) {
    $section.classList.add(this.sectionExpandedClass)
  } else {
    $section.classList.remove(this.sectionExpandedClass)
  }

  // See if "Open all" button text should be updated
  var areAllSectionsOpen = this.checkIfAllSectionsOpen()
  this.updateOpenAllButton(areAllSectionsOpen)
}

/**
 * Get state of section
 *
 * @param {object} $section - The section to check
 * @returns {boolean} Whether the section is expanded or not
 */
IdskAccordion.prototype.isExpanded = function ($section) {
  return $section.classList.contains(this.sectionExpandedClass)
}

/**
 * Check if all sections are open
 *
 * @returns {boolean} Whether all sections are open or not
 */
IdskAccordion.prototype.checkIfAllSectionsOpen = function () {
  // Get a count of all the Accordion sections
  var sectionsCount = this.$sections.length
  // Get a count of all Accordion sections that are expanded
  var expandedSectionCount = this.$module.querySelectorAll(
    '.' + this.sectionExpandedClass
  ).length
  var areAllSectionsOpen = sectionsCount === expandedSectionCount

  return areAllSectionsOpen
}

/**
 * Update "Open all" button
 *
 * @param {boolean} expanded - Whether the sections are expanded or not
 */
IdskAccordion.prototype.updateOpenAllButton = function (expanded) {
  var newButtonText = expanded ? this.closeTitle : this.openTitle
  newButtonText +=
    '<span class="govuk-visually-hidden section-span"> ' +
    this.sectionTitle +
    '</span>'
  this.$openAllButton.setAttribute('aria-expanded', expanded)
  this.$openAllButton.innerHTML = newButtonText
}

var helper = {
  /**
   * Check for `window.sessionStorage`, and that it actually works.
   *
   * @returns {boolean} True if session storage is available
   */
  checkForSessionStorage: function () {
    var testString = 'this is the test string'
    var result
    try {
      window.sessionStorage.setItem(testString, testString)
      result =
        window.sessionStorage.getItem(testString) === testString.toString()
      window.sessionStorage.removeItem(testString)
      return result
    } catch (exception) {
      if (
        typeof console === 'undefined' ||
        typeof console.log === 'undefined'
      ) {
        console.log('Notice: sessionStorage not available.')
      }
      return false
    }
  }
}

/**
 * Set the state of the accordions in sessionStorage
 *
 * @param {object} $section - section DOM element
 */
IdskAccordion.prototype.storeState = function ($section) {
  if (this.browserSupportsSessionStorage) {
    // We need a unique way of identifying each content in the accordion. Since
    // an `#id` should be unique and an `id` is required for `aria-` attributes
    // `id` can be safely used.
    var $button = $section.querySelector('.' + this.sectionButtonClass)

    if ($button) {
      var contentId = $button.getAttribute('aria-controls')
      var contentState = $button.getAttribute('aria-expanded')

      if (
        typeof contentId === 'undefined' &&
        (typeof console === 'undefined' || typeof console.log === 'undefined')
      ) {
        console.error(
          new Error('No aria controls present in accordion section heading.')
        )
      }

      if (
        typeof contentState === 'undefined' &&
        (typeof console === 'undefined' || typeof console.log === 'undefined')
      ) {
        console.error(
          new Error('No aria expanded present in accordion section heading.')
        )
      }

      // Only set the state when both `contentId` and `contentState` are taken from the DOM.
      if (contentId && contentState) {
        window.sessionStorage.setItem(contentId, contentState)
      }
    }
  }
}

/**
 * Read the state of the accordions from sessionStorage
 *
 * @param {object} $section - section DOM element
 */
IdskAccordion.prototype.setInitialState = function ($section) {
  if (this.browserSupportsSessionStorage) {
    var $button = $section.querySelector('.' + this.sectionButtonClass)

    if ($button) {
      var contentId = $button.getAttribute('aria-controls')
      var contentState = contentId
        ? window.sessionStorage.getItem(contentId)
        : null

      if (contentState !== null) {
        this.setExpanded(contentState === 'true', $section)
      }
    }
  }
}

export default IdskAccordion

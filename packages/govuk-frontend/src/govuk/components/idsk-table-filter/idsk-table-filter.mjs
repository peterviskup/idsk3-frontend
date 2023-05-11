/* eslint-disable */

import { toggleClass } from '../../common.mjs'

/**
 * TableFilter
 *
 * @param {object} $module - The module to enhance
 */
function IdskTableFilter ($module) {
  this.$module = $module
  this.selectedFitlersCount = 0
  this.$activeFilters = []

  // get texts
  this.removeAllFiltersText = $module.querySelector(
    '.idsk-table-filter__active-filters'
  ).dataset.removeAllFilters
  this.removeFilterText = $module.querySelector(
    '.idsk-table-filter__active-filters'
  ).dataset.removeFilter
}

/**
 * TableFilter init function
 */
IdskTableFilter.prototype.init = function () {
  // Check for module
  var $module = this.$module
  if (!$module) {
    return
  }

  // button to toggle content
  var $toggleButtons = $module.querySelectorAll('.idsk-filter-menu__toggle')

  // Form with all inputs and selects
  var $form = $module.querySelector('form')

  // all inputs for count of selected filters
  var $filterInputs = $module.querySelectorAll('.govuk-input, .govuk-select')

  $toggleButtons.forEach(
    function ($button) {
      $button.addEventListener('click', this.handleClickTogglePanel.bind(this))
    }.bind(this)
  )

  if ($form) {
    $form.addEventListener(
      'submit',
      function (e) {
        e.preventDefault()
        this.handleSubmitFilter(this)
      }.bind(this)
    )
  }

  $filterInputs.forEach(
    function ($input) {
      // for selects
      $input.addEventListener('change', this.handleFilterValueChange.bind(this))
      // for text inputs
      $input.addEventListener(
        'keyup',
        function (e) {
          // submit if key is enter else change count of used filters
          if (e.key === 'Enter') {
            // send event like this, because submitting form will be ignored if fields are empty
            this.sendSubmitEvent()
          } else {
            this.handleFilterValueChange(e)
          }
        }.bind(this)
      )
    }.bind(this)
  )

  // recalculate height of all expanded panels on window resize
  window.addEventListener('resize', this.handleWindowResize.bind(this))
}
/**
 * Forcing submit event for form
 */
IdskTableFilter.prototype.sendSubmitEvent = function () {
  this.$module.querySelector('form').dispatchEvent(
    new Event('submit', {
      bubbles: true,
      cancelable: true
    })
  )
}

/**
 * An event handler for click event on $togglePanel - collapse or expand table-filter
 *
 * @param {object} e - Event
 */
IdskTableFilter.prototype.handleClickTogglePanel = function (e) {
  var $el = e.target || e.srcElement
  var $expandablePanel = $el.parentNode
  var $content = $el.nextElementSibling

  // get texts from button dataset
  var openText = $el.dataset.openText
  var closeText = $el.dataset.closeText

  // if panel is category, change size of whole panel with animation
  var isCategory = $expandablePanel.classList.contains(
    'idsk-table-filter__category'
  )
  if (isCategory) {
    var $categoryParent = $expandablePanel.parentNode

    // made more fluid animations for changed spacing with transition
    var marginBottomTitle = isCategory ? 18 : 20
    var marginBottomExpandedCategory = 25
    var newParentHeight =
      $content.style.height && $content.style.height !== '0px'
        ? parseInt($categoryParent.style.height) -
          $content.scrollHeight -
          marginBottomTitle +
          marginBottomExpandedCategory
        : parseInt($categoryParent.style.height) +
          $content.scrollHeight +
          marginBottomTitle -
          marginBottomExpandedCategory

    $categoryParent.style.height = newParentHeight + 'px'
  }

  // show element after toggle with slide down animation
  toggleClass($expandablePanel, 'idsk-table-filter--expanded')
  $content.style.height =
    ($content.style.height && $content.style.height !== '0px'
      ? '0'
      : $content.scrollHeight) + 'px'

  // set text for toggle
  var hidden = $content.style.height === '0px'
  var newToggleText = hidden ? openText : closeText
  var newToggleButton = hidden ? 'false' : 'true'
  var $ariaToggleForm = document.querySelector('.idsk-table-filter__content')
  $el.innerHTML = newToggleText
  $el.setAttribute(
    'aria-label',
    newToggleText +
      ($el.dataset.categoryName ? ' ' + $el.dataset.categoryName : '')
  )
  $ariaToggleForm.setAttribute('aria-hidden', newToggleButton)

  // toggle tabbable if content is shown or not
  var $items = $content.querySelectorAll(
    ':scope > .idsk-table-filter__filter-inputs input, :scope > .idsk-table-filter__filter-inputs select, .idsk-filter-menu__toggle'
  )
  var tabIndex = hidden ? -1 : 0
  $items.forEach(function ($filter) {
    // @ts-ignore
    $filter.tabIndex = tabIndex
  })
}

/**
 * A function to remove filter from active filters
 *
 * @param {object} $filterToRemove - filter to remove
 */
IdskTableFilter.prototype.removeActiveFilter = function ($filterToRemove) {
  var $filterToRemoveValue = this.$module.querySelector(
    '.govuk-input[name="' +
      $filterToRemove.name +
      '"], .govuk-select[name="' +
      $filterToRemove.name +
      '"]'
  )
  if ($filterToRemoveValue.tagName === 'SELECT') {
    // if filter is select find option with empty value
    $filterToRemoveValue
      .querySelectorAll('option')
      .forEach(function (option, index) {
        if (option.value === '') {
          $filterToRemoveValue.selectedIndex = index
        }
      })
  } else $filterToRemoveValue.value = ''

  // simulate change event of inputs to change count of active filters and call form submit to send information about filter was changed
  $filterToRemoveValue.dispatchEvent(new Event('change'))

  // send submit event of form to call data changes
  this.sendSubmitEvent()

  this.$activeFilters = this.$activeFilters.filter(function ($filter) {
    return $filter.id !== $filterToRemove.id
  })

  this.renderActiveFilters()
}

/**
 * A function to remove all active filters
 */
IdskTableFilter.prototype.removeAllActiveFilters = function () {
  this.$activeFilters.forEach(
    function ($filter) {
      this.removeActiveFilter($filter)
    }.bind(this)
  )
}

/**
 * A function to add elements to DOM object
 */
IdskTableFilter.prototype.renderActiveFilters = function () {
  // remove all existing filters from array
  var $activeFiltersPanel = this.$module.querySelector(
    '.idsk-table-filter__active-filters'
  )
  var $activeFilters = $activeFiltersPanel.querySelector(
    '.idsk-table-filter__active-filters .idsk-table-filter__content'
  )
  $activeFilters.innerHTML = ''

  // open filter if active filters was hidden before
  if (
    $activeFiltersPanel.classList.contains(
      'idsk-table-filter__active-filters__hide'
    )
  ) {
    $activeFiltersPanel.classList.add('idsk-table-filter--expanded')
  }

  // render all filters in active filters
  this.$activeFilters.forEach(
    function ($filter) {
      var $activeFilter = document.createElement('div')
      $activeFilter.classList.add('idsk-table-filter__parameter', 'govuk-body')
      var $removeFilterBtn =
        '<button class="idsk-table-filter__parameter-remove" tabindex="0">✕ <span class="govuk-visually-hidden">' +
        this.removeFilterText +
        ' ' +
        $filter.value +
        '</span></button>'
      $activeFilter.innerHTML =
        '<span class="idsk-table-filter__parameter-title">' +
        $filter.value +
        '</span>' +
        $removeFilterBtn

      $activeFilter
        .querySelector('.idsk-table-filter__parameter-remove')
        .addEventListener(
          'click',
          function () {
            this.removeActiveFilter($filter)
          }.bind(this)
        )

      $activeFilters.appendChild($activeFilter)
    }.bind(this)
  )

  // add remove everything button if some filter is activated else print none filter is activated
  if (this.$activeFilters.length > 0) {
    $activeFiltersPanel.classList.remove(
      'idsk-table-filter__active-filters__hide'
    )
    var $removeAllFilters = document.createElement('button')
    $removeAllFilters.classList.add('govuk-body', 'govuk-link')
    $removeAllFilters.innerHTML =
      '<span class="idsk-table-filter__parameter-title">' +
      this.removeAllFiltersText +
      ' (' +
      this.$activeFilters.length +
      ')</span><span class="idsk-table-filter__parameter-remove">✕</span>'
    $removeAllFilters.addEventListener(
      'click',
      this.removeAllActiveFilters.bind(this)
    )
    $activeFilters.appendChild($removeAllFilters)
  } else {
    $activeFiltersPanel.classList.add('idsk-table-filter__active-filters__hide')
  }

  // calc height of 'active filter' panel if panel is expanded
  var $activeFiltersContainer = this.$module.querySelector(
    '.idsk-table-filter__active-filters.idsk-table-filter--expanded .idsk-table-filter__content'
  )
  if ($activeFiltersContainer) {
    $activeFiltersContainer.style.height = 'initial' // to changing height from initial height
    $activeFiltersContainer.style.height =
      $activeFiltersContainer.scrollHeight + 'px'
  }
}

/**
 * A function to refresh number of selected filters count
 */
IdskTableFilter.prototype.renderSelectedFiltersCount = function () {
  var submitButton = this.$module.querySelector('.submit-table-filter')
  submitButton.disabled = this.selectedFitlersCount === 0

  var counter = submitButton.querySelector('.count')
  counter.innerHTML = this.selectedFitlersCount
}

/**
 * A submit filters event on click at $submitButton or pressing enter in inputs
 */
IdskTableFilter.prototype.handleSubmitFilter = function () {
  // get all inputs and selects
  var $inputs = this.$module.querySelectorAll(
    '.idsk-table-filter__inputs input'
  )
  var $selects = this.$module.querySelectorAll(
    '.idsk-table-filter__inputs select'
  )

  // add values of inputs to $activeFilters if it is not empty
  this.$activeFilters = []
  $inputs.forEach(
    function ($input) {
      if ($input.value.length > 0) {
        this.$activeFilters.push({
          id: $input.getAttribute('id'),
          name: $input.getAttribute('name'),
          value: $input.value
        })
      }
    }.bind(this)
  )

  $selects.forEach(
    function ($select) {
      if ($select.value) {
        this.$activeFilters.push({
          id: $select.value,
          name: $select.getAttribute('name'),
          value: $select.options[$select.selectedIndex].text
        })
      }
    }.bind(this)
  )

  // render all filters in active filters
  this.renderActiveFilters()
}

/**
 * An event handler for on change event for all inputs and selects
 *
 * @param {object} e - event
 */
IdskTableFilter.prototype.handleFilterValueChange = function (e) {
  var $el = e.target || e.srcElement

  // if filter is in category get count of selected filters only from that category
  var $category = $el.closest('.idsk-table-filter__category')
  if ($category) {
    var $allCategoryFilters = $category.querySelectorAll(
      '.idsk-table-filter__inputs input, .idsk-table-filter__inputs select'
    )
    var selectedCategoryFiltersCount = 0
    $allCategoryFilters.forEach(function ($filter) {
      if ($filter.value) {
        selectedCategoryFiltersCount++
      }
    })
    $category.querySelector('.count').innerHTML = selectedCategoryFiltersCount
      ? '(' + selectedCategoryFiltersCount + ')'
      : ''
  }

  // get count of all selected filters
  this.selectedFitlersCount = 0
  var $allFilters = this.$module.querySelectorAll(
    '.idsk-table-filter__inputs input, .idsk-table-filter__inputs select'
  )
  $allFilters.forEach(
    function ($filter) {
      if ($filter.value) {
        this.selectedFitlersCount++
      }
    }.bind(this)
  )

  // render count of selected filters
  this.renderSelectedFiltersCount()
}

/**
 * An event handler for window resize to change elements based on scrollHeight
 */
IdskTableFilter.prototype.handleWindowResize = function () {
  var $allExpandedPanels = this.$module.querySelectorAll(
    '.idsk-table-filter--expanded'
  )
  $allExpandedPanels.forEach(function ($panel) {
    // @ts-ignore
    var $content = $panel.querySelector('.idsk-table-filter__content')
    $content.style.height = 'initial' // to changing height from initial height
    $content.style.height = $content.scrollHeight + 'px'
  })
}

export default IdskTableFilter

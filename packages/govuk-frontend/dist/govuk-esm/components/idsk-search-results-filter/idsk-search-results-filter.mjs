import { toggleClass } from '../../common/index.mjs';

/* eslint-disable */

/**
 * SearchResultsFilter component
 *
 * @param {object} $module - The module to enhance
 */
function IdskSearchResultsFilter ($module) {
  this.$module = $module;
}

/**
 * SearchResultsFilter init function
 */
IdskSearchResultsFilter.prototype.init = function () {
  // Check for module
  var $module = this.$module;
  if (!$module) {
    return
  }

  var $linkPanelButtons = $module.querySelectorAll(
    '.idsk-search-results__link-panel-button'
  );
  if (!$linkPanelButtons) {
    return
  }

  var $topicSearchInput = $module.querySelector('#idsk-search-input__topic');
  if ($topicSearchInput) {
    $topicSearchInput.addEventListener(
      'keyup',
      this.handleSearchItemsFromInput.bind(this, 'radios')
    );
  }

  var $subtopicSearchInput = $module.querySelector(
    '#idsk-search-input__subtopic'
  );
  if ($subtopicSearchInput) {
    $subtopicSearchInput.addEventListener(
      'keyup',
      this.handleSearchItemsFromInput.bind(this, 'radios')
    );
  }

  var $contentTypeSearchInput = $module.querySelector(
    '#idsk-search-input__content-type'
  );
  if ($contentTypeSearchInput) {
    $contentTypeSearchInput.addEventListener(
      'keyup',
      this.handleSearchItemsFromInput.bind(this, 'checkboxes')
    );
  }

  var $radioButtonsInput = $module.querySelectorAll(
    '.idsk-search-results__filter .govuk-radios__input '
  );
  if (!$radioButtonsInput) {
    return
  }

  var $contentTypeCheckBoxes = $module.querySelectorAll(
    '.idsk-search-results__filter .govuk-checkboxes__input '
  );
  if (!$contentTypeCheckBoxes) {
    return
  }

  $radioButtonsInput.forEach(
    function ($input) {
      $input.addEventListener(
        'click',
        this.handleClickRadioButton.bind(this),
        true
      );
    }.bind(this)
  );

  $contentTypeCheckBoxes.forEach(
    function ($checkBox) {
      $checkBox.addEventListener(
        'click',
        this.handleClickContentTypeCheckBox.bind(this),
        true
      );
    }.bind(this)
  );

  $linkPanelButtons.forEach(
    function ($button) {
      $button.addEventListener('click', this.handleClickLinkPanel.bind(this));
    }.bind(this)
  );
};

/**
 * SearchResultsFilter handleClickRadioButton handler
 *
 * @param {object} e - Event
 */
IdskSearchResultsFilter.prototype.handleClickRadioButton = function (e) {
  var $el = e.target || e.srcElement;
  var $linkPanelButton = $el.closest('.idsk-search-results__link-panel');
  var $buttonCaption = $linkPanelButton.querySelector(
    '.idsk-search-results__link-panel--span'
  );

  $buttonCaption.innerText = '1 vybraté';
};

/**
 * SearchResultsFilter handleClickContentTypeCheckBox handler
 *
 * @param {object} e - Event
 */
IdskSearchResultsFilter.prototype.handleClickContentTypeCheckBox = function (e) {
  var $el = e.target || e.srcElement;
  var $linkPanelButton = $el.closest('.idsk-search-results__link-panel');
  var $checkBoxes = $el.closest('.govuk-checkboxes');

  this.handleCountOfPickedContentTypes.call(this, $checkBoxes, $linkPanelButton);
};

/**
 * SearchResultsFilter handleCountOfPickedContentTypes handler
 *
 * @param {object} $checkBoxes - checkboxes element
 * @param {object} $linkPanelButton - link panel button element
 */
IdskSearchResultsFilter.prototype.handleCountOfPickedContentTypes = function (
  $checkBoxes,
  $linkPanelButton
) {
  var $buttonCaption = $linkPanelButton.querySelector(
    '.idsk-search-results__link-panel--span'
  );
  var $counter = 0;

  if ($checkBoxes) {
    $checkBoxes.querySelectorAll('.govuk-checkboxes__input').forEach(
      function ($checkBox) {
        if ($checkBox.checked) {
          $counter = $counter + 1;
        }
      }.bind(this)
    );
  }
  if ($counter === 0) {
    $buttonCaption.innerText = '';
  } else {
    $buttonCaption.innerText = $counter + ' vybraté';
  }
};

/**
 * SearchResultsFilter handleSearchItemsFromInput handler
 *
 * @param {string} $type - type of filter
 * @param {object} e - Event
 */
IdskSearchResultsFilter.prototype.handleSearchItemsFromInput = function ($type, e) {
  var $el = e.target || e.srcElement;
  var $linkPanelButton = $el.closest('.idsk-search-results__link-panel');
  var $items = $linkPanelButton.querySelectorAll('.govuk-' + $type + '__item');
  $items.forEach(
    function ($item) {
      $item.classList.remove('idsk-search-results--invisible');
    }.bind(this)
  );
  $items.forEach(
    function ($item) {
      var $labelItem = $item.querySelector('.govuk-' + $type + '__label');

      if (
        !$labelItem.innerText.toLowerCase().includes($el.value.toLowerCase())
      ) {
        $item.classList.add('idsk-search-results--invisible');
      }
    }.bind(this)
  );
};

/**
 * An event handler for click event on $linkPanel - collapse or expand filter
 *
 * @param {object} e - Event
 */
IdskSearchResultsFilter.prototype.handleClickLinkPanel = function (e) {
  var $el = e.target || e.srcElement;
  var $linkPanelButton = $el.closest('.idsk-search-results__link-panel');
  var $contentPanel = $linkPanelButton.querySelector(
    '.idsk-search-results__list'
  );
  var $ariaLabelComponent = $el.closest(
    '.idsk-search-results__link-panel-button'
  );

  toggleClass($contentPanel, 'idsk-search-results--hidden');
  toggleClass($linkPanelButton, 'idsk-search-results--expand');
  if ($linkPanelButton.classList.contains('idsk-search-results--expand')) {
    $ariaLabelComponent.setAttribute('aria-expanded', 'true');
    $ariaLabelComponent.setAttribute(
      'aria-label',
      $ariaLabelComponent.getAttribute('data-text-for-hide')
    );
  } else {
    $ariaLabelComponent.setAttribute('aria-expanded', 'false');
    $ariaLabelComponent.setAttribute(
      'aria-label',
      $ariaLabelComponent.getAttribute('data-text-for-show')
    );
  }
};

export default IdskSearchResultsFilter;
//# sourceMappingURL=components/idsk-search-results-filter/idsk-search-results-filter.mjs.map

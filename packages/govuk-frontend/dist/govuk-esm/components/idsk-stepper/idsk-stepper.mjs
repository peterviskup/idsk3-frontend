import '../../vendor/polyfills/Element/prototype/classList.mjs';

/*
  Stepper

  This allows a collection of sections to be collapsed by default,
  showing only their headers. Sections can be exanded or collapsed
  individually by clicking their headers. An "Zobraziť všetko" button is
  also added to the top of the accordion, which switches to "Zatvoriť všetko"
  when all the sections are expanded.

  The state of each section is saved to the DOM via the `aria-expanded`
  attribute, which also provides accessibility.

*/

/**
 * Stepper component
 *
 * @param {object} $module - The module to enhance
 */
function IdskStepper ($module) {
  this.$module = $module;
  this.$moduleId = $module.getAttribute('id');
  this.$sections = $module.querySelectorAll('.idsk-stepper__section');
  this.$links = $module.querySelectorAll(
    '.idsk-stepper__section-content .govuk-link'
  );
  this.$openAllButton = {};
  this.$browserSupportsSessionStorage = $helper.checkForSessionStorage();

  this.$controlsClass = 'idsk-stepper__controls';
  this.$openAllClass = 'idsk-stepper__open-all';
  this.$iconClass = 'idsk-stepper__icon';

  this.$sectionHeaderClass = 'idsk-stepper__section-header';
  this.$sectionHeaderFocusedClass = 'idsk-stepper__section-header--focused';
  this.$sectionHeadingClass = 'idsk-stepper__section-heading';
  this.$sectionSummaryClass = 'idsk-stepper__section-summary';
  this.$sectionButtonClass = 'idsk-stepper__section-button';
  this.$sectionExpandedClass = 'idsk-stepper__section--expanded';
}

/**
 * Stepper init function
 */
IdskStepper.prototype.init = function () {
  // Check for module
  if (!this.$module) {
    return
  }

  this.initControls();
  this.initSectionHeaders();

  this.$links.forEach(
    function ($link) {
      $link.addEventListener('click', this.handleItemLink.bind(this));
      $link.addEventListener('blur', this.handleItemLinkBlur.bind(this));
    }.bind(this)
  );

  // See if "Zobraziť všetko" button text should be updated
  var $areAllSectionsOpen = this.checkIfAllSectionsOpen();
  this.updateOpenAllButton($areAllSectionsOpen);
};

/**
 * Initialise controls and set attributes
 */
IdskStepper.prototype.initControls = function () {
  var $accordionControls = this.$module.querySelector('.idsk-stepper__controls');

  if ($accordionControls) {
    // Create "Zobraziť všetko" button and set attributes
    this.$openAllButton = document.createElement('button');
    this.$openAllButton.setAttribute('type', 'button');
    this.$openAllButton.innerHTML =
      $accordionControls.dataset.line1 +
      ' <span class="govuk-visually-hidden">sekcie</span>';
    this.$openAllButton.setAttribute('class', this.$openAllClass);
    this.$openAllButton.setAttribute('aria-expanded', 'false');
    this.$openAllButton.setAttribute('type', 'button');

    // Create control wrapper and add controls to it
    $accordionControls.appendChild(this.$openAllButton);

    // Handle events for the controls
    this.$openAllButton.addEventListener(
      'click',
      this.onOpenOrCloseAllToggle.bind(this)
    );
  } else {
    console.log(
      'Incorrect implementation of stepper, stepper controls are missing.'
    );
  }
};

/**
 * Initialise section headers
 */
IdskStepper.prototype.initSectionHeaders = function () {
  // Loop through section headers
  this.$sections.forEach(
    function ($section, $i) {
      // Set header attributes
      var $header = $section.querySelector('.' + this.$sectionHeaderClass);

      if ($header) {
        this.initHeaderAttributes($header, $i);

        this.setExpanded(this.isExpanded($section), $section);

        // Handle events
        $header.addEventListener(
          'click',
          this.onSectionToggle.bind(this, $section)
        );

        // See if there is any state stored in sessionStorage and set the sections to
        // open or closed.
        this.setInitialState($section);
      } else {
        console.log(
          'Incorrect implementation of stepper, stepper header is missing.'
        );
      }
    }.bind(this)
  );
};

/**
 * Stepper handleItemLink handler
 *
 * @param {object} e - Event
 */
IdskStepper.prototype.handleItemLink = function (e) {
  var $link = e.target || e.srcElement;
  var $currentSection = $link.closest('.idsk-stepper__section');
  $currentSection.classList.add('idsk-stepper__bolder-line');
};

/**
 * Stepper handleItemLinkBlur handler
 *
 * @param {object} e - Event
 */
IdskStepper.prototype.handleItemLinkBlur = function (e) {
  var $link = e.target || e.srcElement;
  var $currentSection = $link.closest('.idsk-stepper__section');
  $currentSection.classList.remove('idsk-stepper__bolder-line');
};

/**
 * Set individual header attributes
 *
 * @param {object} $headerWrapper - header wrapper element
 * @param {number} index - header index
 */
// Set individual header attributes
IdskStepper.prototype.initHeaderAttributes = function ($headerWrapper, index) {
  var $module = this.$module;
  var $span = $headerWrapper.querySelector('.' + this.$sectionButtonClass);
  var $heading = $headerWrapper.querySelector('.' + this.$sectionHeadingClass);
  var $summary = $headerWrapper.querySelector('.' + this.$sectionSummaryClass);

  if (!$span) {
    return
  }

  // Copy existing span element to an actual button element, for improved accessibility.
  var $button = document.createElement('button');
  $button.setAttribute('type', 'button');
  $button.setAttribute('id', this.$moduleId + '-heading-' + (index + 1));
  $button.setAttribute(
    'aria-controls',
    this.$moduleId + '-content-' + (index + 1)
  );

  // Copy all attributes (https://developer.mozilla.org/en-US/docs/Web/API/Element/attributes) from $span to $button
  for (var i = 0; i < $span.attributes.length; i++) {
    var $attr = $span.attributes.item(i);
    $button.setAttribute($attr.nodeName, $attr.nodeValue);
  }

  $button.addEventListener('focusin', function (e) {
    if (
      !$headerWrapper.classList.contains($module.$sectionHeaderFocusedClass)
    ) {
      $headerWrapper.className += ' ' + $module.$sectionHeaderFocusedClass;
    }
  });

  $button.addEventListener('blur', function (e) {
    $headerWrapper.classList.remove($module.$sectionHeaderFocusedClass);
  });

  if (typeof $summary !== 'undefined' && $summary !== null) {
    $button.setAttribute(
      'aria-describedby',
      this.$moduleId + '-summary-' + (index + 1)
    );
  }

  // $span could contain HTML elements (see https://www.w3.org/TR/2011/WD-html5-20110525/content-models.html#phrasing-content)
  $button.innerHTML = $span.innerHTML;

  $heading.removeChild($span);
  $heading.appendChild($button);

  // Add "+/-" icon
  var $icon = document.createElement('span');
  $icon.className = this.$iconClass;
  $icon.setAttribute('aria-hidden', 'true');

  $heading.appendChild($icon);
};

/**
 * When section toggled, set and store state
 *
 * @param {object} $section - section element
 */
IdskStepper.prototype.onSectionToggle = function ($section) {
  var $expanded = this.isExpanded($section);
  this.setExpanded(!$expanded, $section);

  // Store the state in sessionStorage when a change is triggered
  this.storeState($section);
};

/**
 * When Open/Zatvoriť všetko toggled, set and store state
 */
IdskStepper.prototype.onOpenOrCloseAllToggle = function () {
  var $self = this;
  var $sections = this.$sections;
  var $nowExpanded = !this.checkIfAllSectionsOpen();

  $sections.forEach(function ($section) {
    $self.setExpanded($nowExpanded, $section);
    // Store the state in sessionStorage when a change is triggered
    $self.storeState($section);
  });

  $self.updateOpenAllButton($nowExpanded);
};

/**
 * Set section attributes when opened/closed
 *
 * @param {boolean} $expanded - true if section should be expanded
 * @param {object} $section - section element
 */
IdskStepper.prototype.setExpanded = function ($expanded, $section) {
  var $button = $section.querySelector('.' + this.$sectionButtonClass);
  if (!$button) {
    return
  }
  $button.setAttribute('aria-expanded', $expanded);

  if ($expanded) {
    $section.classList.add(this.$sectionExpandedClass);
  } else {
    $section.classList.remove(this.$sectionExpandedClass);
  }

  // See if "Zobraziť všetko" button text should be updated
  var $areAllSectionsOpen = this.checkIfAllSectionsOpen();
  this.updateOpenAllButton($areAllSectionsOpen);
};

/**
 * Get state of section
 *
 * @param {object} $section - section element
 * @returns {boolean} true if section is expanded
 */
IdskStepper.prototype.isExpanded = function ($section) {
  return $section.classList.contains(this.$sectionExpandedClass)
};

/**
 * Check if all sections are open
 *
 * @returns {boolean} true if all sections are open
 */
IdskStepper.prototype.checkIfAllSectionsOpen = function () {
  // Get a count of all the Accordion sections
  var $sectionsCount = this.$sections.length;
  // Get a count of all Accordion sections that are expanded
  var $expandedSectionCount = this.$module.querySelectorAll(
    '.' + this.$sectionExpandedClass
  ).length;
  var $areAllSectionsOpen = $sectionsCount === $expandedSectionCount;

  return $areAllSectionsOpen
};

/**
 * Update "Zobraziť všetko" button
 *
 * @param {boolean} $expanded - true if all sections should be expanded
 */
IdskStepper.prototype.updateOpenAllButton = function ($expanded) {
  var $accordionControls = this.$module.querySelector('.idsk-stepper__controls');

  if ($accordionControls) {
    var $newButtonText = $expanded
      ? $accordionControls.dataset.line2
      : $accordionControls.dataset.line1;
    $newButtonText += '<span class="govuk-visually-hidden">sekcie</span>';
    this.$openAllButton.setAttribute('aria-expanded', $expanded);
    this.$openAllButton.innerHTML = $newButtonText;
  } else {
    console.log(
      'Incorrect implementation of stepper, stepper controls are missing.'
    );
  }
};

/**
 * helper object
 */
var $helper = {
  /**
   * Check for `window.sessionStorage`, and that it actually works.
   *
   * @returns {boolean} true if the browser supports sessionStorage
   */
  checkForSessionStorage: function () {
    var $testString = 'this is the test string';
    var $result;
    try {
      window.sessionStorage.setItem($testString, $testString);
      $result =
        window.sessionStorage.getItem($testString) === $testString.toString();
      window.sessionStorage.removeItem($testString);
      return $result
    } catch (exception) {
      if (
        typeof console === 'undefined' ||
        typeof console.log === 'undefined'
      ) {
        console.log('Notice: sessionStorage not available.');
      }
      return false
    }
  }
};

/**
 * Set the state of the accordions in sessionStorage
 *
 * @param {object} $section - section element
 */
IdskStepper.prototype.storeState = function ($section) {
  if (this.$browserSupportsSessionStorage) {
    // We need a unique way of identifying each content in the accordion. Since
    // an `#id` should be unique and an `id` is required for `aria-` attributes
    // `id` can be safely used.
    var $button = $section.querySelector('.' + this.$sectionButtonClass);

    if ($button) {
      var $contentId = $button.getAttribute('aria-controls');
      var $contentState = $button.getAttribute('aria-expanded');

      if (
        typeof $contentId === 'undefined' &&
        (typeof console === 'undefined' || typeof console.log === 'undefined')
      ) {
        console.error(
          new Error('No aria controls present in accordion section heading.')
        );
      }

      if (
        typeof $contentState === 'undefined' &&
        (typeof console === 'undefined' || typeof console.log === 'undefined')
      ) {
        console.error(
          new Error('No aria expanded present in accordion section heading.')
        );
      }

      // Only set the state when both `contentId` and `contentState` are taken from the DOM.
      if ($contentId && $contentState) {
        window.sessionStorage.setItem($contentId, $contentState);
      }
    }
  }
};

/**
 * Read the state of the accordions from sessionStorage
 *
 * @param {object} $section - section element
 */
IdskStepper.prototype.setInitialState = function ($section) {
  if (this.$browserSupportsSessionStorage) {
    var $button = $section.querySelector('.' + this.$sectionButtonClass);

    if ($button) {
      var $contentId = $button.getAttribute('aria-controls');
      var $contentState = $contentId
        ? window.sessionStorage.getItem($contentId)
        : null;

      if ($contentState !== null) {
        this.setExpanded($contentState === 'true', $section);
      }
    }
  }
};

export default IdskStepper;
//# sourceMappingURL=components/idsk-stepper/idsk-stepper.mjs.map

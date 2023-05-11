import { toggleClass } from '../../common/index.mjs';

/* eslint-disable */

/**
 * CustomerSurveys Component
 */
function IdskCustomerSurveys ($module) {
  this.$module = $module;
}

/**
 * CustomerSurveys init function
 */
IdskCustomerSurveys.prototype.init = function () {
  var $module = this.$module;
  var $nextButton = $module.querySelector('#idsk-customer-surveys__send-button');
  var $previousButton = $module.querySelector(
    '#idsk-customer-surveys__previous-button'
  );
  var $textAreaFirst = $module.querySelector(
    '.idsk-customer-surveys-text-area #first'
  );
  var $textAreaSecond = $module.querySelector(
    '.idsk-customer-surveys-text-area #second'
  );
  var $textAreaThird = $module.querySelector(
    '.idsk-customer-surveys-text-area #third'
  );
  var $textAreaFourth = $module.querySelector(
    '.idsk-customer-surveys-text-area #fourth'
  );
  var $radioButtonWork = $module.querySelector(
    '.idsk-customer-survey__radio--work'
  );
  var $radioButtonPrivate = $module.querySelector(
    '.idsk-customer-survey__radio--private'
  );
  var $counter = 7;
  $module.sendButtonDisabled = new Array(7);
  // eslint-disable-next-line es-x/no-map
  $module.textAreaMap = new Map();

  if (!$module) {
    return
  }

  this.handleCounterOfSubtitles.call(this, $counter);
  this.enableNextButtonForAllSteps.call(this);

  if ($radioButtonWork) {
    $radioButtonWork.addEventListener(
      'click',
      this.handleRadioButtonWorkClick.bind(this)
    );
  }

  if ($radioButtonPrivate) {
    $radioButtonPrivate.addEventListener(
      'click',
      this.handleRadioButtonPrivateClick.bind(this)
    );
  }

  if ($nextButton) {
    $nextButton.addEventListener('click', this.handleNextButtonClick.bind(this));
  }

  if ($previousButton) {
    $previousButton.addEventListener(
      'click',
      this.handlePreviousButtonClick.bind(this)
    );
  }

  if ($textAreaFirst) {
    $module.textAreaMap.set('first', 1);
    $textAreaFirst.addEventListener(
      'input',
      this.handleStatusOfCharacterCountButton.bind(this)
    );
  }

  if ($textAreaSecond) {
    $module.textAreaMap.set('second', 2);
    $textAreaSecond.addEventListener(
      'input',
      this.handleStatusOfCharacterCountButton.bind(this)
    );
  }

  if ($textAreaThird) {
    $module.textAreaMap.set('third', 4);
    $textAreaThird.addEventListener(
      'input',
      this.handleStatusOfCharacterCountButton.bind(this)
    );
  }

  if ($textAreaFourth) {
    $module.textAreaMap.set('fourth', 5);
    $textAreaFourth.addEventListener(
      'input',
      this.handleStatusOfCharacterCountButton.bind(this)
    );
  }
};

/**
 * CustomerSurveys enableNextButtonForAllSteps handler
 */
IdskCustomerSurveys.prototype.enableNextButtonForAllSteps = function (e) {
  for (var index = 0; index < this.$module.sendButtonDisabled.length; index++) {
    this.$module.sendButtonDisabled[index] = false;
  }
};

/**
 * CustomerSurveys handleStatusOfCharacterCountButton handler
 */
IdskCustomerSurveys.prototype.handleStatusOfCharacterCountButton = function (e) {
  var $module = this.$module;
  var $name = e.srcElement.id;
  var $textAreaCharacterCount = $module.querySelector('#' + $name);
  var $remainingCharacterCountMessage = $module.querySelector(
    '#' + $name + '-info'
  );
  var $submitButton = $module.querySelector(
    '#idsk-customer-surveys__send-button'
  );

  setTimeout(function () {
    if (
      $textAreaCharacterCount.classList.contains('govuk-textarea--error') ||
      $remainingCharacterCountMessage.classList.contains('govuk-error-message')
    ) {
      $submitButton.disabled = true;
    } else {
      $submitButton.disabled = false;
      // changing value of global variable for disabling button, in case of walk through steps and comming back to this textarea.
      $module.sendButtonDisabled[$module.textAreaMap.get($name)] = false;
    }
  }, 300);
};

/**
 * CustomerSurveys handleCounterOfSubtitles handler
 */
IdskCustomerSurveys.prototype.handleCounterOfSubtitles = function ($counter) {
  var $subtitles = this.$module.querySelectorAll(
    '.idsk-customer-surveys--subtitle'
  );
  var i;

  // remove previous indexing, cause amount of steps could change
  // adding new indexing
  for (i = 0; i < $counter; i++) {
    $subtitles[i].textContent = $subtitles[i].textContent.substring(3);
    $subtitles[i].innerHTML = i + 1 + '. ' + $subtitles[i].textContent;
  }
};

/**
 * CustomerSurveys handleRadioButtonWorkClick handler
 */
IdskCustomerSurveys.prototype.handleRadioButtonWorkClick = function (e) {
  var $textArea = this.$module.querySelector(
    '.idsk-customer-survey__text-area--work'
  );
  var $subtitle = this.$module.querySelector(
    '.idsk-customer-survey__subtitle--work'
  );

  $subtitle.classList.add('idsk-customer-surveys--subtitle');
  $textArea.classList.remove('idsk-customer-surveys--hidden');
  this.handleCounterOfSubtitles.call(this, 8);
};

/**
 * CustomerSurveys clearTextArea handler
 */
IdskCustomerSurveys.prototype.clearTextArea = function ($textArea) {
  var $text = $textArea.querySelector('.govuk-textarea');
  var $hint = $textArea.querySelector('.govuk-character-count__message');

  $text.value = '';
  if ($text.classList.contains('govuk-textarea--error')) {
    $text.classList.remove('govuk-textarea--error');
    $hint.classList.remove('govuk-error-message');
    $hint.classList.add('govuk-hint');
    $hint.innerHTML = $textArea.dataset.lines;
  }
};

/**
 * CustomerSurveys handleRadioButtonPrivateClick handler
 */
IdskCustomerSurveys.prototype.handleRadioButtonPrivateClick = function (e) {
  var $textArea = this.$module.querySelector(
    '.idsk-customer-survey__text-area--work'
  );
  var $subtitle = this.$module.querySelector(
    '.idsk-customer-survey__subtitle--work'
  );
  var $nextButton = this.$module.querySelector(
    '#idsk-customer-surveys__send-button'
  );

  $nextButton.disabled = false;
  $subtitle.classList.remove('idsk-customer-surveys--subtitle');
  $textArea.classList.add('idsk-customer-surveys--hidden');
  this.clearTextArea.call(this, $textArea);
  this.handleCounterOfSubtitles.call(this, 7);
};

/**
 * CustomerSurveys handlePreviousButtonClick handler
 */
IdskCustomerSurveys.prototype.handlePreviousButtonClick = function (e) {
  var $module = this.$module;
  var $steps = $module.querySelectorAll('.idsk-customer-surveys__step');
  var i;
  var $nextButton = $module.querySelector('#idsk-customer-surveys__send-button');
  var $previousButton = $module.querySelector(
    '#idsk-customer-surveys__previous-button'
  );
  var $startIcon = $module.querySelectorAll('.idsk-button__start-icon');
  var $nextButtonText = $module.querySelector(
    '.idsk-customer-surveys__send-button'
  );

  $previousButton.blur();
  // showing and hiding steps, once step is set to be showed return is called.
  // changing names of buttons, disabling
  for (i = 1; i < $steps.length - 1; i++) {
    if (
      $previousButton.textContent === $previousButton.dataset.line2 &&
      $steps[1].classList.contains('idsk-customer-surveys--show')
    ) {
      $previousButton.innerHTML = $previousButton.dataset.line1;
      $nextButtonText.innerHTML = $nextButtonText.dataset.line1;
      toggleClass($startIcon[0], 'idsk-customer-surveys__icon--hidden');

      /**
       * override onclick function
       */
      $previousButton.onclick = function () {
        location.href = '/';
      };
    }
    if ($nextButtonText.textContent.includes($nextButtonText.dataset.line3)) {
      $nextButtonText.innerHTML = $nextButtonText.dataset.line2;
      $nextButton.setAttribute('type', 'button');
      toggleClass($startIcon[0], 'idsk-customer-surveys__icon--hidden');
    }
    if ($steps[i].classList.contains('idsk-customer-surveys--show')) {
      if ($nextButton.disabled) {
        $module.sendButtonDisabled[i] = true;
        $nextButton.disabled = false;
      }
      $steps[i].classList.remove('idsk-customer-surveys--show');
      toggleClass($steps[i], 'idsk-customer-surveys--hidden');
      toggleClass($steps[i - 1], 'idsk-customer-surveys--hidden');
      $steps[i - 1].classList.add('idsk-customer-surveys--show');
      return
    }
  }
};

/**
 * CustomerSurveys handleNextButtonClick handler
 */
IdskCustomerSurveys.prototype.handleNextButtonClick = function (e) {
  var $module = this.$module;
  var $steps = $module.querySelectorAll('.idsk-customer-surveys__step');
  var $buttonsDiv = $module.querySelector('.idsk-customer-surveys__buttons');
  var $nextButton = $module.querySelector('#idsk-customer-surveys__send-button');
  var $previousButton = $module.querySelector(
    '#idsk-customer-surveys__previous-button'
  );
  var $startIcon = $module.querySelectorAll('.idsk-button__start-icon');
  var $nextButtonText = $module.querySelector(
    '.idsk-customer-surveys__send-button'
  );

  $nextButton.blur();
  if ($nextButtonText.textContent.includes($nextButtonText.dataset.line1)) {
    $nextButtonText.innerHTML = $nextButtonText.dataset.line2;
    toggleClass($startIcon[0], 'idsk-customer-surveys__icon--hidden');
    // uncheck all radiobuttons
    this.handleRadioButtonPrivateClick.call(this);

    var $radios = $module.querySelectorAll('.govuk-radios__input');
    for (let i = 0; i < $radios.length; i++) {
      $radios[i].checked = false;
    }
    // clear all textAreas
    var $textAreas = $module.querySelectorAll(
      '.idsk-customer-surveys-text-area'
    );
    for (let i = 0; i < $textAreas.length; i++) {
      this.clearTextArea.call(this, $textAreas[i]);
    }
    this.enableNextButtonForAllSteps.call(this);
  }

  if ($nextButtonText.textContent.includes($nextButtonText.dataset.line3)) {
    $buttonsDiv.classList.add('idsk-customer-surveys--hidden');
  }

  // showing and hiding steps, once step is set to be showed return is called.
  // changing names of buttons, disabling
  for (let i = 0; i < $steps.length - 1; i++) {
    if ($steps[i].classList.contains('idsk-customer-surveys--show')) {
      if ($module.sendButtonDisabled[i + 1]) {
        $nextButton.disabled = true;
      } else {
        $nextButton.disabled = false;
      }
      $steps[i].classList.remove('idsk-customer-surveys--show');
      toggleClass($steps[i], 'idsk-customer-surveys--hidden');
      toggleClass($steps[i + 1], 'idsk-customer-surveys--hidden');
      $steps[i + 1].classList.add('idsk-customer-surveys--show');
      if (i === 4) {
        $nextButtonText.innerHTML = $nextButtonText.dataset.line3;
        setTimeout(function () {
          $nextButton.setAttribute('type', 'submit');
        }, 500);
        toggleClass($startIcon[0], 'idsk-customer-surveys__icon--hidden');
      }
      if (i === 0) {
        $previousButton.innerHTML = $previousButton.dataset.line2;

        /**
         * override onclick function
         */
        $previousButton.onclick = function () {
          location.href = '#';
        };
      }
      return
    }
  }
};

export default IdskCustomerSurveys;
//# sourceMappingURL=components/idsk-customer-surveys/idsk-customer-surveys.mjs.map

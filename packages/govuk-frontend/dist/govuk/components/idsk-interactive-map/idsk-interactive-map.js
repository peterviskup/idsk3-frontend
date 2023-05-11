(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('GOVUKFrontend.IdskInteractiveMap', factory) :
  (global.GOVUKFrontend = global.GOVUKFrontend || {}, global.GOVUKFrontend.IdskInteractiveMap = factory());
}(this, (function () { 'use strict';

  /* eslint-disable */

  /**
   * InteractiveMap Component
   *
   * @param {object} $module - HTML element to use for interactive map
   */
  function IdskInteractiveMap ($module) {
    this.$module = $module;
    this.$currentData = null;
    this.$currentMode = '';
  }

  /**
   * InteractiveMap init function
   */
  IdskInteractiveMap.prototype.init = function () {
    // Check for module
    var $module = this.$module;
    if (!$module) {
      return
    }

    var $radioMap = $module.querySelector('.idsk-intereactive-map__radio-map');
    if ($radioMap) {
      $radioMap.addEventListener(
        'click',
        this.handleRadioButtonModeClick.bind(this, 'map')
      );
    }

    var $radioTable = $module.querySelector('.idsk-intereactive-map__radio-table');
    if ($radioTable) {
      $radioTable.addEventListener(
        'click',
        this.handleRadioButtonModeClick.bind(this, 'table')
      );
    }

    var $selectTimePeriod = $module.querySelector(
      '.idsk-interactive-map__select-time-period'
    );
    if ($selectTimePeriod) {
      $selectTimePeriod.addEventListener('change', this.renderData.bind(this));
    }

    var $selectIndicator = $module.querySelector(
      '.idsk-interactive-map__select-indicator'
    );
    if ($selectIndicator) {
      $selectIndicator.addEventListener('change', this.renderData.bind(this));
    }

    var $radioBtn = $module.querySelector('.govuk-radios__input');
    var $radiosName = $radioBtn.getAttribute('name');
    var $selectedControlOption = $module.querySelector(
      'input[name="' + $radiosName + '"]:checked'
    ).value;
    this.handleRadioButtonModeClick($selectedControlOption);
    this.renderData();
  };

  /**
   * InteractiveMap handleRadioButtonModeClick handler
   */
  IdskInteractiveMap.prototype.handleRadioButtonModeClick = function (type) {
    var $type = type;
    var $module = this.$module;

    if (this.$currentMode === $type) {
      return
    }

    this.$currentMode = $type;

    if ($type === 'table') {
      $module.querySelector('.idsk-interactive-map__table').style.display =
        'block';
      $module.querySelector('.idsk-interactive-map__map').style.display = 'none';
    } else if ($type === 'map') {
      $module.querySelector('.idsk-interactive-map__map').style.display = 'block';
      $module.querySelector('.idsk-interactive-map__table').style.display = 'none';
      $module.querySelector('.idsk-interactive-map__map-iframe').src += ''; // reload content - reset map boundaries
    }
  };

  /**
   * InteractiveMap renderData handler
   */
  IdskInteractiveMap.prototype.renderData = function () {
    var $module = this.$module;
    var $tableEl = $module.querySelector('.idsk-interactive-map__table-iframe');
    var $tableSrc = $tableEl.dataset.src;
    var $mapEl = $module.querySelector('.idsk-interactive-map__map-iframe');
    var $mapSrc = $mapEl.dataset.src;
    var $timePeriodSelect = $module.querySelector(
      '.idsk-interactive-map__select-time-period'
    );
    var $timePeriodValue =
      $timePeriodSelect.options[$timePeriodSelect.selectedIndex].value;
    var $timePeriod =
      $timePeriodSelect.options[$timePeriodSelect.selectedIndex].text;
    var $indicatorSelect = $module.querySelector(
      '.idsk-interactive-map__select-indicator'
    );

    if ($indicatorSelect) {
      var $indicatorValue =
        $indicatorSelect.options[$indicatorSelect.selectedIndex].value;
      var $indicatorText =
        $indicatorSelect.options[$indicatorSelect.selectedIndex].text;

      $module.querySelector(
        '.idsk-interactive-map__current-indicator'
      ).innerText = $indicatorText;
      $module.querySelector(
        '.idsk-interactive-map__current-time-period'
      ).innerText = $timePeriod;
    }

    $mapEl.src =
      $mapSrc + '?indicator=' + $indicatorValue + '&time=' + $timePeriodValue;
    $tableEl.src =
      $tableSrc + '?indicator=' + $indicatorValue + '&time=' + $timePeriodValue;
  };

  return IdskInteractiveMap;

})));
//# sourceMappingURL=idsk-interactive-map.js.map

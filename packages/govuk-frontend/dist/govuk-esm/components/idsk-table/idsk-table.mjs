import '../../vendor/polyfills/Element/prototype/classList.mjs';

/* eslint-disable */

/**
 * IDSK Table
 *
 * @param {object} $module - The module to enhance
 */
function IdskTable ($module) {
  this.$module = $module;
}

/**
 * IDSK Table init function
 */
IdskTable.prototype.init = function () {
  this.setup();
};

/**
 * IDSK Table setup function
 */
IdskTable.prototype.setup = function () {
  var $module = this.$module;

  if (!$module) {
    return
  }

  var $pritnTableBtn = $module.querySelector('.idsk-table__meta-print-button');
  if ($pritnTableBtn) {
    $pritnTableBtn.addEventListener('click', this.printTable.bind(this));
  }
};

/**
 * IDSK Table print function
 */
IdskTable.prototype.printTable = function () {
  var $table = this.$module.querySelector('.idsk-table').outerHTML;
  document.body.innerHTML =
    '<html><head><title></title></head><body>' + $table + '</body>';

  /**
   * Reload page after print
   *
   * @param {object} event - The event object
   */
  window.onafterprint = function (event) {
    window.location.reload();
  };
  window.print();
};

export default IdskTable;
//# sourceMappingURL=components/idsk-table/idsk-table.mjs.map

/* eslint-disable */

/**
 * IdskTabs
 *
 * @param {object} $module - The module to enhance
 */
function IdskTabs ($module) {
  this.$module = $module;
  this.$tabs = $module.querySelectorAll('.idsk-tabs__tab');
  this.$mobileTabs = $module.querySelectorAll('.idsk-tabs__mobile-tab');

  this.keys = { left: 37, right: 39, up: 38, down: 40 };
  this.jsHiddenClass = 'idsk-tabs__panel--hidden';
  this.mobileTabHiddenClass = 'idsk-tabs__mobile-tab-content--hidden';
}

/**
 * IdskTabs initializer
 */
IdskTabs.prototype.init = function () {
  this.setup();
};

/**
 * IdskTabs setup
 */
IdskTabs.prototype.setup = function () {
  var $module = this.$module;
  var $tabs = this.$tabs;
  var $mobileTabs = this.$mobileTabs;
  var $tabList = $module.querySelector('.idsk-tabs__list');
  var $tabListItems = $module.querySelectorAll('.idsk-tabs__list-item');

  if (!$tabs || !$tabList || !$tabListItems) {
    return
  }

  $tabList.setAttribute('role', 'tablist');

  $tabListItems.forEach(function ($item) {
    // @ts-ignore
    $item.setAttribute('role', 'presentation');
  });

  $mobileTabs.forEach(function ($item) {
    // @ts-ignore
    $item.setAttribute('role', 'presentation');
  });

  $tabs.forEach(
    function ($tab, i) {
      // Set HTML attributes
      this.setAttributes($tab);

      // Save bounded functions to use when removing event listeners during teardown
      $tab.boundTabClick = this.onTabClick.bind(this);

      // Handle events
      $tab.addEventListener('click', $tab.boundTabClick, true);
      $mobileTabs[i].addEventListener('click', $tab.boundTabClick, true);

      // Remove old active panels
      this.hideTab($tab);
    }.bind(this)
  );

  // Show either the active tab according to the URL's hash or the first tab
  var $activeTab = this.getTab(window.location.hash) || this.$tabs[0];
  this.toggleMobileTab($activeTab, false);
  this.showTab($activeTab);

  // Handle hashchange events
  $module.boundOnHashChange = this.onHashChange.bind(this);
  window.addEventListener('hashchange', $module.boundOnHashChange, true);
};

/**
 * IdskTabs onHashChange event handler
 */
IdskTabs.prototype.onHashChange = function () {
  var hash = window.location.hash;
  var $tabWithHash = this.getTab(hash);
  if (!$tabWithHash) {
    return
  }

  // Prevent changing the hash
  if (this.changingHash) {
    this.changingHash = false;
    return
  }

  // Show either the active tab according to the URL's hash or the first tab
  var $previousTab = this.getCurrentTab();

  this.hideTab($previousTab);
  this.showTab($tabWithHash);
  $tabWithHash.focus();
};

/**
 * IdskTabs hideTab event handler
 *
 * @param {object} $tab - The tab to hide
 */
IdskTabs.prototype.hideTab = function ($tab) {
  this.unhighlightTab($tab);
  this.hidePanel($tab);
};

/**
 * IdskTabs showTab event handler
 *
 * @param {object} $tab - The tab to show
 */
IdskTabs.prototype.showTab = function ($tab) {
  this.highlightTab($tab);
  this.showPanel($tab);
};

/**
 * IdskTabs onTabClick event handler
 *
 * @param {object} $tab - The tab to toggle
 * @param {boolean} currentTab - whether the tab is the current tab
 */
IdskTabs.prototype.toggleMobileTab = function ($tab, currentTab) {
  currentTab = currentTab || false;
  var $mobilePanel = this.getPanel($tab);
  var $mobileTab = $mobilePanel.previousElementSibling;
  $mobileTab.classList.toggle('idsk-tabs__mobile-tab--selected');
  $mobilePanel = $mobilePanel.querySelector('.idsk-tabs__mobile-tab-content');
  $mobilePanel.classList.toggle(this.mobileTabHiddenClass);
  if (
    $mobileTab.classList.contains('idsk-tabs__mobile-tab--selected') &&
    currentTab
  ) {
    $mobileTab.classList.remove('idsk-tabs__mobile-tab--selected');
    $mobilePanel.classList.add(this.mobileTabHiddenClass);
  }
};

/**
 * IdskTabs getTab handler
 *
 * @param {string} hash - The hash of the tab to get
 * @returns {object} The tab element
 */
IdskTabs.prototype.getTab = function (hash) {
  return this.$module.querySelector('.idsk-tabs__tab[href="' + hash + '"]')
};

/**
 * IdskTabs setAttributes handler
 *
 * @param {object} $tab - The tab to set attributes on
 */
IdskTabs.prototype.setAttributes = function ($tab) {
  // set tab attributes
  var panelId = this.getHref($tab).slice(1);
  var $mobileTab = this.$mobileTabs[$tab.getAttribute('item')];
  $tab.setAttribute('id', 'tab_' + panelId);
  $tab.setAttribute('role', 'tab');
  $tab.setAttribute('aria-controls', panelId);
  $tab.setAttribute('aria-selected', 'false');
  // set mobile tab attributes
  $mobileTab.setAttribute('id', 'tab_' + panelId);
  $mobileTab.setAttribute('role', 'tab');
  $mobileTab.setAttribute('aria-controls', panelId);
  $mobileTab.setAttribute('aria-selected', 'false');

  // set panel attributes
  var $panel = this.getPanel($tab);
  $panel.setAttribute('role', 'tabpanel');
  $panel.setAttribute('aria-labelledby', $tab.id);
  $panel.classList.add(this.jsHiddenClass);
};

/**
 * IdskTabs unsetAttributes handler
 *
 * @param {object} $tab - The tab to unset attributes on
 */
IdskTabs.prototype.unsetAttributes = function ($tab) {
  // unset tab attributes
  var $mobileTab = this.$mobileTabs[$tab.getAttribute('item')];
  $tab.removeAttribute('id');
  $tab.removeAttribute('role');
  $tab.removeAttribute('aria-controls');
  $tab.removeAttribute('aria-selected');
  // unset mobile tab attributes
  $mobileTab.removeAttribute('id');
  $mobileTab.removeAttribute('role');
  $mobileTab.removeAttribute('aria-controls');
  $mobileTab.removeAttribute('aria-selected');

  // unset panel attributes
  var $panel = this.getPanel($tab);
  $panel.removeAttribute('role');
  $panel.removeAttribute('aria-labelledby');
  $panel.classList.remove(this.jsHiddenClass);
};

/**
 * IdskTabs onTabClick handler
 *
 * @param {object} e - The event object
 */
IdskTabs.prototype.onTabClick = function (e) {
  if (
    !(
      e.target.classList.contains('idsk-tabs__tab') ||
      e.target.classList.contains('idsk-tabs__mobile-tab') ||
      e.target.classList.contains('idsk-tabs__tab-arrow-mobile')
    )
  ) {
    // Allow events on child DOM elements to bubble up to tab parent
    return
  }
  e.preventDefault();
  var $newTab = e.target;
  var $currentTab = this.getCurrentTab();

  if ($newTab.classList.contains('idsk-tabs__tab-arrow-mobile')) {
    $newTab = $newTab.parentElement;
  }
  if ($newTab.nodeName === 'BUTTON') {
    $newTab = this.$tabs[$newTab.getAttribute('item')];
    if ($newTab === $currentTab) {
      this.toggleMobileTab($currentTab, false);
    } else {
      this.toggleMobileTab($currentTab, true);
      this.toggleMobileTab($newTab, false);
    }
  }
  this.hideTab($currentTab);
  this.showTab($newTab);
  this.createHistoryEntry($newTab);
};

/**
 * IdskTabs createHistoryEntry handler
 *
 * @param {object} $tab - The tab to create a history entry for
 */
IdskTabs.prototype.createHistoryEntry = function ($tab) {
  var $panel = this.getPanel($tab);

  // Save and restore the id
  // so the page doesn't jump when a user clicks a tab (which changes the hash)
  var id = $panel.id;
  $panel.id = '';
  this.changingHash = true;
  window.location.hash = this.getHref($tab).slice(1);
  $panel.id = id;
};

/**
 * IdskTabs getPanel handler
 *
 * @param {object} $tab - The tab to get the panel for
 * @returns {object} The panel element
 */
IdskTabs.prototype.getPanel = function ($tab) {
  var $panel = this.$module.querySelector(this.getHref($tab));
  return $panel
};

/**
 * IdskTabs showPanel handler
 *
 * @param {object} $tab - The tab to show the panel for
 */
IdskTabs.prototype.showPanel = function ($tab) {
  var $panel = this.getPanel($tab);
  $panel.classList.remove(this.jsHiddenClass);
};

/**
 * IdskTabs hidePanel handler
 *
 * @param {object} tab - The tab to hide the panel for
 */
IdskTabs.prototype.hidePanel = function (tab) {
  var $panel = this.getPanel(tab);
  $panel.classList.add(this.jsHiddenClass);
};

/**
 * IdskTabs unhighlightTab handler
 *
 * @param {object} $tab - The tab to unhighlight
 */
IdskTabs.prototype.unhighlightTab = function ($tab) {
  $tab.setAttribute('aria-selected', 'false');
  this.$mobileTabs[$tab.getAttribute('item')].setAttribute(
    'aria-selected',
    'false'
  );
  $tab.parentNode.classList.remove('idsk-tabs__list-item--selected');
};

/**
 * IdskTabs highlightTab handler
 *
 * @param {object} $tab - The tab to highlight
 */
IdskTabs.prototype.highlightTab = function ($tab) {
  $tab.setAttribute('aria-selected', 'true');
  this.$mobileTabs[$tab.getAttribute('item')].setAttribute(
    'aria-selected',
    'true'
  );
  $tab.parentNode.classList.add('idsk-tabs__list-item--selected');
};

/**
 * IdskTabs getCurrentTab handler
 *
 * @returns {object} - The currently selected tab
 */
IdskTabs.prototype.getCurrentTab = function () {
  return this.$module.querySelector(
    '.idsk-tabs__list-item--selected .idsk-tabs__tab'
  )
};

/**
 * IdskTabs getHref handler
 * this is because IE doesn't always return the actual value but a relative full path
 *
 * @param {object} $tab - The tab to get the href for
 * @returns {string} - The href of the tab
 */
IdskTabs.prototype.getHref = function ($tab) {
  var href = $tab.getAttribute('href');
  var hash = href.slice(href.indexOf('#'), href.length);
  return hash
};

export default IdskTabs;
//# sourceMappingURL=components/idsk-tabs/idsk-tabs.mjs.map

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('GOVUKFrontend.IdskInPageNavigation', factory) :
  (global.GOVUKFrontend = global.GOVUKFrontend || {}, global.GOVUKFrontend.IdskInPageNavigation = factory());
}(this, (function () { 'use strict';

  /* eslint-disable */

  /**
   * InPageNavigation Component
   */
  function IdskInPageNavigation ($module) {
    this.$module = $module;
  }

  /**
   * InPageNavigation init function
   */
  IdskInPageNavigation.prototype.init = function () {
    // Check for module
    var $module = this.$module;
    if (!$module) {
      return
    }

    // Check for button
    var $links = $module.querySelectorAll('.idsk-in-page-navigation__link');
    if (!$links) {
      return
    }

    // list of all ids and titles
    this.$arrTitlesAndElems = [];
    // Handle $link click events
    $links.forEach(
      function ($link) {
        var $item = {};
        $item.el = document.getElementById($link.href.split('#')[1]);
        this.$arrTitlesAndElems.push($item);
        $link.addEventListener('click', this.handleClickLink.bind(this));
      }.bind(this)
    );

    var $linkPanelButton = $module.querySelector(
      '.idsk-in-page-navigation__link-panel'
    );
    if (!$linkPanelButton) {
      return
    }
    $module.boundCheckCloseClick = this.checkCloseClick.bind(this);
    $module.boundHandleClickLinkPanel = this.handleClickLinkPanel.bind(this);
    $linkPanelButton.addEventListener(
      'click',
      $module.boundHandleClickLinkPanel,
      true
    );

    // Handle floating navigation
    window.addEventListener('scroll', this.scrollFunction.bind(this));
    // Handle case if the viewport is shor and there are more than one article - scrolling is not needed, but navigation pointer has to be updated
    this.$module.labelChanged = false;
  };

  /**
   * An event handler for click event on $link - add actual title to link panel
   *
   * @param {object} e
   */
  IdskInPageNavigation.prototype.handleClickLink = function (e) {
    var $link = e.target || e.srcElement;
    var $id = $link.closest('.idsk-in-page-navigation__link').href.split('#')[1];
    var $panelHeight = this.$module.getElementsByClassName(
      'idsk-in-page-navigation__link-panel'
    )[0].offsetHeight;

    setTimeout(
      function () {
        if (document.getElementById($id) != null) {
          this.$module.labelChanged = true;
          this.changeCurrentLink($link);
          window.scrollTo(
            0,
            document.getElementById($id).offsetTop - $panelHeight * 2.5
          );
        } else {
          this.changeCurrentLink($link);
        }
      }.bind(this),
      10
    );
  };

  /**
   * An event handler for click event on $linkPanel - collapse or expand in page navigation menu
   *
   * @param {object} e
   */
  IdskInPageNavigation.prototype.handleClickLinkPanel = function (e) {
    var $module = this.$module;
    var $linkPanelButton = $module.querySelector(
      '.idsk-in-page-navigation__link-panel'
    );
    var $expandedButton = $module.querySelector(
      '.idsk-in-page-navigation__link-panel-button'
    );

    $module.classList.add('idsk-in-page-navigation--expand');
    $linkPanelButton.removeEventListener(
      'click',
      $module.boundHandleClickLinkPanel,
      true
    );
    $expandedButton.setAttribute('aria-expanded', 'true');
    $expandedButton.setAttribute(
      'aria-label',
      $expandedButton.getAttribute('data-text-for-show')
    );
    document.addEventListener('click', $module.boundCheckCloseClick, true);
  };

  /**
   * close navigation if the user click outside navigation
   *
   * @param {object} e
   */
  IdskInPageNavigation.prototype.checkCloseClick = function (e) {
    var $el = e.target || e.srcElement;
    var $navigationList = $el.closest('.idsk-in-page-navigation__list');
    var $module = this.$module;
    var $linkPanelButton = $module.querySelector(
      '.idsk-in-page-navigation__link-panel'
    );
    var $expandedButton = $module.querySelector(
      '.idsk-in-page-navigation__link-panel-button'
    );

    if ($navigationList == null) {
      e.stopPropagation(); // prevent bubbling
      $module.classList.remove('idsk-in-page-navigation--expand');
      $linkPanelButton.addEventListener(
        'click',
        $module.boundHandleClickLinkPanel,
        true
      );
      document.removeEventListener('click', $module.boundCheckCloseClick, true);
      $expandedButton.setAttribute('aria-expanded', 'false');
      $expandedButton.setAttribute(
        'aria-label',
        $expandedButton.getAttribute('data-text-for-hide')
      );
    }
  };

  /**
   * When the user scrolls down from the top of the document, set position to fixed
   */
  IdskInPageNavigation.prototype.scrollFunction = function () {
    var $module = this.$module;
    var $arrTitlesAndElems = this.$arrTitlesAndElems;
    var $parentModule = $module.parentElement;
    var $navTopPosition = $parentModule.offsetTop - 55; // padding
    var $links = $module.querySelectorAll('.idsk-in-page-navigation__list-item');

    if (window.pageYOffset <= $navTopPosition) {
      $module.classList.remove('idsk-in-page-navigation--sticky');
    } else {
      $module.classList.add('idsk-in-page-navigation--sticky');
    }

    if (this.$module.labelChanged) {
      this.$module.labelChanged = false;
    } else if ($module.classList.contains('idsk-in-page-navigation--sticky')) {
      var $self = this;
      $arrTitlesAndElems.some(function ($item, $index) {
        if (
          $item.el.offsetTop >= window.scrollY &&
          $item.el.offsetTop <= window.scrollY + window.innerHeight
        ) {
          $self.changeCurrentLink($links[$index]);

          return true
        }
        return false
      });
    } else {
      this.changeCurrentLink($links[0]);
    }
  };

  /**
   * InPageNavigation changeCurrentLink handler
   */
  IdskInPageNavigation.prototype.changeCurrentLink = function (el) {
    var $module = this.$module;
    var $currItem = el.closest('.idsk-in-page-navigation__list-item');
    var $articleTitle = $currItem.querySelector(
      '.idsk-in-page-navigation__link-title'
    );
    var $items = $module.querySelectorAll('.idsk-in-page-navigation__list-item');
    var $linkPanelText = $module.querySelector(
      '.idsk-in-page-navigation__link-panel-button'
    );

    $items.forEach(function ($item) {
      $item.classList.remove('idsk-in-page-navigation__list-item--active');
    });
    $currItem.classList.add('idsk-in-page-navigation__list-item--active');
    $linkPanelText.innerText = $articleTitle.innerText;

    // let active item be always visible
    $currItem.scrollIntoView({
      block: 'nearest',
      inline: 'nearest'
    });
  };

  return IdskInPageNavigation;

})));
//# sourceMappingURL=idsk-in-page-navigation.js.map

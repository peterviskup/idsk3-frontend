
var $module = document.querySelectorAll('[data-module="idsk-graph"]')[0];

var $radioOptions = $module.querySelectorAll('.idsk-graph__radio');
if ($radioOptions) {
    for (var index = 0; index < $radioOptions.length; index++) {
        var $radioOption = $radioOptions[index];
        $radioOption.addEventListener('change', function(e){handleRadioButtonModeClick(e)});
    }
}

var $shareButtonByCopyToClickboard = $module.querySelector('.idsk-graph__copy-to-clickboard')
if ($shareButtonByCopyToClickboard) {
    $shareButtonByCopyToClickboard.addEventListener('click', function(e){handleShareByCopyToClickboardClick(e)});
}

var $shareButtonByEmail = $module.querySelector('.idsk-graph__send-link-by-email')
if ($shareButtonByEmail) {
    $shareButtonByEmail.addEventListener('click', function(e){handleShareByEmailClick(e)})
}

var $shareButtonByFacebook = $module.querySelector('.idsk-graph__share-on-facebook')
if ($shareButtonByFacebook) {
    $shareButtonByFacebook.addEventListener('click', function(e){handleShareByFacebook(e)})
}

var $dropdownLinks = $module.querySelectorAll('.idsk-graph__meta-link-list')
if ($dropdownLinks) {
    for (var index = 0; index < $dropdownLinks.length; index++) {
        var $dropdownLink = $dropdownLinks[index];
        $dropdownLink.addEventListener('click', function(e){handleDropdownLinkClick(e)})
    }

    $module.boundCheckDropdownOutsideClick = checkDropdownOutsideClick();
}

var $tabs = $module.querySelectorAll('.govuk-tabs__tab')
if ($tabs) {
    for (var index = 0; index < $tabs.length; index++) {
        var $tab = $tabs[index];
        $tab.addEventListener('click', function(e){handleTabLinkClick(e)});
    }

    var $forcedActiveTab = $module.querySelector('.govuk-tabs').dataset.activetab
    var $activeTab = $module.querySelector('.govuk-tabs__tab[href="' + window.location.hash + '"]') || $tabs[$forcedActiveTab || 0]
    showTab($activeTab)
}

var $radioBtn = $module.querySelector('.idsk-graph__radio')
var $radiosName = $radioBtn.getAttribute('name')
var $selectedControlOption = $module.querySelector('input[name="' + $radiosName + '"]:checked').value
handleRadioButtonModeClick($selectedControlOption)


/**
 * Handle click on radio buttons
 * @param {object} e 
 */
function handleRadioButtonModeClick (e) {
    var $el = e.target || e.srcElement;

    if (!$el) {
        return
    }

    var $value = $el.getAttribute('value')
    var $iframeGraphs = $module.querySelectorAll('.idsk-graph__iframe')
    $iframeGraphs.forEach(function ($iframeGraph) {
        var $iframeSrc = $iframeGraph.dataset.src
        var $srcParam = $iframeSrc.indexOf('?') < 0 ? '?type=' + $value : '&type=' + $value
        $iframeGraph.src = $iframeSrc + $srcParam
    })
}

/**
 * Handle click on copy link to clickboard
 * @param {object} e 
 */
function handleShareByCopyToClickboardClick (e) {
    e.preventDefault();
    var textarea = document.createElement('textarea');
    textarea.textContent = location.href;
    textarea.style.position = 'fixed';  // Prevent scrolling to bottom of page in Microsoft Edge.
    document.body.appendChild(textarea);
    textarea.select();

    try {
        return document.execCommand('copy');  // Security exception may be thrown by some browsers.
    } catch (ex) {
        return false;
    } finally {
        document.body.removeChild(textarea);
    }
}

/**
 * Handle click on share link by email
 * @param {object} e 
 */
function handleShareByEmailClick (e) {
    var $el = e.target || e.srcElement;
    var $subject = $module.querySelector('.idsk-graph__title h2').innerText
    var $body = $subject.dataset.lines + location.href
    var $mailto = 'mailto:?Subject=' + $subject + '&body=' + $body

    $el.href = $mailto
}

/**
 * Handle click on share by facebook link
 * @param {object} e 
 */
function handleShareByFacebook (e) {
    var $el = e.target || e.srcElement;
    var $shareLink = 'https://www.facebook.com/sharer/sharer.php?u=' + location.href

    $el.href = $shareLink
}

/**
 * Handle click on link and show drop down list
 * @param {object} e 
 */
function handleDropdownLinkClick (e) {
    e.preventDefault();

    var $el = e.target || e.srcElement;
    var $link = $el.closest('.idsk-graph__meta-link-list')
    var $dropdown = $link.parentElement.querySelector('.idsk-graph__meta-list')
    var $dropdownDisplayProp = window.getComputedStyle($dropdown, null).display;
    var $dropdownLists = $module.querySelectorAll('.idsk-graph__meta-list')

    $dropdownLists.forEach(function ($dropdownList) {
        $dropdownList.style.display = 'none'
    })
    $dropdown.style.display = $dropdownDisplayProp == 'block' ? 'none' : 'block'

    document.addEventListener('click', $module.boundCheckDropdownOutsideClick, true);
}

/**
 * handle click outside dropdown menu
 */
function checkDropdownOutsideClick () {
    var $dropdownLists = $module.querySelectorAll('.idsk-graph__meta-list')
    $dropdownLists.forEach(function ($dropdownList) {
        $dropdownList.style.display = 'none'
    })
    document.removeEventListener('click', $module.boundCheckDropdownOutsideClick, false);
}

/**
 * Handle click on Tab -> show related section
 * @param {object} e 
 */
function handleTabLinkClick (e) {
    e.preventDefault();
    var $tab = e.target || e.srcElement;

    var $activePanel = $module.querySelector('.idsk-graph__section-show')
    var $activePanelId = $activePanel.getAttribute('id')
    var $activeTabLink = $module.querySelector('a[href="#' + $activePanelId + '"]')
    var $activeTabLi = $activeTabLink.closest('.govuk-tabs__list-item')

    $activePanel.classList.remove('idsk-graph__section-show')
    $activeTabLi.classList.remove('idsk-graph__section--selected')

    showTab($tab)
}

/**
 * Show section based on tab
 * @param {object} $tab 
 */
function showTab ($tab) {
    var $href = $tab.getAttribute('href')
    var $hash = $href.slice($href.indexOf('#'), $href.length)
    var $hash = $href.slice($href.indexOf('#'), $href.length)
    var $panel = $module.querySelector($hash)
    var $tabLi = $tab.closest('.govuk-tabs__list-item')

    $tabLi.classList.add('idsk-graph__section--selected')
    $panel.classList.add('idsk-graph__section-show')
}


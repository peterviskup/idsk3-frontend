(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define('GOVUKFrontend.IdskStepper', factory) :
    (global.GOVUKFrontend = global.GOVUKFrontend || {}, global.GOVUKFrontend.IdskStepper = factory());
}(this, (function () { 'use strict';

    (function (undefined) {

        // Detection from https://raw.githubusercontent.com/Financial-Times/polyfill-service/master/packages/polyfill-library/polyfills/DOMTokenList/detect.js
        var detect = (
          'DOMTokenList' in this && (function (x) {
            return 'classList' in x ? !x.classList.toggle('x', false) && !x.className : true;
          })(document.createElement('x'))
        );

        if (detect) return

        // Polyfill from https://raw.githubusercontent.com/Financial-Times/polyfill-service/master/packages/polyfill-library/polyfills/DOMTokenList/polyfill.js
        (function (global) {
          var nativeImpl = "DOMTokenList" in global && global.DOMTokenList;

          if (
              !nativeImpl ||
              (
                !!document.createElementNS &&
                !!document.createElementNS('http://www.w3.org/2000/svg', 'svg') &&
                !(document.createElementNS("http://www.w3.org/2000/svg", "svg").classList instanceof DOMTokenList)
              )
            ) {
            global.DOMTokenList = (function() { // eslint-disable-line no-unused-vars
              var dpSupport = true;
              var defineGetter = function (object, name, fn, configurable) {
                if (Object.defineProperty)
                  Object.defineProperty(object, name, {
                    configurable: false === dpSupport ? true : !!configurable,
                    get: fn
                  });

                else object.__defineGetter__(name, fn);
              };

              /** Ensure the browser allows Object.defineProperty to be used on native JavaScript objects. */
              try {
                defineGetter({}, "support");
              }
              catch (e) {
                dpSupport = false;
              }


              var _DOMTokenList = function (el, prop) {
                var that = this;
                var tokens = [];
                var tokenMap = {};
                var length = 0;
                var maxLength = 0;
                var addIndexGetter = function (i) {
                  defineGetter(that, i, function () {
                    preop();
                    return tokens[i];
                  }, false);

                };
                var reindex = function () {

                  /** Define getter functions for array-like access to the tokenList's contents. */
                  if (length >= maxLength)
                    for (; maxLength < length; ++maxLength) {
                      addIndexGetter(maxLength);
                    }
                };

                /** Helper function called at the start of each class method. Internal use only. */
                var preop = function () {
                  var error;
                  var i;
                  var args = arguments;
                  var rSpace = /\s+/;

                  /** Validate the token/s passed to an instance method, if any. */
                  if (args.length)
                    for (i = 0; i < args.length; ++i)
                      if (rSpace.test(args[i])) {
                        error = new SyntaxError('String "' + args[i] + '" ' + "contains" + ' an invalid character');
                        // @ts-expect-error Ignore unknown 'code' property on SyntaxError
                        error.code = 5;
                        error.name = "InvalidCharacterError";
                        throw error;
                      }


                  /** Split the new value apart by whitespace*/
                  if (typeof el[prop] === "object") {
                    tokens = ("" + el[prop].baseVal).replace(/^\s+|\s+$/g, "").split(rSpace);
                  } else {
                    tokens = ("" + el[prop]).replace(/^\s+|\s+$/g, "").split(rSpace);
                  }

                  /** Avoid treating blank strings as single-item token lists */
                  if ("" === tokens[0]) tokens = [];

                  /** Repopulate the internal token lists */
                  tokenMap = {};
                  for (i = 0; i < tokens.length; ++i)
                    tokenMap[tokens[i]] = true;
                  length = tokens.length;
                  reindex();
                };

                /** Populate our internal token list if the targeted attribute of the subject element isn't empty. */
                preop();

                /** Return the number of tokens in the underlying string. Read-only. */
                defineGetter(that, "length", function () {
                  preop();
                  return length;
                });

                /** Override the default toString/toLocaleString methods to return a space-delimited list of tokens when typecast. */
                that.toLocaleString =
                  that.toString = function () {
                    preop();
                    return tokens.join(" ");
                  };

                that.item = function (idx) {
                  preop();
                  return tokens[idx];
                };

                that.contains = function (token) {
                  preop();
                  return !!tokenMap[token];
                };

                that.add = function () {
                  // @ts-expect-error Ignore mismatch between arguments types
                  preop.apply(that, args = arguments);

                  for (var args, token, i = 0, l = args.length; i < l; ++i) {
                    token = args[i];
                    if (!tokenMap[token]) {
                      tokens.push(token);
                      tokenMap[token] = true;
                    }
                  }

                  /** Update the targeted attribute of the attached element if the token list's changed. */
                  if (length !== tokens.length) {
                    length = tokens.length >>> 0;
                    if (typeof el[prop] === "object") {
                      el[prop].baseVal = tokens.join(" ");
                    } else {
                      el[prop] = tokens.join(" ");
                    }
                    reindex();
                  }
                };

                that.remove = function () {
                  // @ts-expect-error Ignore mismatch between arguments types
                  preop.apply(that, args = arguments);

                  /** Build a hash of token names to compare against when recollecting our token list. */
                  for (var args, ignore = {}, i = 0, t = []; i < args.length; ++i) {
                    ignore[args[i]] = true;
                    delete tokenMap[args[i]];
                  }

                  /** Run through our tokens list and reassign only those that aren't defined in the hash declared above. */
                  for (i = 0; i < tokens.length; ++i)
                    if (!ignore[tokens[i]]) t.push(tokens[i]);

                  tokens = t;
                  length = t.length >>> 0;

                  /** Update the targeted attribute of the attached element. */
                  if (typeof el[prop] === "object") {
                    el[prop].baseVal = tokens.join(" ");
                  } else {
                    el[prop] = tokens.join(" ");
                  }
                  reindex();
                };

                that.toggle = function (token, force) {
                  preop.apply(that, [token]);

                  /** Token state's being forced. */
                  if (undefined !== force) {
                    if (force) {
                      that.add(token);
                      return true;
                    } else {
                      that.remove(token);
                      return false;
                    }
                  }

                  /** Token already exists in tokenList. Remove it, and return FALSE. */
                  if (tokenMap[token]) {
                    that.remove(token);
                    return false;
                  }

                  /** Otherwise, add the token and return TRUE. */
                  that.add(token);
                  return true;
                };

                return that;
              };

              return _DOMTokenList;
            }());
          }

          // Add second argument to native DOMTokenList.toggle() if necessary
          (function () {
            var e = document.createElement('span');
            if (!('classList' in e)) return;
            e.classList.toggle('x', false);
            if (!e.classList.contains('x')) return;
            e.classList.constructor.prototype.toggle = function toggle(token /*, force*/) {
              var force = arguments[1];
              if (force === undefined) {
                var add = !this.contains(token);
                this[add ? 'add' : 'remove'](token);
                return add;
              }
              force = !!force;
              this[force ? 'add' : 'remove'](token);
              return force;
            };
          }());

          // Add multiple arguments to native DOMTokenList.add() if necessary
          (function () {
            var e = document.createElement('span');
            if (!('classList' in e)) return;
            e.classList.add('a', 'b');
            if (e.classList.contains('b')) return;
            var native = e.classList.constructor.prototype.add;
            e.classList.constructor.prototype.add = function () {
              var args = arguments;
              var l = arguments.length;
              for (var i = 0; i < l; i++) {
                native.call(this, args[i]);
              }
            };
          }());

          // Add multiple arguments to native DOMTokenList.remove() if necessary
          (function () {
            var e = document.createElement('span');
            if (!('classList' in e)) return;
            e.classList.add('a');
            e.classList.add('b');
            e.classList.remove('a', 'b');
            if (!e.classList.contains('b')) return;
            var native = e.classList.constructor.prototype.remove;
            e.classList.constructor.prototype.remove = function () {
              var args = arguments;
              var l = arguments.length;
              for (var i = 0; i < l; i++) {
                native.call(this, args[i]);
              }
            };
          }());

        }(this));

    }).call('object' === typeof window && window || 'object' === typeof self && self || 'object' === typeof global && global || {});

    (function(undefined) {

        // Detection from https://raw.githubusercontent.com/Financial-Times/polyfill-service/8717a9e04ac7aff99b4980fbedead98036b0929a/packages/polyfill-library/polyfills/Element/prototype/classList/detect.js
        var detect = (
          'document' in this && "classList" in document.documentElement && 'Element' in this && 'classList' in Element.prototype && (function () {
            var e = document.createElement('span');
            e.classList.add('a', 'b');
            return e.classList.contains('b');
          }())
        );

        if (detect) return

        // Polyfill from https://cdn.polyfill.io/v2/polyfill.js?features=Element.prototype.classList&flags=always
        (function (global) {
          var dpSupport = true;
          var defineGetter = function (object, name, fn, configurable) {
            if (Object.defineProperty)
              Object.defineProperty(object, name, {
                configurable: false === dpSupport ? true : !!configurable,
                get: fn
              });

            else object.__defineGetter__(name, fn);
          };
          /** Ensure the browser allows Object.defineProperty to be used on native JavaScript objects. */
          try {
            defineGetter({}, "support");
          }
          catch (e) {
            dpSupport = false;
          }
          /** Polyfills a property with a DOMTokenList */
          var addProp = function (o, name, attr) {

            defineGetter(o.prototype, name, function () {
              var tokenList;

              var THIS = this,

              /** Prevent this from firing twice for some reason. What the hell, IE. */
              gibberishProperty = "__defineGetter__" + "DEFINE_PROPERTY" + name;
              if(THIS[gibberishProperty]) return tokenList;
              THIS[gibberishProperty] = true;

              /**
               * IE8 can't define properties on native JavaScript objects, so we'll use a dumb hack instead.
               *
               * What this is doing is creating a dummy element ("reflection") inside a detached phantom node ("mirror")
               * that serves as the target of Object.defineProperty instead. While we could simply use the subject HTML
               * element instead, this would conflict with element types which use indexed properties (such as forms and
               * select lists).
               */
              if (false === dpSupport) {

                var visage;
                // @ts-expect-error Ignore unknown 'mirror' property on function
                var mirror = addProp.mirror || document.createElement("div");
                var reflections = mirror.childNodes;
                var l = reflections.length;

                for (var i = 0; i < l; ++i)
                  if (reflections[i]._R === THIS) {
                    visage = reflections[i];
                    break;
                  }

                /** Couldn't find an element's reflection inside the mirror. Materialise one. */
                visage || (visage = mirror.appendChild(document.createElement("div")));

                // @ts-expect-error Ignore 'Expected 1 arguments, but got 3'
                tokenList = DOMTokenList.call(visage, THIS, attr);
              // @ts-expect-error Ignore 'Expected 0 arguments, but got 2'
              } else tokenList = new DOMTokenList(THIS, attr);

              defineGetter(THIS, name, function () {
                return tokenList;
              });
              delete THIS[gibberishProperty];

              return tokenList;
            }, true);
          };

          addProp(global.Element, "classList", "className");
          addProp(global.HTMLElement, "classList", "className");
          addProp(global.HTMLLinkElement, "relList", "rel");
          addProp(global.HTMLAnchorElement, "relList", "rel");
          addProp(global.HTMLAreaElement, "relList", "rel");
        }(this));

    }).call('object' === typeof window && window || 'object' === typeof self && self || 'object' === typeof global && global || {});

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

    return IdskStepper;

})));
//# sourceMappingURL=idsk-stepper.js.map

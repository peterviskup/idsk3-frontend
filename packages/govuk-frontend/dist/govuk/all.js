(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define('GOVUKFrontend', ['exports'], factory) :
  (factory((global.GOVUKFrontend = {})));
}(this, (function (exports) { 'use strict';

  /*
   * This variable is automatically overwritten during builds and releases.
   * It doesn't need to be updated manually.
   */

  /**
   * GOV.UK Frontend release version
   *
   * {@link https://github.com/alphagov/govuk-frontend/releases}
   */
  var version = '4.6.0';

  /**
   * Common helpers which do not require polyfill.
   *
   * IMPORTANT: If a helper require a polyfill, please isolate it in its own module
   * so that the polyfill can be properly tree-shaken and does not burden
   * the components that do not need that helper
   *
   * @module common/index
   */

  /**
   * Used to generate a unique string, allows multiple instances of the component
   * without them conflicting with each other.
   * https://stackoverflow.com/a/8809472
   *
   * @deprecated Will be made private in v5.0
   * @returns {string} Unique ID
   */
  function generateUniqueID () {
    var d = new Date().getTime();
    if (typeof window.performance !== 'undefined' && typeof window.performance.now === 'function') {
      d += window.performance.now(); // use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
  }

  /**
   * Config flattening function
   *
   * Takes any number of objects, flattens them into namespaced key-value pairs,
   * (e.g. \{'i18n.showSection': 'Show section'\}) and combines them together, with
   * greatest priority on the LAST item passed in.
   *
   * @deprecated Will be made private in v5.0
   * @returns {{ [key: string]: unknown }} A flattened object of key-value pairs.
   */
  function mergeConfigs (/* configObject1, configObject2, ...configObjects */) {
    /**
     * Function to take nested objects and flatten them to a dot-separated keyed
     * object. Doing this means we don't need to do any deep/recursive merging of
     * each of our objects, nor transform our dataset from a flat list into a
     * nested object.
     *
     * @param {{ [key: string]: unknown }} configObject - Deeply nested object
     * @returns {{ [key: string]: unknown }} Flattened object with dot-separated keys
     */
    var flattenObject = function (configObject) {
      // Prepare an empty return object
      /** @type {{ [key: string]: unknown }} */
      var flattenedObject = {};

      /**
       * Our flattening function, this is called recursively for each level of
       * depth in the object. At each level we prepend the previous level names to
       * the key using `prefix`.
       *
       * @param {Partial<{ [key: string]: unknown }>} obj - Object to flatten
       * @param {string} [prefix] - Optional dot-separated prefix
       */
      var flattenLoop = function (obj, prefix) {
        // Loop through keys...
        for (var key in obj) {
          // Check to see if this is a prototypical key/value,
          // if it is, skip it.
          if (!Object.prototype.hasOwnProperty.call(obj, key)) {
            continue
          }
          var value = obj[key];
          var prefixedKey = prefix ? prefix + '.' + key : key;
          if (typeof value === 'object') {
            // If the value is a nested object, recurse over that too
            flattenLoop(value, prefixedKey);
          } else {
            // Otherwise, add this value to our return object
            flattenedObject[prefixedKey] = value;
          }
        }
      };

      // Kick off the recursive loop
      flattenLoop(configObject);
      return flattenedObject
    };

    // Start with an empty object as our base
    /** @type {{ [key: string]: unknown }} */
    var formattedConfigObject = {};

    // Loop through each of the remaining passed objects and push their keys
    // one-by-one into configObject. Any duplicate keys will override the existing
    // key with the new value.
    for (var i = 0; i < arguments.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Ignore mismatch between arguments types
      var obj = flattenObject(arguments[i]);
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          formattedConfigObject[key] = obj[key];
        }
      }
    }

    return formattedConfigObject
  }

  /**
   * Extracts keys starting with a particular namespace from a flattened config
   * object, removing the namespace in the process.
   *
   * @deprecated Will be made private in v5.0
   * @param {{ [key: string]: unknown }} configObject - The object to extract key-value pairs from.
   * @param {string} namespace - The namespace to filter keys with.
   * @returns {{ [key: string]: unknown }} Flattened object with dot-separated key namespace removed
   * @throws {Error} Config object required
   * @throws {Error} Namespace string required
   */
  function extractConfigByNamespace (configObject, namespace) {
    // Check we have what we need
    if (!configObject || typeof configObject !== 'object') {
      throw new Error('Provide a `configObject` of type "object".')
    }

    if (!namespace || typeof namespace !== 'string') {
      throw new Error('Provide a `namespace` of type "string" to filter the `configObject` by.')
    }

    /** @type {{ [key: string]: unknown }} */
    var newObject = {};

    for (var key in configObject) {
      // Split the key into parts, using . as our namespace separator
      var keyParts = key.split('.');
      // Check if the first namespace matches the configured namespace
      if (Object.prototype.hasOwnProperty.call(configObject, key) && keyParts[0] === namespace) {
        // Remove the first item (the namespace) from the parts array,
        // but only if there is more than one part (we don't want blank keys!)
        if (keyParts.length > 1) {
          keyParts.shift();
        }
        // Join the remaining parts back together
        var newKey = keyParts.join('.');
        // Add them to our new object
        newObject[newKey] = configObject[key];
      }
    }
    return newObject
  }

  /**
   * Toggle class
   *
   * @param {object} node - element
   * @param {string} className - to toggle
   */
  function toggleClass (node, className) {
    if (node === null) {
      return
    }

    if (node.className.indexOf(className) > 0) {
      node.className = node.className.replace(' ' + className, '');
    } else {
      node.className += ' ' + className;
    }
  }

  /**
   * Normalise string
   *
   * 'If it looks like a duck, and it quacks like a duck…' 🦆
   *
   * If the passed value looks like a boolean or a number, convert it to a boolean
   * or number.
   *
   * Designed to be used to convert config passed via data attributes (which are
   * always strings) into something sensible.
   *
   * @deprecated Will be made private in v5.0
   * @param {string} value - The value to normalise
   * @returns {string | boolean | number | undefined} Normalised data
   */
  function normaliseString (value) {
    if (typeof value !== 'string') {
      return value
    }

    var trimmedValue = value.trim();

    if (trimmedValue === 'true') {
      return true
    }

    if (trimmedValue === 'false') {
      return false
    }

    // Empty / whitespace-only strings are considered finite so we need to check
    // the length of the trimmed string as well
    if (trimmedValue.length > 0 && isFinite(Number(trimmedValue))) {
      return Number(trimmedValue)
    }

    return value
  }

  /**
   * Normalise dataset
   *
   * Loop over an object and normalise each value using normaliseData function
   *
   * @deprecated Will be made private in v5.0
   * @param {DOMStringMap} dataset - HTML element dataset
   * @returns {{ [key: string]: unknown }} Normalised dataset
   */
  function normaliseDataset (dataset) {
    /** @type {{ [key: string]: unknown }} */
    var out = {};

    for (var key in dataset) {
      out[key] = normaliseString(dataset[key]);
    }

    return out
  }

  /**
   * Internal support for selecting messages to render, with placeholder
   * interpolation and locale-aware number formatting and pluralisation
   *
   * @class
   * @private
   * @param {{ [key: string]: unknown }} translations - Key-value pairs of the translation strings to use.
   * @param {object} [config] - Configuration options for the function.
   * @param {string} [config.locale] - An overriding locale for the PluralRules functionality.
   */
  function I18n (translations, config) {
    // Make list of translations available throughout function
    this.translations = translations || {};

    // The locale to use for PluralRules and NumberFormat
    this.locale = (config && config.locale) || document.documentElement.lang || 'en';
  }

  /**
   * The most used function - takes the key for a given piece of UI text and
   * returns the appropriate string.
   *
   * @param {string} lookupKey - The lookup key of the string to use.
   * @param {{ [key: string]: unknown }} [options] - Any options passed with the translation string, e.g: for string interpolation.
   * @returns {string} The appropriate translation string.
   * @throws {Error} Lookup key required
   * @throws {Error} Options required for `${}` placeholders
   */
  I18n.prototype.t = function (lookupKey, options) {
    if (!lookupKey) {
      // Print a console error if no lookup key has been provided
      throw new Error('i18n: lookup key missing')
    }

    // If the `count` option is set, determine which plural suffix is needed and
    // change the lookupKey to match. We check to see if it's numeric instead of
    // falsy, as this could legitimately be 0.
    if (options && typeof options.count === 'number') {
      // Get the plural suffix
      lookupKey = lookupKey + '.' + this.getPluralSuffix(lookupKey, options.count);
    }

    // Fetch the translation string for that lookup key
    var translationString = this.translations[lookupKey];

    if (typeof translationString === 'string') {
      // Check for ${} placeholders in the translation string
      if (translationString.match(/%{(.\S+)}/)) {
        if (!options) {
          throw new Error('i18n: cannot replace placeholders in string if no option data provided')
        }

        return this.replacePlaceholders(translationString, options)
      } else {
        return translationString
      }
    } else {
      // If the key wasn't found in our translations object,
      // return the lookup key itself as the fallback
      return lookupKey
    }
  };

  /**
   * Takes a translation string with placeholders, and replaces the placeholders
   * with the provided data
   *
   * @param {string} translationString - The translation string
   * @param {{ [key: string]: unknown }} options - Any options passed with the translation string, e.g: for string interpolation.
   * @returns {string} The translation string to output, with $\{\} placeholders replaced
   */
  I18n.prototype.replacePlaceholders = function (translationString, options) {
    /** @type {Intl.NumberFormat | undefined} */
    var formatter;

    if (this.hasIntlNumberFormatSupport()) {
      formatter = new Intl.NumberFormat(this.locale);
    }

    return translationString.replace(
      /%{(.\S+)}/g,

      /**
       * Replace translation string placeholders
       *
       * @param {string} placeholderWithBraces - Placeholder with braces
       * @param {string} placeholderKey - Placeholder key
       * @returns {string} Placeholder value
       */
      function (placeholderWithBraces, placeholderKey) {
        if (Object.prototype.hasOwnProperty.call(options, placeholderKey)) {
          var placeholderValue = options[placeholderKey];

          // If a user has passed `false` as the value for the placeholder
          // treat it as though the value should not be displayed
          if (placeholderValue === false || (
            typeof placeholderValue !== 'number' &&
            typeof placeholderValue !== 'string')
          ) {
            return ''
          }

          // If the placeholder's value is a number, localise the number formatting
          if (typeof placeholderValue === 'number') {
            return formatter ? formatter.format(placeholderValue) : placeholderValue.toString()
          }

          return placeholderValue
        } else {
          throw new Error('i18n: no data found to replace ' + placeholderWithBraces + ' placeholder in string')
        }
      })
  };

  /**
   * Check to see if the browser supports Intl and Intl.PluralRules.
   *
   * It requires all conditions to be met in order to be supported:
   * - The browser supports the Intl class (true in IE11)
   * - The implementation of Intl supports PluralRules (NOT true in IE11)
   * - The browser/OS has plural rules for the current locale (browser dependent)
   *
   * @returns {boolean} Returns true if all conditions are met. Returns false otherwise.
   */
  I18n.prototype.hasIntlPluralRulesSupport = function () {
    return Boolean(window.Intl && ('PluralRules' in window.Intl && Intl.PluralRules.supportedLocalesOf(this.locale).length))
  };

  /**
   * Check to see if the browser supports Intl and Intl.NumberFormat.
   *
   * It requires all conditions to be met in order to be supported:
   * - The browser supports the Intl class (true in IE11)
   * - The implementation of Intl supports NumberFormat (also true in IE11)
   * - The browser/OS has number formatting rules for the current locale (browser dependent)
   *
   * @returns {boolean} Returns true if all conditions are met. Returns false otherwise.
   */
  I18n.prototype.hasIntlNumberFormatSupport = function () {
    return Boolean(window.Intl && ('NumberFormat' in window.Intl && Intl.NumberFormat.supportedLocalesOf(this.locale).length))
  };

  /**
   * Get the appropriate suffix for the plural form.
   *
   * Uses Intl.PluralRules (or our own fallback implementation) to get the
   * 'preferred' form to use for the given count.
   *
   * Checks that a translation has been provided for that plural form – if it
   * hasn't, it'll fall back to the 'other' plural form (unless that doesn't exist
   * either, in which case an error will be thrown)
   *
   * @param {string} lookupKey - The lookup key of the string to use.
   * @param {number} count - Number used to determine which pluralisation to use.
   * @returns {PluralRule} The suffix associated with the correct pluralisation for this locale.
   * @throws {Error} Plural form `.other` required when preferred plural form is missing
   */
  I18n.prototype.getPluralSuffix = function (lookupKey, count) {
    // Validate that the number is actually a number.
    //
    // Number(count) will turn anything that can't be converted to a Number type
    // into 'NaN'. isFinite filters out NaN, as it isn't a finite number.
    count = Number(count);
    if (!isFinite(count)) { return 'other' }

    var preferredForm;

    // Check to verify that all the requirements for Intl.PluralRules are met.
    // If so, we can use that instead of our custom implementation. Otherwise,
    // use the hardcoded fallback.
    if (this.hasIntlPluralRulesSupport()) {
      preferredForm = new Intl.PluralRules(this.locale).select(count);
    } else {
      preferredForm = this.selectPluralFormUsingFallbackRules(count);
    }

    // Use the correct plural form if provided
    if (lookupKey + '.' + preferredForm in this.translations) {
      return preferredForm
    // Fall back to `other` if the plural form is missing, but log a warning
    // to the console
    } else if (lookupKey + '.other' in this.translations) {
      if (console && 'warn' in console) {
        console.warn('i18n: Missing plural form ".' + preferredForm + '" for "' +
          this.locale + '" locale. Falling back to ".other".');
      }

      return 'other'
    // If the required `other` plural form is missing, all we can do is error
    } else {
      throw new Error(
        'i18n: Plural form ".other" is required for "' + this.locale + '" locale'
      )
    }
  };

  /**
   * Get the plural form using our fallback implementation
   *
   * This is split out into a separate function to make it easier to test the
   * fallback behaviour in an environment where Intl.PluralRules exists.
   *
   * @param {number} count - Number used to determine which pluralisation to use.
   * @returns {PluralRule} The pluralisation form for count in this locale.
   */
  I18n.prototype.selectPluralFormUsingFallbackRules = function (count) {
    // Currently our custom code can only handle positive integers, so let's
    // make sure our number is one of those.
    count = Math.abs(Math.floor(count));

    var ruleset = this.getPluralRulesForLocale();

    if (ruleset) {
      return I18n.pluralRules[ruleset](count)
    }

    return 'other'
  };

  /**
   * Work out which pluralisation rules to use for the current locale
   *
   * The locale may include a regional indicator (such as en-GB), but we don't
   * usually care about this part, as pluralisation rules are usually the same
   * regardless of region. There are exceptions, however, (e.g. Portuguese) so
   * this searches by both the full and shortened locale codes, just to be sure.
   *
   * @returns {string | undefined} The name of the pluralisation rule to use (a key for one
   *   of the functions in this.pluralRules)
   */
  I18n.prototype.getPluralRulesForLocale = function () {
    var locale = this.locale;
    var localeShort = locale.split('-')[0];

    // Look through the plural rules map to find which `pluralRule` is
    // appropriate for our current `locale`.
    for (var pluralRule in I18n.pluralRulesMap) {
      if (Object.prototype.hasOwnProperty.call(I18n.pluralRulesMap, pluralRule)) {
        var languages = I18n.pluralRulesMap[pluralRule];
        for (var i = 0; i < languages.length; i++) {
          if (languages[i] === locale || languages[i] === localeShort) {
            return pluralRule
          }
        }
      }
    }
  };

  /**
   * Map of plural rules to languages where those rules apply.
   *
   * Note: These groups are named for the most dominant or recognisable language
   * that uses each system. The groupings do not imply that the languages are
   * related to one another. Many languages have evolved the same systems
   * independently of one another.
   *
   * Code to support more languages can be found in the i18n spike:
   * {@link https://github.com/alphagov/govuk-frontend/blob/spike-i18n-support/src/govuk/i18n.mjs}
   *
   * Languages currently supported:
   *
   * Arabic: Arabic (ar)
   * Chinese: Burmese (my), Chinese (zh), Indonesian (id), Japanese (ja),
   *   Javanese (jv), Korean (ko), Malay (ms), Thai (th), Vietnamese (vi)
   * French: Armenian (hy), Bangla (bn), French (fr), Gujarati (gu), Hindi (hi),
   *   Persian Farsi (fa), Punjabi (pa), Zulu (zu)
   * German: Afrikaans (af), Albanian (sq), Azerbaijani (az), Basque (eu),
   *   Bulgarian (bg), Catalan (ca), Danish (da), Dutch (nl), English (en),
   *   Estonian (et), Finnish (fi), Georgian (ka), German (de), Greek (el),
   *   Hungarian (hu), Luxembourgish (lb), Norwegian (no), Somali (so),
   *   Swahili (sw), Swedish (sv), Tamil (ta), Telugu (te), Turkish (tr),
   *   Urdu (ur)
   * Irish: Irish Gaelic (ga)
   * Russian: Russian (ru), Ukrainian (uk)
   * Scottish: Scottish Gaelic (gd)
   * Spanish: European Portuguese (pt-PT), Italian (it), Spanish (es)
   * Welsh: Welsh (cy)
   *
   * @type {{ [key: string]: string[] }}
   */
  I18n.pluralRulesMap = {
    arabic: ['ar'],
    chinese: ['my', 'zh', 'id', 'ja', 'jv', 'ko', 'ms', 'th', 'vi'],
    french: ['hy', 'bn', 'fr', 'gu', 'hi', 'fa', 'pa', 'zu'],
    german: [
      'af', 'sq', 'az', 'eu', 'bg', 'ca', 'da', 'nl', 'en', 'et', 'fi', 'ka',
      'de', 'el', 'hu', 'lb', 'no', 'so', 'sw', 'sv', 'ta', 'te', 'tr', 'ur'
    ],
    irish: ['ga'],
    russian: ['ru', 'uk'],
    scottish: ['gd'],
    spanish: ['pt-PT', 'it', 'es'],
    welsh: ['cy']
  };

  /**
   * Different pluralisation rule sets
   *
   * Returns the appropriate suffix for the plural form associated with `n`.
   * Possible suffixes: 'zero', 'one', 'two', 'few', 'many', 'other' (the actual
   * meaning of each differs per locale). 'other' should always exist, even in
   * languages without plurals, such as Chinese.
   * {@link https://cldr.unicode.org/index/cldr-spec/plural-rules}
   *
   * The count must be a positive integer. Negative numbers and decimals aren't accounted for
   *
   * @type {{ [key: string]: (count: number) => PluralRule }}
   */
  I18n.pluralRules = {
    /* eslint-disable jsdoc/require-jsdoc */
    arabic: function (n) {
      if (n === 0) { return 'zero' }
      if (n === 1) { return 'one' }
      if (n === 2) { return 'two' }
      if (n % 100 >= 3 && n % 100 <= 10) { return 'few' }
      if (n % 100 >= 11 && n % 100 <= 99) { return 'many' }
      return 'other'
    },
    chinese: function () {
      return 'other'
    },
    french: function (n) {
      return n === 0 || n === 1 ? 'one' : 'other'
    },
    german: function (n) {
      return n === 1 ? 'one' : 'other'
    },
    irish: function (n) {
      if (n === 1) { return 'one' }
      if (n === 2) { return 'two' }
      if (n >= 3 && n <= 6) { return 'few' }
      if (n >= 7 && n <= 10) { return 'many' }
      return 'other'
    },
    russian: function (n) {
      var lastTwo = n % 100;
      var last = lastTwo % 10;
      if (last === 1 && lastTwo !== 11) { return 'one' }
      if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) { return 'few' }
      if (last === 0 || (last >= 5 && last <= 9) || (lastTwo >= 11 && lastTwo <= 14)) { return 'many' }
      // Note: The 'other' suffix is only used by decimal numbers in Russian.
      // We don't anticipate it being used, but it's here for consistency.
      return 'other'
    },
    scottish: function (n) {
      if (n === 1 || n === 11) { return 'one' }
      if (n === 2 || n === 12) { return 'two' }
      if ((n >= 3 && n <= 10) || (n >= 13 && n <= 19)) { return 'few' }
      return 'other'
    },
    spanish: function (n) {
      if (n === 1) { return 'one' }
      if (n % 1000000 === 0 && n !== 0) { return 'many' }
      return 'other'
    },
    welsh: function (n) {
      if (n === 0) { return 'zero' }
      if (n === 1) { return 'one' }
      if (n === 2) { return 'two' }
      if (n === 3) { return 'few' }
      if (n === 6) { return 'many' }
      return 'other'
    }
    /* eslint-enable jsdoc/require-jsdoc */
  };

  /**
   * Plural rule category mnemonic tags
   *
   * @typedef {'zero' | 'one' | 'two' | 'few' | 'many' | 'other'} PluralRule
   */

  /**
   * Translated message by plural rule they correspond to.
   *
   * Allows to group pluralised messages under a single key when passing
   * translations to a component's constructor
   *
   * @typedef {object} TranslationPluralForms
   * @property {string} [other] - General plural form
   * @property {string} [zero] - Plural form used with 0
   * @property {string} [one] - Plural form used with 1
   * @property {string} [two] - Plural form used with 2
   * @property {string} [few] - Plural form used for a few
   * @property {string} [many] - Plural form used for many
   */

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

  (function (undefined) {

    // Detection from https://raw.githubusercontent.com/Financial-Times/polyfill-service/1f3c09b402f65bf6e393f933a15ba63f1b86ef1f/packages/polyfill-library/polyfills/Element/prototype/matches/detect.js
    var detect = (
      'document' in this && "matches" in document.documentElement
    );

    if (detect) return

    // Polyfill from https://raw.githubusercontent.com/Financial-Times/polyfill-service/1f3c09b402f65bf6e393f933a15ba63f1b86ef1f/packages/polyfill-library/polyfills/Element/prototype/matches/polyfill.js
    // @ts-expect-error Ignore unknown browser prefixed properties
    Element.prototype.matches = Element.prototype.webkitMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.mozMatchesSelector || function matches(selector) {
      var element = this;
      var elements = (element.document || element.ownerDocument).querySelectorAll(selector);
      var index = 0;

      while (elements[index] && elements[index] !== element) {
        ++index;
      }

      return !!elements[index];
    };

  }).call('object' === typeof window && window || 'object' === typeof self && self || 'object' === typeof global && global || {});

  (function(undefined) {

    // Detection from https://raw.githubusercontent.com/Financial-Times/polyfill-service/1f3c09b402f65bf6e393f933a15ba63f1b86ef1f/packages/polyfill-library/polyfills/Element/prototype/closest/detect.js
    var detect = (
      'document' in this && "closest" in document.documentElement
    );

    if (detect) return

    // Polyfill from https://raw.githubusercontent.com/Financial-Times/polyfill-service/1f3c09b402f65bf6e393f933a15ba63f1b86ef1f/packages/polyfill-library/polyfills/Element/prototype/closest/polyfill.js
    Element.prototype.closest = function closest(selector) {
      var node = this;

      while (node) {
        if (node.matches(selector)) return node;
        // @ts-expect-error Ignore mismatch between Element and ParentNode types
        else node = 'SVGElement' in window && node instanceof SVGElement ? node.parentNode : node.parentElement;
      }

      return null;
    };

  }).call('object' === typeof window && window || 'object' === typeof self && self || 'object' === typeof global && global || {});

  /**
   * Accordion translation defaults
   *
   * @see {@link AccordionConfig.i18n}
   * @constant
   * @default
   * @type {AccordionTranslations}
   */
  var ACCORDION_TRANSLATIONS = {
    hideAllSections: 'Hide all sections',
    hideSection: 'Hide',
    hideSectionAriaLabel: 'Hide this section',
    showAllSections: 'Show all sections',
    showSection: 'Show',
    showSectionAriaLabel: 'Show this section'
  };

  /**
   * Accordion component
   *
   * This allows a collection of sections to be collapsed by default, showing only
   * their headers. Sections can be expanded or collapsed individually by clicking
   * their headers. A "Show all sections" button is also added to the top of the
   * accordion, which switches to "Hide all sections" when all the sections are
   * expanded.
   *
   * The state of each section is saved to the DOM via the `aria-expanded`
   * attribute, which also provides accessibility.
   *
   * @class
   * @param {Element} $module - HTML element to use for accordion
   * @param {AccordionConfig} [config] - Accordion config
   */
  function Accordion ($module, config) {
    if (!($module instanceof HTMLElement)) {
      return this
    }

    /** @deprecated Will be made private in v5.0 */
    this.$module = $module;

    /** @type {AccordionConfig} */
    var defaultConfig = {
      i18n: ACCORDION_TRANSLATIONS,
      rememberExpanded: true
    };

    /**
     * @deprecated Will be made private in v5.0
     * @type {AccordionConfig}
     */
    this.config = mergeConfigs(
      defaultConfig,
      config || {},
      normaliseDataset($module.dataset)
    );

    /** @deprecated Will be made private in v5.0 */
    this.i18n = new I18n(extractConfigByNamespace(this.config, 'i18n'));

    /** @deprecated Will be made private in v5.0 */
    this.controlsClass = 'govuk-accordion__controls';

    /** @deprecated Will be made private in v5.0 */
    this.showAllClass = 'govuk-accordion__show-all';

    /** @deprecated Will be made private in v5.0 */
    this.showAllTextClass = 'govuk-accordion__show-all-text';

    /** @deprecated Will be made private in v5.0 */
    this.sectionClass = 'govuk-accordion__section';

    /** @deprecated Will be made private in v5.0 */
    this.sectionExpandedClass = 'govuk-accordion__section--expanded';

    /** @deprecated Will be made private in v5.0 */
    this.sectionButtonClass = 'govuk-accordion__section-button';

    /** @deprecated Will be made private in v5.0 */
    this.sectionHeaderClass = 'govuk-accordion__section-header';

    /** @deprecated Will be made private in v5.0 */
    this.sectionHeadingClass = 'govuk-accordion__section-heading';

    /** @deprecated Will be made private in v5.0 */
    this.sectionHeadingDividerClass = 'govuk-accordion__section-heading-divider';

    /** @deprecated Will be made private in v5.0 */
    this.sectionHeadingTextClass = 'govuk-accordion__section-heading-text';

    /** @deprecated Will be made private in v5.0 */
    this.sectionHeadingTextFocusClass = 'govuk-accordion__section-heading-text-focus';

    /** @deprecated Will be made private in v5.0 */
    this.sectionShowHideToggleClass = 'govuk-accordion__section-toggle';

    /** @deprecated Will be made private in v5.0 */
    this.sectionShowHideToggleFocusClass = 'govuk-accordion__section-toggle-focus';

    /** @deprecated Will be made private in v5.0 */
    this.sectionShowHideTextClass = 'govuk-accordion__section-toggle-text';

    /** @deprecated Will be made private in v5.0 */
    this.upChevronIconClass = 'govuk-accordion-nav__chevron';

    /** @deprecated Will be made private in v5.0 */
    this.downChevronIconClass = 'govuk-accordion-nav__chevron--down';

    /** @deprecated Will be made private in v5.0 */
    this.sectionSummaryClass = 'govuk-accordion__section-summary';

    /** @deprecated Will be made private in v5.0 */
    this.sectionSummaryFocusClass = 'govuk-accordion__section-summary-focus';

    /** @deprecated Will be made private in v5.0 */
    this.sectionContentClass = 'govuk-accordion__section-content';

    var $sections = this.$module.querySelectorAll('.' + this.sectionClass);
    if (!$sections.length) {
      return this
    }

    /** @deprecated Will be made private in v5.0 */
    this.$sections = $sections;

    /** @deprecated Will be made private in v5.0 */
    this.browserSupportsSessionStorage = helper.checkForSessionStorage();

    /** @deprecated Will be made private in v5.0 */
    this.$showAllButton = null;

    /** @deprecated Will be made private in v5.0 */
    this.$showAllIcon = null;

    /** @deprecated Will be made private in v5.0 */
    this.$showAllText = null;
  }

  /**
   * Initialise component
   */
  Accordion.prototype.init = function () {
    // Check that required elements are present
    if (!this.$module || !this.$sections) {
      return
    }

    this.initControls();
    this.initSectionHeaders();

    // See if "Show all sections" button text should be updated
    var areAllSectionsOpen = this.checkIfAllSectionsOpen();
    this.updateShowAllButton(areAllSectionsOpen);
  };

  /**
   * Initialise controls and set attributes
   *
   * @deprecated Will be made private in v5.0
   */
  Accordion.prototype.initControls = function () {
    // Create "Show all" button and set attributes
    this.$showAllButton = document.createElement('button');
    this.$showAllButton.setAttribute('type', 'button');
    this.$showAllButton.setAttribute('class', this.showAllClass);
    this.$showAllButton.setAttribute('aria-expanded', 'false');

    // Create icon, add to element
    this.$showAllIcon = document.createElement('span');
    this.$showAllIcon.classList.add(this.upChevronIconClass);
    this.$showAllButton.appendChild(this.$showAllIcon);

    // Create control wrapper and add controls to it
    var $accordionControls = document.createElement('div');
    $accordionControls.setAttribute('class', this.controlsClass);
    $accordionControls.appendChild(this.$showAllButton);
    this.$module.insertBefore($accordionControls, this.$module.firstChild);

    // Build additional wrapper for Show all toggle text and place after icon
    this.$showAllText = document.createElement('span');
    this.$showAllText.classList.add(this.showAllTextClass);
    this.$showAllButton.appendChild(this.$showAllText);

    // Handle click events on the show/hide all button
    this.$showAllButton.addEventListener('click', this.onShowOrHideAllToggle.bind(this));

    // Handle 'beforematch' events, if the user agent supports them
    if ('onbeforematch' in document) {
      document.addEventListener('beforematch', this.onBeforeMatch.bind(this));
    }
  };

  /**
   * Initialise section headers
   *
   * @deprecated Will be made private in v5.0
   */
  Accordion.prototype.initSectionHeaders = function () {
    var $component = this;
    var $sections = this.$sections;

    // Loop through sections
    $sections.forEach(function ($section, i) {
      var $header = $section.querySelector('.' + $component.sectionHeaderClass);
      if (!$header) {
        return
      }

      // Set header attributes
      $component.constructHeaderMarkup($header, i);
      $component.setExpanded($component.isExpanded($section), $section);

      // Handle events
      $header.addEventListener('click', $component.onSectionToggle.bind($component, $section));

      // See if there is any state stored in sessionStorage and set the sections to
      // open or closed.
      $component.setInitialState($section);
    });
  };

  /**
   * Construct section header
   *
   * @deprecated Will be made private in v5.0
   * @param {Element} $header - Section header
   * @param {number} index - Section index
   */
  Accordion.prototype.constructHeaderMarkup = function ($header, index) {
    var $span = $header.querySelector('.' + this.sectionButtonClass);
    var $heading = $header.querySelector('.' + this.sectionHeadingClass);
    var $summary = $header.querySelector('.' + this.sectionSummaryClass);

    if (!$span || !$heading) {
      return
    }

    // Create a button element that will replace the '.govuk-accordion__section-button' span
    var $button = document.createElement('button');
    $button.setAttribute('type', 'button');
    $button.setAttribute('aria-controls', this.$module.id + '-content-' + (index + 1).toString());

    // Copy all attributes (https://developer.mozilla.org/en-US/docs/Web/API/Element/attributes) from $span to $button
    for (var i = 0; i < $span.attributes.length; i++) {
      var attr = $span.attributes.item(i);
      // Add all attributes but not ID as this is being added to
      // the section heading ($headingText)
      if (attr.nodeName !== 'id') {
        $button.setAttribute(attr.nodeName, attr.nodeValue);
      }
    }

    // Create container for heading text so it can be styled
    var $headingText = document.createElement('span');
    $headingText.classList.add(this.sectionHeadingTextClass);
    // Copy the span ID to the heading text to allow it to be referenced by `aria-labelledby` on the
    // hidden content area without "Show this section"
    $headingText.id = $span.id;

    // Create an inner heading text container to limit the width of the focus state
    var $headingTextFocus = document.createElement('span');
    $headingTextFocus.classList.add(this.sectionHeadingTextFocusClass);
    $headingText.appendChild($headingTextFocus);
    // span could contain HTML elements (see https://www.w3.org/TR/2011/WD-html5-20110525/content-models.html#phrasing-content)
    $headingTextFocus.innerHTML = $span.innerHTML;

    // Create container for show / hide icons and text.
    var $showHideToggle = document.createElement('span');
    $showHideToggle.classList.add(this.sectionShowHideToggleClass);
    // Tell Google not to index the 'show' text as part of the heading
    // For the snippet to work with JavaScript, it must be added before adding the page element to the
    // page's DOM. See https://developers.google.com/search/docs/advanced/robots/robots_meta_tag#data-nosnippet-attr
    $showHideToggle.setAttribute('data-nosnippet', '');
    // Create an inner container to limit the width of the focus state
    var $showHideToggleFocus = document.createElement('span');
    $showHideToggleFocus.classList.add(this.sectionShowHideToggleFocusClass);
    $showHideToggle.appendChild($showHideToggleFocus);
    // Create wrapper for the show / hide text. Append text after the show/hide icon
    var $showHideText = document.createElement('span');
    var $showHideIcon = document.createElement('span');
    $showHideIcon.classList.add(this.upChevronIconClass);
    $showHideToggleFocus.appendChild($showHideIcon);
    $showHideText.classList.add(this.sectionShowHideTextClass);
    $showHideToggleFocus.appendChild($showHideText);

    // Append elements to the button:
    // 1. Heading text
    // 2. Punctuation
    // 3. (Optional: Summary line followed by punctuation)
    // 4. Show / hide toggle
    $button.appendChild($headingText);
    $button.appendChild(this.getButtonPunctuationEl());

    // If summary content exists add to DOM in correct order
    if ($summary) {
      // Create a new `span` element and copy the summary line content from the original `div` to the
      // new `span`
      // This is because the summary line text is now inside a button element, which can only contain
      // phrasing content
      var $summarySpan = document.createElement('span');
      // Create an inner summary container to limit the width of the summary focus state
      var $summarySpanFocus = document.createElement('span');
      $summarySpanFocus.classList.add(this.sectionSummaryFocusClass);
      $summarySpan.appendChild($summarySpanFocus);

      // Get original attributes, and pass them to the replacement
      for (var j = 0, l = $summary.attributes.length; j < l; ++j) {
        var nodeName = $summary.attributes.item(j).nodeName;
        var nodeValue = $summary.attributes.item(j).nodeValue;
        $summarySpan.setAttribute(nodeName, nodeValue);
      }

      // Copy original contents of summary to the new summary span
      $summarySpanFocus.innerHTML = $summary.innerHTML;

      // Replace the original summary `div` with the new summary `span`
      $summary.parentNode.replaceChild($summarySpan, $summary);

      $button.appendChild($summarySpan);
      $button.appendChild(this.getButtonPunctuationEl());
    }

    $button.appendChild($showHideToggle);

    $heading.removeChild($span);
    $heading.appendChild($button);
  };

  /**
   * When a section is opened by the user agent via the 'beforematch' event
   *
   * @deprecated Will be made private in v5.0
   * @param {Event} event - Generic event
   */
  Accordion.prototype.onBeforeMatch = function (event) {
    var $fragment = event.target;

    // Handle elements with `.closest()` support only
    if (!($fragment instanceof Element)) {
      return
    }

    // Handle when fragment is inside section
    var $section = $fragment.closest('.' + this.sectionClass);
    if ($section) {
      this.setExpanded(true, $section);
    }
  };

  /**
   * When section toggled, set and store state
   *
   * @deprecated Will be made private in v5.0
   * @param {Element} $section - Section element
   */
  Accordion.prototype.onSectionToggle = function ($section) {
    var expanded = this.isExpanded($section);
    this.setExpanded(!expanded, $section);

    // Store the state in sessionStorage when a change is triggered
    this.storeState($section);
  };

  /**
   * When Open/Close All toggled, set and store state
   *
   * @deprecated Will be made private in v5.0
   */
  Accordion.prototype.onShowOrHideAllToggle = function () {
    var $component = this;
    var $sections = this.$sections;

    var nowExpanded = !this.checkIfAllSectionsOpen();

    // Loop through sections
    $sections.forEach(function ($section) {
      $component.setExpanded(nowExpanded, $section);
      // Store the state in sessionStorage when a change is triggered
      $component.storeState($section);
    });

    $component.updateShowAllButton(nowExpanded);
  };

  /**
   * Set section attributes when opened/closed
   *
   * @deprecated Will be made private in v5.0
   * @param {boolean} expanded - Section expanded
   * @param {Element} $section - Section element
   */
  Accordion.prototype.setExpanded = function (expanded, $section) {
    var $showHideIcon = $section.querySelector('.' + this.upChevronIconClass);
    var $showHideText = $section.querySelector('.' + this.sectionShowHideTextClass);
    var $button = $section.querySelector('.' + this.sectionButtonClass);
    var $content = $section.querySelector('.' + this.sectionContentClass);

    if (!$showHideIcon ||
      !($showHideText instanceof HTMLElement) ||
      !$button ||
      !$content) {
      return
    }

    var newButtonText = expanded
      ? this.i18n.t('hideSection')
      : this.i18n.t('showSection');

    $showHideText.innerText = newButtonText;
    $button.setAttribute('aria-expanded', expanded.toString());

    // Update aria-label combining
    var ariaLabelParts = [];

    var $headingText = $section.querySelector('.' + this.sectionHeadingTextClass);
    if ($headingText instanceof HTMLElement) {
      ariaLabelParts.push($headingText.innerText.trim());
    }

    var $summary = $section.querySelector('.' + this.sectionSummaryClass);
    if ($summary instanceof HTMLElement) {
      ariaLabelParts.push($summary.innerText.trim());
    }

    var ariaLabelMessage = expanded
      ? this.i18n.t('hideSectionAriaLabel')
      : this.i18n.t('showSectionAriaLabel');
    ariaLabelParts.push(ariaLabelMessage);

    /*
     * Join with a comma to add pause for assistive technology.
     * Example: [heading]Section A ,[pause] Show this section.
     * https://accessibility.blog.gov.uk/2017/12/18/what-working-on-gov-uk-navigation-taught-us-about-accessibility/
     */
    $button.setAttribute('aria-label', ariaLabelParts.join(' , '));

    // Swap icon, change class
    if (expanded) {
      $content.removeAttribute('hidden');
      $section.classList.add(this.sectionExpandedClass);
      $showHideIcon.classList.remove(this.downChevronIconClass);
    } else {
      $content.setAttribute('hidden', 'until-found');
      $section.classList.remove(this.sectionExpandedClass);
      $showHideIcon.classList.add(this.downChevronIconClass);
    }

    // See if "Show all sections" button text should be updated
    var areAllSectionsOpen = this.checkIfAllSectionsOpen();
    this.updateShowAllButton(areAllSectionsOpen);
  };

  /**
   * Get state of section
   *
   * @deprecated Will be made private in v5.0
   * @param {Element} $section - Section element
   * @returns {boolean} True if expanded
   */
  Accordion.prototype.isExpanded = function ($section) {
    return $section.classList.contains(this.sectionExpandedClass)
  };

  /**
   * Check if all sections are open
   *
   * @deprecated Will be made private in v5.0
   * @returns {boolean} True if all sections are open
   */
  Accordion.prototype.checkIfAllSectionsOpen = function () {
    // Get a count of all the Accordion sections
    var sectionsCount = this.$sections.length;
    // Get a count of all Accordion sections that are expanded
    var expandedSectionCount = this.$module.querySelectorAll('.' + this.sectionExpandedClass).length;
    var areAllSectionsOpen = sectionsCount === expandedSectionCount;

    return areAllSectionsOpen
  };

  /**
   * Update "Show all sections" button
   *
   * @deprecated Will be made private in v5.0
   * @param {boolean} expanded - Section expanded
   */
  Accordion.prototype.updateShowAllButton = function (expanded) {
    var newButtonText = expanded
      ? this.i18n.t('hideAllSections')
      : this.i18n.t('showAllSections');

    this.$showAllButton.setAttribute('aria-expanded', expanded.toString());
    this.$showAllText.innerText = newButtonText;

    // Swap icon, toggle class
    if (expanded) {
      this.$showAllIcon.classList.remove(this.downChevronIconClass);
    } else {
      this.$showAllIcon.classList.add(this.downChevronIconClass);
    }
  };

  var helper = {
    /**
     * Check for `window.sessionStorage`, and that it actually works.
     *
     * @returns {boolean} True if session storage is available
     */
    checkForSessionStorage: function () {
      var testString = 'this is the test string';
      var result;
      try {
        window.sessionStorage.setItem(testString, testString);
        result = window.sessionStorage.getItem(testString) === testString.toString();
        window.sessionStorage.removeItem(testString);
        return result
      } catch (exception) {
        return false
      }
    }
  };

  /**
   * Set the state of the accordions in sessionStorage
   *
   * @deprecated Will be made private in v5.0
   * @param {Element} $section - Section element
   */
  Accordion.prototype.storeState = function ($section) {
    if (this.browserSupportsSessionStorage && this.config.rememberExpanded) {
      // We need a unique way of identifying each content in the Accordion. Since
      // an `#id` should be unique and an `id` is required for `aria-` attributes
      // `id` can be safely used.
      var $button = $section.querySelector('.' + this.sectionButtonClass);

      if ($button) {
        var contentId = $button.getAttribute('aria-controls');
        var contentState = $button.getAttribute('aria-expanded');

        // Only set the state when both `contentId` and `contentState` are taken from the DOM.
        if (contentId && contentState) {
          window.sessionStorage.setItem(contentId, contentState);
        }
      }
    }
  };

  /**
   * Read the state of the accordions from sessionStorage
   *
   * @deprecated Will be made private in v5.0
   * @param {Element} $section - Section element
   */
  Accordion.prototype.setInitialState = function ($section) {
    if (this.browserSupportsSessionStorage && this.config.rememberExpanded) {
      var $button = $section.querySelector('.' + this.sectionButtonClass);

      if ($button) {
        var contentId = $button.getAttribute('aria-controls');
        var contentState = contentId ? window.sessionStorage.getItem(contentId) : null;

        if (contentState !== null) {
          this.setExpanded(contentState === 'true', $section);
        }
      }
    }
  };

  /**
   * Create an element to improve semantics of the section button with punctuation
   *
   * Adding punctuation to the button can also improve its general semantics by dividing its contents
   * into thematic chunks.
   * See https://github.com/alphagov/govuk-frontend/issues/2327#issuecomment-922957442
   *
   * @deprecated Will be made private in v5.0
   * @returns {Element} DOM element
   */
  Accordion.prototype.getButtonPunctuationEl = function () {
    var $punctuationEl = document.createElement('span');
    $punctuationEl.classList.add('govuk-visually-hidden', this.sectionHeadingDividerClass);
    $punctuationEl.innerHTML = ', ';
    return $punctuationEl
  };

  /**
   * Accordion config
   *
   * @typedef {object} AccordionConfig
   * @property {AccordionTranslations} [i18n=ACCORDION_TRANSLATIONS] - Accordion translations
   * @property {boolean} [rememberExpanded] - Whether the expanded and collapsed
   *   state of each section is remembered and restored when navigating.
   */

  /**
   * Accordion translations
   *
   * @see {@link ACCORDION_TRANSLATIONS}
   * @typedef {object} AccordionTranslations
   *
   * Messages used by the component for the labels of its buttons. This includes
   * the visible text shown on screen, and text to help assistive technology users
   * for the buttons toggling each section.
   * @property {string} [hideAllSections] - The text content for the 'Hide all
   *   sections' button, used when at least one section is expanded.
   * @property {string} [hideSection] - The text content for the 'Hide'
   *   button, used when a section is expanded.
   * @property {string} [hideSectionAriaLabel] - The text content appended to the
   *   'Hide' button's accessible name when a section is expanded.
   * @property {string} [showAllSections] - The text content for the 'Show all
   *   sections' button, used when all sections are collapsed.
   * @property {string} [showSection] - The text content for the 'Show'
   *   button, used when a section is collapsed.
   * @property {string} [showSectionAriaLabel] - The text content appended to the
   *   'Show' button's accessible name when a section is expanded.
   */

  var KEY_SPACE = 32;
  var DEBOUNCE_TIMEOUT_IN_SECONDS = 1;

  /**
   * JavaScript enhancements for the Button component
   *
   * @class
   * @param {Element} $module - HTML element to use for button
   * @param {ButtonConfig} [config] - Button config
   */
  function Button ($module, config) {
    if (!($module instanceof HTMLElement)) {
      return this
    }

    /** @deprecated Will be made private in v5.0 */
    this.$module = $module;

    /** @deprecated Will be made private in v5.0 */
    this.debounceFormSubmitTimer = null;

    /** @type {ButtonConfig} */
    var defaultConfig = {
      preventDoubleClick: false
    };

    /**
     * @deprecated Will be made private in v5.0
     * @type {ButtonConfig}
     */
    this.config = mergeConfigs(
      defaultConfig,
      config || {},
      normaliseDataset($module.dataset)
    );
  }

  /**
   * Initialise component
   */
  Button.prototype.init = function () {
    // Check that required elements are present
    if (!this.$module) {
      return
    }

    this.$module.addEventListener('keydown', this.handleKeyDown);
    this.$module.addEventListener('click', this.debounce.bind(this));
  };

  /**
   * Trigger a click event when the space key is pressed
   *
   * Some screen readers tell users they can activate things with the 'button'
   * role, so we need to match the functionality of native HTML buttons
   *
   * See https://github.com/alphagov/govuk_elements/pull/272#issuecomment-233028270
   *
   * @deprecated Will be made private in v5.0
   * @param {KeyboardEvent} event - Keydown event
   */
  Button.prototype.handleKeyDown = function (event) {
    var $target = event.target;

    // Handle space bar only
    if (event.keyCode !== KEY_SPACE) {
      return
    }

    // Handle elements with [role="button"] only
    if ($target instanceof HTMLElement && $target.getAttribute('role') === 'button') {
      event.preventDefault(); // prevent the page from scrolling
      $target.click();
    }
  };

  /**
   * Debounce double-clicks
   *
   * If the click quickly succeeds a previous click then nothing will happen. This
   * stops people accidentally causing multiple form submissions by double
   * clicking buttons.
   *
   * @deprecated Will be made private in v5.0
   * @param {MouseEvent} event - Mouse click event
   * @returns {undefined | false} Returns undefined, or false when debounced
   */
  Button.prototype.debounce = function (event) {
    // Check the button that was clicked has preventDoubleClick enabled
    if (!this.config.preventDoubleClick) {
      return
    }

    // If the timer is still running, prevent the click from submitting the form
    if (this.debounceFormSubmitTimer) {
      event.preventDefault();
      return false
    }

    this.debounceFormSubmitTimer = setTimeout(/** @this {Button} */ function () {
      this.debounceFormSubmitTimer = null;
    }.bind(this), DEBOUNCE_TIMEOUT_IN_SECONDS * 1000);
  };

  /**
   * Button config
   *
   * @typedef {object} ButtonConfig
   * @property {boolean} [preventDoubleClick=false] - Prevent accidental double
   *   clicks on submit buttons from submitting forms multiple times.
   */

  /**
   * Returns the value of the given attribute closest to the given element (including itself)
   *
   * @deprecated Will be made private in v5.0
   * @param {Element} $element - The element to start walking the DOM tree up
   * @param {string} attributeName - The name of the attribute
   * @returns {string | null} Attribute value
   */
  function closestAttributeValue ($element, attributeName) {
    var $closestElementWithAttribute = $element.closest('[' + attributeName + ']');
    return $closestElementWithAttribute
      ? $closestElementWithAttribute.getAttribute(attributeName)
      : null
  }

  /**
   * Character count translation defaults
   *
   * @see {@link CharacterCountConfig.i18n}
   * @constant
   * @default
   * @type {CharacterCountTranslations}
   */
  var CHARACTER_COUNT_TRANSLATIONS = {
    // Characters
    charactersUnderLimit: {
      one: 'You have %{count} character remaining',
      other: 'You have %{count} characters remaining'
    },
    charactersAtLimit: 'You have 0 characters remaining',
    charactersOverLimit: {
      one: 'You have %{count} character too many',
      other: 'You have %{count} characters too many'
    },
    // Words
    wordsUnderLimit: {
      one: 'You have %{count} word remaining',
      other: 'You have %{count} words remaining'
    },
    wordsAtLimit: 'You have 0 words remaining',
    wordsOverLimit: {
      one: 'You have %{count} word too many',
      other: 'You have %{count} words too many'
    },
    textareaDescription: {
      other: ''
    }
  };

  /**
   * JavaScript enhancements for the CharacterCount component
   *
   * Tracks the number of characters or words in the `.govuk-js-character-count`
   * `<textarea>` inside the element. Displays a message with the remaining number
   * of characters/words available, or the number of characters/words in excess.
   *
   * You can configure the message to only appear after a certain percentage
   * of the available characters/words has been entered.
   *
   * @class
   * @param {Element} $module - HTML element to use for character count
   * @param {CharacterCountConfig} [config] - Character count config
   */
  function CharacterCount ($module, config) {
    if (!($module instanceof HTMLElement)) {
      return this
    }

    var $textarea = $module.querySelector('.govuk-js-character-count');
    if (
      !(
        $textarea instanceof HTMLTextAreaElement ||
        $textarea instanceof HTMLInputElement
      )
    ) {
      return this
    }

    /** @type {CharacterCountConfig} */
    var defaultConfig = {
      threshold: 0,
      i18n: CHARACTER_COUNT_TRANSLATIONS
    };

    // Read config set using dataset ('data-' values)
    var datasetConfig = normaliseDataset($module.dataset);

    // To ensure data-attributes take complete precedence, even if they change the
    // type of count, we need to reset the `maxlength` and `maxwords` from the
    // JavaScript config.
    //
    // We can't mutate `config`, though, as it may be shared across multiple
    // components inside `initAll`.
    /** @type {CharacterCountConfig} */
    var configOverrides = {};
    if ('maxwords' in datasetConfig || 'maxlength' in datasetConfig) {
      configOverrides = {
        maxlength: undefined,
        maxwords: undefined
      };
    }

    /**
     * @deprecated Will be made private in v5.0
     * @type {CharacterCountConfig}
     */
    this.config = mergeConfigs(
      defaultConfig,
      config || {},
      configOverrides,
      datasetConfig
    );

    /** @deprecated Will be made private in v5.0 */
    this.i18n = new I18n(extractConfigByNamespace(this.config, 'i18n'), {
      // Read the fallback if necessary rather than have it set in the defaults
      locale: closestAttributeValue($module, 'lang')
    });

    /** @deprecated Will be made private in v5.0 */
    this.maxLength = Infinity;
    // Determine the limit attribute (characters or words)
    if ('maxwords' in this.config && this.config.maxwords) {
      this.maxLength = this.config.maxwords;
    } else if ('maxlength' in this.config && this.config.maxlength) {
      this.maxLength = this.config.maxlength;
    } else {
      return
    }

    /** @deprecated Will be made private in v5.0 */
    this.$module = $module;

    /** @deprecated Will be made private in v5.0 */
    this.$textarea = $textarea;

    /** @deprecated Will be made private in v5.0 */
    this.$visibleCountMessage = null;

    /** @deprecated Will be made private in v5.0 */
    this.$screenReaderCountMessage = null;

    /** @deprecated Will be made private in v5.0 */
    this.lastInputTimestamp = null;

    /** @deprecated Will be made private in v5.0 */
    this.lastInputValue = '';

    /** @deprecated Will be made private in v5.0 */
    this.valueChecker = null;
  }

  /**
   * Initialise component
   */
  CharacterCount.prototype.init = function () {
    // Check that required elements are present
    if (!this.$module || !this.$textarea) {
      return
    }

    var $textarea = this.$textarea;
    var $textareaDescription = document.getElementById($textarea.id + '-info');
    if (!$textareaDescription) {
      return
    }

    // Inject a description for the textarea if none is present already
    // for when the component was rendered with no maxlength, maxwords
    // nor custom textareaDescriptionText
    if ($textareaDescription.innerText.match(/^\s*$/)) {
      $textareaDescription.innerText = this.i18n.t('textareaDescription', { count: this.maxLength });
    }

    // Move the textarea description to be immediately after the textarea
    // Kept for backwards compatibility
    $textarea.insertAdjacentElement('afterend', $textareaDescription);

    // Create the *screen reader* specific live-updating counter
    // This doesn't need any styling classes, as it is never visible
    var $screenReaderCountMessage = document.createElement('div');
    $screenReaderCountMessage.className = 'govuk-character-count__sr-status govuk-visually-hidden';
    $screenReaderCountMessage.setAttribute('aria-live', 'polite');
    this.$screenReaderCountMessage = $screenReaderCountMessage;
    $textareaDescription.insertAdjacentElement('afterend', $screenReaderCountMessage);

    // Create our live-updating counter element, copying the classes from the
    // textarea description for backwards compatibility as these may have been
    // configured
    var $visibleCountMessage = document.createElement('div');
    $visibleCountMessage.className = $textareaDescription.className;
    $visibleCountMessage.classList.add('govuk-character-count__status');
    $visibleCountMessage.setAttribute('aria-hidden', 'true');
    this.$visibleCountMessage = $visibleCountMessage;
    $textareaDescription.insertAdjacentElement('afterend', $visibleCountMessage);

    // Hide the textarea description
    $textareaDescription.classList.add('govuk-visually-hidden');

    // Remove hard limit if set
    $textarea.removeAttribute('maxlength');

    this.bindChangeEvents();

    // When the page is restored after navigating 'back' in some browsers the
    // state of the character count is not restored until *after* the
    // DOMContentLoaded event is fired, so we need to manually update it after the
    // pageshow event in browsers that support it.
    window.addEventListener(
      'onpageshow' in window ? 'pageshow' : 'DOMContentLoaded',
      this.updateCountMessage.bind(this)
    );

    this.updateCountMessage();
  };

  /**
   * Bind change events
   *
   * Set up event listeners on the $textarea so that the count messages update
   * when the user types.
   *
   * @deprecated Will be made private in v5.0
   */
  CharacterCount.prototype.bindChangeEvents = function () {
    var $textarea = this.$textarea;
    $textarea.addEventListener('keyup', this.handleKeyUp.bind(this));

    // Bind focus/blur events to start/stop polling
    $textarea.addEventListener('focus', this.handleFocus.bind(this));
    $textarea.addEventListener('blur', this.handleBlur.bind(this));
  };

  /**
   * Handle key up event
   *
   * Update the visible character counter and keep track of when the last update
   * happened for each keypress
   *
   * @deprecated Will be made private in v5.0
   */
  CharacterCount.prototype.handleKeyUp = function () {
    this.updateVisibleCountMessage();
    this.lastInputTimestamp = Date.now();
  };

  /**
   * Handle focus event
   *
   * Speech recognition software such as Dragon NaturallySpeaking will modify the
   * fields by directly changing its `value`. These changes don't trigger events
   * in JavaScript, so we need to poll to handle when and if they occur.
   *
   * Once the keyup event hasn't been detected for at least 1000 ms (1s), check if
   * the textarea value has changed and update the count message if it has.
   *
   * This is so that the update triggered by the manual comparison doesn't
   * conflict with debounced KeyboardEvent updates.
   *
   * @deprecated Will be made private in v5.0
   */
  CharacterCount.prototype.handleFocus = function () {
    this.valueChecker = setInterval(/** @this {CharacterCount} */ function () {
      if (!this.lastInputTimestamp || (Date.now() - 500) >= this.lastInputTimestamp) {
        this.updateIfValueChanged();
      }
    }.bind(this), 1000);
  };

  /**
   * Handle blur event
   *
   * Stop checking the textarea value once the textarea no longer has focus
   *
   * @deprecated Will be made private in v5.0
   */
  CharacterCount.prototype.handleBlur = function () {
    // Cancel value checking on blur
    clearInterval(this.valueChecker);
  };

  /**
   * Update count message if textarea value has changed
   *
   * @deprecated Will be made private in v5.0
   */
  CharacterCount.prototype.updateIfValueChanged = function () {
    if (this.$textarea.value !== this.lastInputValue) {
      this.lastInputValue = this.$textarea.value;
      this.updateCountMessage();
    }
  };

  /**
   * Update count message
   *
   * Helper function to update both the visible and screen reader-specific
   * counters simultaneously (e.g. on init)
   *
   * @deprecated Will be made private in v5.0
   */
  CharacterCount.prototype.updateCountMessage = function () {
    this.updateVisibleCountMessage();
    this.updateScreenReaderCountMessage();
  };

  /**
   * Update visible count message
   *
   * @deprecated Will be made private in v5.0
   */
  CharacterCount.prototype.updateVisibleCountMessage = function () {
    var $textarea = this.$textarea;
    var $visibleCountMessage = this.$visibleCountMessage;
    var remainingNumber = this.maxLength - this.count($textarea.value);

    // If input is over the threshold, remove the disabled class which renders the
    // counter invisible.
    if (this.isOverThreshold()) {
      $visibleCountMessage.classList.remove('govuk-character-count__message--disabled');
    } else {
      $visibleCountMessage.classList.add('govuk-character-count__message--disabled');
    }

    // Update styles
    if (remainingNumber < 0) {
      $textarea.classList.add('govuk-textarea--error');
      $visibleCountMessage.classList.remove('govuk-hint');
      $visibleCountMessage.classList.add('govuk-error-message');
    } else {
      $textarea.classList.remove('govuk-textarea--error');
      $visibleCountMessage.classList.remove('govuk-error-message');
      $visibleCountMessage.classList.add('govuk-hint');
    }

    // Update message
    $visibleCountMessage.innerText = this.getCountMessage();
  };

  /**
   * Update screen reader count message
   *
   * @deprecated Will be made private in v5.0
   */
  CharacterCount.prototype.updateScreenReaderCountMessage = function () {
    var $screenReaderCountMessage = this.$screenReaderCountMessage;

    // If over the threshold, remove the aria-hidden attribute, allowing screen
    // readers to announce the content of the element.
    if (this.isOverThreshold()) {
      $screenReaderCountMessage.removeAttribute('aria-hidden');
    } else {
      $screenReaderCountMessage.setAttribute('aria-hidden', 'true');
    }

    // Update message
    $screenReaderCountMessage.innerText = this.getCountMessage();
  };

  /**
   * Count the number of characters (or words, if `config.maxwords` is set)
   * in the given text
   *
   * @deprecated Will be made private in v5.0
   * @param {string} text - The text to count the characters of
   * @returns {number} the number of characters (or words) in the text
   */
  CharacterCount.prototype.count = function (text) {
    if ('maxwords' in this.config && this.config.maxwords) {
      var tokens = text.match(/\S+/g) || []; // Matches consecutive non-whitespace chars
      return tokens.length
    } else {
      return text.length
    }
  };

  /**
   * Get count message
   *
   * @deprecated Will be made private in v5.0
   * @returns {string} Status message
   */
  CharacterCount.prototype.getCountMessage = function () {
    var remainingNumber = this.maxLength - this.count(this.$textarea.value);

    var countType = 'maxwords' in this.config && this.config.maxwords ? 'words' : 'characters';
    return this.formatCountMessage(remainingNumber, countType)
  };

  /**
   * Formats the message shown to users according to what's counted
   * and how many remain
   *
   * @deprecated Will be made private in v5.0
   * @param {number} remainingNumber - The number of words/characaters remaining
   * @param {string} countType - "words" or "characters"
   * @returns {string} Status message
   */
  CharacterCount.prototype.formatCountMessage = function (remainingNumber, countType) {
    if (remainingNumber === 0) {
      return this.i18n.t(countType + 'AtLimit')
    }

    var translationKeySuffix = remainingNumber < 0 ? 'OverLimit' : 'UnderLimit';

    return this.i18n.t(countType + translationKeySuffix, { count: Math.abs(remainingNumber) })
  };

  /**
   * Check if count is over threshold
   *
   * Checks whether the value is over the configured threshold for the input.
   * If there is no configured threshold, it is set to 0 and this function will
   * always return true.
   *
   * @deprecated Will be made private in v5.0
   * @returns {boolean} true if the current count is over the config.threshold
   *   (or no threshold is set)
   */
  CharacterCount.prototype.isOverThreshold = function () {
    // No threshold means we're always above threshold so save some computation
    if (!this.config.threshold) {
      return true
    }

    var $textarea = this.$textarea;

    // Determine the remaining number of characters/words
    var currentLength = this.count($textarea.value);
    var maxLength = this.maxLength;

    var thresholdValue = maxLength * this.config.threshold / 100;

    return (thresholdValue <= currentLength)
  };

  /**
   * Character count config
   *
   * @typedef {CharacterCountConfigWithMaxLength | CharacterCountConfigWithMaxWords} CharacterCountConfig
   */

  /**
   * Character count config (with maximum number of characters)
   *
   * @typedef {object} CharacterCountConfigWithMaxLength
   * @property {number} [maxlength] - The maximum number of characters.
   *   If maxwords is provided, the maxlength option will be ignored.
   * @property {number} [threshold=0] - The percentage value of the limit at
   *   which point the count message is displayed. If this attribute is set, the
   *   count message will be hidden by default.
   * @property {CharacterCountTranslations} [i18n=CHARACTER_COUNT_TRANSLATIONS] - Character count translations
   */

  /**
   * Character count config (with maximum number of words)
   *
   * @typedef {object} CharacterCountConfigWithMaxWords
   * @property {number} [maxwords] - The maximum number of words. If maxwords is
   *   provided, the maxlength option will be ignored.
   * @property {number} [threshold=0] - The percentage value of the limit at
   *   which point the count message is displayed. If this attribute is set, the
   *   count message will be hidden by default.
   * @property {CharacterCountTranslations} [i18n=CHARACTER_COUNT_TRANSLATIONS] - Character count translations
   */

  /**
   * Character count translations
   *
   * @see {@link CHARACTER_COUNT_TRANSLATIONS}
   * @typedef {object} CharacterCountTranslations
   *
   * Messages shown to users as they type. It provides feedback on how many words
   * or characters they have remaining or if they are over the limit. This also
   * includes a message used as an accessible description for the textarea.
   * @property {TranslationPluralForms} [charactersUnderLimit] - Message displayed
   *   when the number of characters is under the configured maximum, `maxlength`.
   *   This message is displayed visually and through assistive technologies. The
   *   component will replace the `%{count}` placeholder with the number of
   *   remaining characters. This is a [pluralised list of
   *   messages](https://frontend.design-system.service.gov.uk/localise-govuk-frontend).
   * @property {string} [charactersAtLimit] - Message displayed when the number of
   *   characters reaches the configured maximum, `maxlength`. This message is
   *   displayed visually and through assistive technologies.
   * @property {TranslationPluralForms} [charactersOverLimit] - Message displayed
   *   when the number of characters is over the configured maximum, `maxlength`.
   *   This message is displayed visually and through assistive technologies. The
   *   component will replace the `%{count}` placeholder with the number of
   *   remaining characters. This is a [pluralised list of
   *   messages](https://frontend.design-system.service.gov.uk/localise-govuk-frontend).
   * @property {TranslationPluralForms} [wordsUnderLimit] - Message displayed when
   *   the number of words is under the configured maximum, `maxlength`. This
   *   message is displayed visually and through assistive technologies. The
   *   component will replace the `%{count}` placeholder with the number of
   *   remaining words. This is a [pluralised list of
   *   messages](https://frontend.design-system.service.gov.uk/localise-govuk-frontend).
   * @property {string} [wordsAtLimit] - Message displayed when the number of
   *   words reaches the configured maximum, `maxlength`. This message is
   *   displayed visually and through assistive technologies.
   * @property {TranslationPluralForms} [wordsOverLimit] - Message displayed when
   *   the number of words is over the configured maximum, `maxlength`. This
   *   message is displayed visually and through assistive technologies. The
   *   component will replace the `%{count}` placeholder with the number of
   *   remaining words. This is a [pluralised list of
   *   messages](https://frontend.design-system.service.gov.uk/localise-govuk-frontend).
   * @property {TranslationPluralForms} [textareaDescription] - Message made
   *   available to assistive technologies, if none is already present in the
   *   HTML, to describe that the component accepts only a limited amount of
   *   content. It is visible on the page when JavaScript is unavailable. The
   *   component will replace the `%{count}` placeholder with the value of the
   *   `maxlength` or `maxwords` parameter.
   */

  /**
   * @typedef {import('../../i18n.mjs').TranslationPluralForms} TranslationPluralForms
   */

  /**
   * Checkboxes component
   *
   * @class
   * @param {Element} $module - HTML element to use for checkboxes
   */
  function Checkboxes ($module) {
    if (!($module instanceof HTMLElement)) {
      return this
    }

    /** @satisfies {NodeListOf<HTMLInputElement>} */
    var $inputs = $module.querySelectorAll('input[type="checkbox"]');
    if (!$inputs.length) {
      return this
    }

    /** @deprecated Will be made private in v5.0 */
    this.$module = $module;

    /** @deprecated Will be made private in v5.0 */
    this.$inputs = $inputs;
  }

  /**
   * Initialise component
   *
   * Checkboxes can be associated with a 'conditionally revealed' content block –
   * for example, a checkbox for 'Phone' could reveal an additional form field for
   * the user to enter their phone number.
   *
   * These associations are made using a `data-aria-controls` attribute, which is
   * promoted to an aria-controls attribute during initialisation.
   *
   * We also need to restore the state of any conditional reveals on the page (for
   * example if the user has navigated back), and set up event handlers to keep
   * the reveal in sync with the checkbox state.
   */
  Checkboxes.prototype.init = function () {
    // Check that required elements are present
    if (!this.$module || !this.$inputs) {
      return
    }

    var $module = this.$module;
    var $inputs = this.$inputs;

    $inputs.forEach(function ($input) {
      var targetId = $input.getAttribute('data-aria-controls');

      // Skip checkboxes without data-aria-controls attributes, or where the
      // target element does not exist.
      if (!targetId || !document.getElementById(targetId)) {
        return
      }

      // Promote the data-aria-controls attribute to a aria-controls attribute
      // so that the relationship is exposed in the AOM
      $input.setAttribute('aria-controls', targetId);
      $input.removeAttribute('data-aria-controls');
    });

    // When the page is restored after navigating 'back' in some browsers the
    // state of form controls is not restored until *after* the DOMContentLoaded
    // event is fired, so we need to sync after the pageshow event in browsers
    // that support it.
    window.addEventListener(
      'onpageshow' in window ? 'pageshow' : 'DOMContentLoaded',
      this.syncAllConditionalReveals.bind(this)
    );

    // Although we've set up handlers to sync state on the pageshow or
    // DOMContentLoaded event, init could be called after those events have fired,
    // for example if they are added to the page dynamically, so sync now too.
    this.syncAllConditionalReveals();

    // Handle events
    $module.addEventListener('click', this.handleClick.bind(this));
  };

  /**
   * Sync the conditional reveal states for all checkboxes in this $module.
   *
   * @deprecated Will be made private in v5.0
   */
  Checkboxes.prototype.syncAllConditionalReveals = function () {
    this.$inputs.forEach(this.syncConditionalRevealWithInputState.bind(this));
  };

  /**
   * Sync conditional reveal with the input state
   *
   * Synchronise the visibility of the conditional reveal, and its accessible
   * state, with the input's checked state.
   *
   * @deprecated Will be made private in v5.0
   * @param {HTMLInputElement} $input - Checkbox input
   */
  Checkboxes.prototype.syncConditionalRevealWithInputState = function ($input) {
    var targetId = $input.getAttribute('aria-controls');
    if (!targetId) {
      return
    }

    var $target = document.getElementById(targetId);
    if ($target && $target.classList.contains('govuk-checkboxes__conditional')) {
      var inputIsChecked = $input.checked;

      $input.setAttribute('aria-expanded', inputIsChecked.toString());
      $target.classList.toggle('govuk-checkboxes__conditional--hidden', !inputIsChecked);
    }
  };

  /**
   * Uncheck other checkboxes
   *
   * Find any other checkbox inputs with the same name value, and uncheck them.
   * This is useful for when a “None of these" checkbox is checked.
   *
   * @deprecated Will be made private in v5.0
   * @param {HTMLInputElement} $input - Checkbox input
   */
  Checkboxes.prototype.unCheckAllInputsExcept = function ($input) {
    var $component = this;

    /** @satisfies {NodeListOf<HTMLInputElement>} */
    var allInputsWithSameName = document.querySelectorAll(
      'input[type="checkbox"][name="' + $input.name + '"]'
    );

    allInputsWithSameName.forEach(function ($inputWithSameName) {
      var hasSameFormOwner = ($input.form === $inputWithSameName.form);
      if (hasSameFormOwner && $inputWithSameName !== $input) {
        $inputWithSameName.checked = false;
        $component.syncConditionalRevealWithInputState($inputWithSameName);
      }
    });
  };

  /**
   * Uncheck exclusive checkboxes
   *
   * Find any checkbox inputs with the same name value and the 'exclusive' behaviour,
   * and uncheck them. This helps prevent someone checking both a regular checkbox and a
   * "None of these" checkbox in the same fieldset.
   *
   * @deprecated Will be made private in v5.0
   * @param {HTMLInputElement} $input - Checkbox input
   */
  Checkboxes.prototype.unCheckExclusiveInputs = function ($input) {
    var $component = this;

    /** @satisfies {NodeListOf<HTMLInputElement>} */
    var allInputsWithSameNameAndExclusiveBehaviour = document.querySelectorAll(
      'input[data-behaviour="exclusive"][type="checkbox"][name="' + $input.name + '"]'
    );

    allInputsWithSameNameAndExclusiveBehaviour.forEach(function ($exclusiveInput) {
      var hasSameFormOwner = ($input.form === $exclusiveInput.form);
      if (hasSameFormOwner) {
        $exclusiveInput.checked = false;
        $component.syncConditionalRevealWithInputState($exclusiveInput);
      }
    });
  };

  /**
   * Click event handler
   *
   * Handle a click within the $module – if the click occurred on a checkbox, sync
   * the state of any associated conditional reveal with the checkbox state.
   *
   * @deprecated Will be made private in v5.0
   * @param {MouseEvent} event - Click event
   */
  Checkboxes.prototype.handleClick = function (event) {
    var $clickedInput = event.target;

    // Ignore clicks on things that aren't checkbox inputs
    if (!($clickedInput instanceof HTMLInputElement) || $clickedInput.type !== 'checkbox') {
      return
    }

    // If the checkbox conditionally-reveals some content, sync the state
    var hasAriaControls = $clickedInput.getAttribute('aria-controls');
    if (hasAriaControls) {
      this.syncConditionalRevealWithInputState($clickedInput);
    }

    // No further behaviour needed for unchecking
    if (!$clickedInput.checked) {
      return
    }

    // Handle 'exclusive' checkbox behaviour (ie "None of these")
    var hasBehaviourExclusive = ($clickedInput.getAttribute('data-behaviour') === 'exclusive');
    if (hasBehaviourExclusive) {
      this.unCheckAllInputsExcept($clickedInput);
    } else {
      this.unCheckExclusiveInputs($clickedInput);
    }
  };

  /**
   * JavaScript 'polyfill' for HTML5's <details> and <summary> elements
   * and 'shim' to add accessiblity enhancements for all browsers
   *
   * http://caniuse.com/#feat=details
   */

  var KEY_ENTER = 13;
  var KEY_SPACE$1 = 32;

  /**
   * Details component
   *
   * @class
   * @param {Element} $module - HTML element to use for details
   */
  function Details ($module) {
    if (!($module instanceof HTMLElement)) {
      return this
    }

    /** @deprecated Will be made private in v5.0 */
    this.$module = $module;

    /** @deprecated Will be made private in v5.0 */
    this.$summary = null;

    /** @deprecated Will be made private in v5.0 */
    this.$content = null;
  }

  /**
   * Initialise component
   */
  Details.prototype.init = function () {
    // Check that required elements are present
    if (!this.$module) {
      return
    }

    // If there is native details support, we want to avoid running code to polyfill native behaviour.
    var hasNativeDetails = 'HTMLDetailsElement' in window &&
      this.$module instanceof HTMLDetailsElement;

    if (!hasNativeDetails) {
      this.polyfillDetails();
    }
  };

  /**
   * Polyfill component in older browsers
   *
   * @deprecated Will be made private in v5.0
   */
  Details.prototype.polyfillDetails = function () {
    var $module = this.$module;

    // Save shortcuts to the inner summary and content elements
    var $summary = this.$summary = $module.getElementsByTagName('summary').item(0);
    var $content = this.$content = $module.getElementsByTagName('div').item(0);

    // If <details> doesn't have a <summary> and a <div> representing the content
    // it means the required HTML structure is not met so the script will stop
    if (!$summary || !$content) {
      return
    }

    // If the content doesn't have an ID, assign it one now
    // which we'll need for the summary's aria-controls assignment
    if (!$content.id) {
      $content.id = 'details-content-' + generateUniqueID();
    }

    // Add ARIA role="group" to details
    $module.setAttribute('role', 'group');

    // Add role=button to summary
    $summary.setAttribute('role', 'button');

    // Add aria-controls
    $summary.setAttribute('aria-controls', $content.id);

    // Set tabIndex so the summary is keyboard accessible for non-native elements
    //
    // We have to use the camelcase `tabIndex` property as there is a bug in IE6/IE7 when we set the correct attribute lowercase:
    // See http://web.archive.org/web/20170120194036/http://www.saliences.com/browserBugs/tabIndex.html for more information.
    $summary.tabIndex = 0;

    // Detect initial open state
    if (this.$module.hasAttribute('open')) {
      $summary.setAttribute('aria-expanded', 'true');
    } else {
      $summary.setAttribute('aria-expanded', 'false');
      $content.style.display = 'none';
    }

    // Bind an event to handle summary elements
    this.polyfillHandleInputs(this.polyfillSetAttributes.bind(this));
  };

  /**
   * Define a statechange function that updates aria-expanded and style.display
   *
   * @deprecated Will be made private in v5.0
   * @returns {boolean} Returns true
   */
  Details.prototype.polyfillSetAttributes = function () {
    if (this.$module.hasAttribute('open')) {
      this.$module.removeAttribute('open');
      this.$summary.setAttribute('aria-expanded', 'false');
      this.$content.style.display = 'none';
    } else {
      this.$module.setAttribute('open', 'open');
      this.$summary.setAttribute('aria-expanded', 'true');
      this.$content.style.display = '';
    }

    return true
  };

  /**
   * Handle cross-modal click events
   *
   * @deprecated Will be made private in v5.0
   * @param {(event: UIEvent) => void} callback - function
   */
  Details.prototype.polyfillHandleInputs = function (callback) {
    this.$summary.addEventListener('keypress', function (event) {
      var $target = event.target;
      // When the key gets pressed - check if it is enter or space
      if (event.keyCode === KEY_ENTER || event.keyCode === KEY_SPACE$1) {
        if ($target instanceof HTMLElement && $target.nodeName.toLowerCase() === 'summary') {
          // Prevent space from scrolling the page
          // and enter from submitting a form
          event.preventDefault();
          // Click to let the click event do all the necessary action
          if ($target.click) {
            $target.click();
          } else {
            // except Safari 5.1 and under don't support .click() here
            callback(event);
          }
        }
      }
    });

    // Prevent keyup to prevent clicking twice in Firefox when using space key
    this.$summary.addEventListener('keyup', function (event) {
      var $target = event.target;
      if (event.keyCode === KEY_SPACE$1) {
        if ($target instanceof HTMLElement && $target.nodeName.toLowerCase() === 'summary') {
          event.preventDefault();
        }
      }
    });

    this.$summary.addEventListener('click', callback);
  };

  /**
   * JavaScript enhancements for the ErrorSummary
   *
   * Takes focus on initialisation for accessible announcement, unless disabled in configuration.
   *
   * @class
   * @param {Element} $module - HTML element to use for error summary
   * @param {ErrorSummaryConfig} [config] - Error summary config
   */
  function ErrorSummary ($module, config) {
    // Some consuming code may not be passing a module,
    // for example if they initialise the component
    // on their own by directly passing the result
    // of `document.querySelector`.
    // To avoid breaking further JavaScript initialisation
    // we need to safeguard against this so things keep
    // working the same now we read the elements data attributes
    if (!($module instanceof HTMLElement)) {
      // Little safety in case code gets ported as-is
      // into and ES6 class constructor, where the return value matters
      return this
    }

    /** @deprecated Will be made private in v5.0 */
    this.$module = $module;

    /** @type {ErrorSummaryConfig} */
    var defaultConfig = {
      disableAutoFocus: false
    };

    /**
     * @deprecated Will be made private in v5.0
     * @type {ErrorSummaryConfig}
     */
    this.config = mergeConfigs(
      defaultConfig,
      config || {},
      normaliseDataset($module.dataset)
    );
  }

  /**
   * Initialise component
   */
  ErrorSummary.prototype.init = function () {
    // Check that required elements are present
    if (!this.$module) {
      return
    }

    var $module = this.$module;

    this.setFocus();
    $module.addEventListener('click', this.handleClick.bind(this));
  };

  /**
   * Focus the error summary
   *
   * @deprecated Will be made private in v5.0
   */
  ErrorSummary.prototype.setFocus = function () {
    var $module = this.$module;

    if (this.config.disableAutoFocus) {
      return
    }

    // Set tabindex to -1 to make the element programmatically focusable, but
    // remove it on blur as the error summary doesn't need to be focused again.
    $module.setAttribute('tabindex', '-1');

    $module.addEventListener('blur', function () {
      $module.removeAttribute('tabindex');
    });

    $module.focus();
  };

  /**
   * Click event handler
   *
   * @deprecated Will be made private in v5.0
   * @param {MouseEvent} event - Click event
   */
  ErrorSummary.prototype.handleClick = function (event) {
    var $target = event.target;
    if (this.focusTarget($target)) {
      event.preventDefault();
    }
  };

  /**
   * Focus the target element
   *
   * By default, the browser will scroll the target into view. Because our labels
   * or legends appear above the input, this means the user will be presented with
   * an input without any context, as the label or legend will be off the top of
   * the screen.
   *
   * Manually handling the click event, scrolling the question into view and then
   * focussing the element solves this.
   *
   * This also results in the label and/or legend being announced correctly in
   * NVDA (as tested in 2018.3.2) - without this only the field type is announced
   * (e.g. "Edit, has autocomplete").
   *
   * @deprecated Will be made private in v5.0
   * @param {EventTarget} $target - Event target
   * @returns {boolean} True if the target was able to be focussed
   */
  ErrorSummary.prototype.focusTarget = function ($target) {
    // If the element that was clicked was not a link, return early
    if (!($target instanceof HTMLAnchorElement)) {
      return false
    }

    var inputId = this.getFragmentFromUrl($target.href);
    if (!inputId) {
      return false
    }

    var $input = document.getElementById(inputId);
    if (!$input) {
      return false
    }

    var $legendOrLabel = this.getAssociatedLegendOrLabel($input);
    if (!$legendOrLabel) {
      return false
    }

    // Scroll the legend or label into view *before* calling focus on the input to
    // avoid extra scrolling in browsers that don't support `preventScroll` (which
    // at time of writing is most of them...)
    $legendOrLabel.scrollIntoView();
    $input.focus({ preventScroll: true });

    return true
  };

  /**
   * Get fragment from URL
   *
   * Extract the fragment (everything after the hash) from a URL, but not including
   * the hash.
   *
   * @deprecated Will be made private in v5.0
   * @param {string} url - URL
   * @returns {string | undefined} Fragment from URL, without the hash
   */
  ErrorSummary.prototype.getFragmentFromUrl = function (url) {
    if (url.indexOf('#') === -1) {
      return undefined
    }

    return url.split('#').pop()
  };

  /**
   * Get associated legend or label
   *
   * Returns the first element that exists from this list:
   *
   * - The `<legend>` associated with the closest `<fieldset>` ancestor, as long
   *   as the top of it is no more than half a viewport height away from the
   *   bottom of the input
   * - The first `<label>` that is associated with the input using for="inputId"
   * - The closest parent `<label>`
   *
   * @deprecated Will be made private in v5.0
   * @param {Element} $input - The input
   * @returns {Element | null} Associated legend or label, or null if no associated
   *   legend or label can be found
   */
  ErrorSummary.prototype.getAssociatedLegendOrLabel = function ($input) {
    var $fieldset = $input.closest('fieldset');

    if ($fieldset) {
      var $legends = $fieldset.getElementsByTagName('legend');

      if ($legends.length) {
        var $candidateLegend = $legends[0];

        // If the input type is radio or checkbox, always use the legend if there
        // is one.
        if ($input instanceof HTMLInputElement && ($input.type === 'checkbox' || $input.type === 'radio')) {
          return $candidateLegend
        }

        // For other input types, only scroll to the fieldset’s legend (instead of
        // the label associated with the input) if the input would end up in the
        // top half of the screen.
        //
        // This should avoid situations where the input either ends up off the
        // screen, or obscured by a software keyboard.
        var legendTop = $candidateLegend.getBoundingClientRect().top;
        var inputRect = $input.getBoundingClientRect();

        // If the browser doesn't support Element.getBoundingClientRect().height
        // or window.innerHeight (like IE8), bail and just link to the label.
        if (inputRect.height && window.innerHeight) {
          var inputBottom = inputRect.top + inputRect.height;

          if (inputBottom - legendTop < window.innerHeight / 2) {
            return $candidateLegend
          }
        }
      }
    }

    return document.querySelector("label[for='" + $input.getAttribute('id') + "']") ||
      $input.closest('label')
  };

  /**
   * Error summary config
   *
   * @typedef {object} ErrorSummaryConfig
   * @property {boolean} [disableAutoFocus=false] - If set to `true` the error
   *   summary will not be focussed when the page loads.
   */

  /**
   * Header component
   *
   * @class
   * @param {Element} $module - HTML element to use for header
   */
  function Header ($module) {
    if (!($module instanceof HTMLElement)) {
      return this
    }

    /** @deprecated Will be made private in v5.0 */
    this.$module = $module;

    /** @deprecated Will be made private in v5.0 */
    this.$menuButton = $module.querySelector('.govuk-js-header-toggle');

    /** @deprecated Will be made private in v5.0 */
    this.$menu = this.$menuButton && $module.querySelector(
      '#' + this.$menuButton.getAttribute('aria-controls')
    );

    /**
     * Save the opened/closed state for the nav in memory so that we can
     * accurately maintain state when the screen is changed from small to
     * big and back to small
     *
     * @deprecated Will be made private in v5.0
     */
    this.menuIsOpen = false;

    /**
     * A global const for storing a matchMedia instance which we'll use to
     * detect when a screen size change happens. We set this later during the
     * init function and rely on it being null if the feature isn't available
     * to initially apply hidden attributes
     *
     * @deprecated Will be made private in v5.0
     */
    this.mql = null;
  }

  /**
   * Initialise component
   *
   * Check for the presence of the header, menu and menu button – if any are
   * missing then there's nothing to do so return early.
   * Feature sniff for and apply a matchMedia for desktop which will
   * trigger a state sync if the browser viewport moves between states. If
   * matchMedia isn't available, hide the menu button and present the "no js"
   * version of the menu to the user.
   */
  Header.prototype.init = function () {
    // Check that required elements are present
    if (!this.$module || !this.$menuButton || !this.$menu) {
      return
    }

    if ('matchMedia' in window) {
      // Set the matchMedia to the govuk-frontend desktop breakpoint
      this.mql = window.matchMedia('(min-width: 48.0625em)');

      if ('addEventListener' in this.mql) {
        this.mql.addEventListener('change', this.syncState.bind(this));
      } else {
        // addListener is a deprecated function, however addEventListener
        // isn't supported by IE or Safari < 14. We therefore add this in as
        // a fallback for those browsers

        // @ts-expect-error Property 'addListener' does not exist
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.mql.addListener(this.syncState.bind(this));
      }

      this.syncState();
      this.$menuButton.addEventListener('click', this.handleMenuButtonClick.bind(this));
    } else {
      this.$menuButton.setAttribute('hidden', '');
    }
  };

  /**
   * Sync menu state
   *
   * Uses the global variable menuIsOpen to correctly set the accessible and
   * visual states of the menu and the menu button.
   * Additionally will force the menu to be visible and the menu button to be
   * hidden if the matchMedia is triggered to desktop.
   *
   * @deprecated Will be made private in v5.0
   */
  Header.prototype.syncState = function () {
    if (this.mql.matches) {
      this.$menu.removeAttribute('hidden');
      this.$menuButton.setAttribute('hidden', '');
    } else {
      this.$menuButton.removeAttribute('hidden');
      this.$menuButton.setAttribute('aria-expanded', this.menuIsOpen.toString());

      if (this.menuIsOpen) {
        this.$menu.removeAttribute('hidden');
      } else {
        this.$menu.setAttribute('hidden', '');
      }
    }
  };

  /**
   * Handle menu button click
   *
   * When the menu button is clicked, change the visibility of the menu and then
   * sync the accessibility state and menu button state
   *
   * @deprecated Will be made private in v5.0
   */
  Header.prototype.handleMenuButtonClick = function () {
    this.menuIsOpen = !this.menuIsOpen;
    this.syncState();
  };

  /*
    Accordion

    This allows a collection of sections to be collapsed by default,
    showing only their headers. Sections can be exanded or collapsed
    individually by clicking their headers. An "Open all" button is
    also added to the top of the accordion, which switches to "Close all"
    when all the sections are expanded.

    The state of each section is saved to the DOM via the `aria-expanded`
    attribute, which also provides accessibility.

  */

  /**
   * Accordion Component
   *
   * @param {object} $module - The accordion module DOM element
   */
  function IdskAccordion ($module) {
    this.$module = $module;
    this.moduleId = $module.getAttribute('id');
    this.$sections = $module.querySelectorAll('.govuk-accordion__section');
    this.browserSupportsSessionStorage = helper$1.checkForSessionStorage();

    this.controlsClass = 'govuk-accordion__controls';
    this.openAllClass = 'govuk-accordion__open-all';
    this.iconClass = 'govuk-accordion__icon';

    this.sectionHeaderClass = 'govuk-accordion__section-header';
    this.sectionHeaderFocusedClass = 'govuk-accordion__section-header--focused';
    this.sectionHeadingClass = 'govuk-accordion__section-heading';
    this.sectionSummaryClass = 'govuk-accordion__section-summary';
    this.sectionButtonClass = 'govuk-accordion__section-button';
    this.sectionExpandedClass = 'govuk-accordion__section--expanded';

    this.$openAllButton = $module.querySelector('.govuk-accordion__open-all');
    this.$sectionSpan = $module.querySelector('.govuk-accordion__controls-span');
    this.openTitle = this.$openAllButton.dataset.openTitle;
    this.closeTitle = this.$openAllButton.dataset.closeTitle;
    this.sectionTitle = this.$sectionSpan.dataset.sectionTitle;
  }

  /**
   * Initialise component
   */
  IdskAccordion.prototype.init = function () {
    // Check for module
    if (!this.$module) {
      return
    }

    this.initControls();

    this.initSectionHeaders();

    // See if "Open all" button text should be updated
    var areAllSectionsOpen = this.checkIfAllSectionsOpen();
    this.updateOpenAllButton(areAllSectionsOpen);
  };

  /**
   * Initialise controls and set attributes
   */
  IdskAccordion.prototype.initControls = function () {
    // Handle events for the controls
    this.$openAllButton.addEventListener(
      'click',
      this.onOpenOrCloseAllToggle.bind(this)
    );
  };

  /**
   * Initialise section headers
   */
  IdskAccordion.prototype.initSectionHeaders = function () {
    // Loop through section headers
    this.$sections.forEach(
      function ($section, i) {
        // Set header attributes
        var header = $section.querySelector('.' + this.sectionHeaderClass);
        this.initHeaderAttributes(header, i);

        this.setExpanded(this.isExpanded($section), $section);

        // Handle events
        header.addEventListener(
          'click',
          this.onSectionToggle.bind(this, $section)
        );

        // See if there is any state stored in sessionStorage and set the sections to
        // open or closed.
        this.setInitialState($section);
      }.bind(this)
    );
  };

  /**
   * Set individual header attributes
   *
   * @param {object} $headerWrapper - The header wrapper DOM element
   * @param {number} index - The index of the header in the nodeList
   */
  IdskAccordion.prototype.initHeaderAttributes = function ($headerWrapper, index) {
    var $module = this;
    var $span = $headerWrapper.querySelector('.' + this.sectionButtonClass);
    var $heading = $headerWrapper.querySelector('.' + this.sectionHeadingClass);
    var $summary = $headerWrapper.querySelector('.' + this.sectionSummaryClass);

    // Copy existing span element to an actual button element, for improved accessibility.
    var $button = document.createElement('button');
    $button.setAttribute('type', 'button');
    $button.setAttribute('id', this.moduleId + '-heading-' + (index + 1));
    $button.setAttribute(
      'aria-controls',
      this.moduleId + '-content-' + (index + 1)
    );

    // Copy all attributes (https://developer.mozilla.org/en-US/docs/Web/API/Element/attributes) from $span to $button
    for (var i = 0; i < $span.attributes.length; i++) {
      var attr = $span.attributes.item(i);
      $button.setAttribute(attr.nodeName, attr.nodeValue);
    }

    $button.addEventListener('focusin', function (e) {
      if (!$headerWrapper.classList.contains($module.sectionHeaderFocusedClass)) {
        $headerWrapper.className += ' ' + $module.sectionHeaderFocusedClass;
      }
    });

    $button.addEventListener('blur', function (e) {
      $headerWrapper.classList.remove($module.sectionHeaderFocusedClass);
    });

    if (typeof $summary !== 'undefined' && $summary !== null) {
      $button.setAttribute(
        'aria-describedby',
        this.moduleId + '-summary-' + (index + 1)
      );
    }

    // $span could contain HTML elements (see https://www.w3.org/TR/2011/WD-html5-20110525/content-models.html#phrasing-content)
    $button.innerHTML = $span.innerHTML;

    $heading.removeChild($span);
    $heading.appendChild($button);

    // Add "+/-" icon
    var icon = document.createElement('span');
    icon.className = this.iconClass;
    icon.setAttribute('aria-hidden', 'true');

    $heading.appendChild(icon);
  };

  /**
   * When section toggled, set and store state
   *
   * @param {object} $section - The section to toggle
   */
  IdskAccordion.prototype.onSectionToggle = function ($section) {
    var expanded = this.isExpanded($section);
    this.setExpanded(!expanded, $section);

    // Store the state in sessionStorage when a change is triggered
    this.storeState($section);
  };

  /**
   * When Open/Close All toggled, set and store state
   */
  IdskAccordion.prototype.onOpenOrCloseAllToggle = function () {
    var $module = this;
    var $sections = this.$sections;

    var nowExpanded = !this.checkIfAllSectionsOpen();

    $sections.forEach(function ($section) {
      $module.setExpanded(nowExpanded, $section);
      // Store the state in sessionStorage when a change is triggered
      $module.storeState($section);
    });

    $module.updateOpenAllButton(nowExpanded);
  };

  /**
   * Set section attributes when opened/closed
   *
   * @param {boolean} expanded - Whether the section is expanded or not
   * @param {object} $section - The section to toggle
   */
  IdskAccordion.prototype.setExpanded = function (expanded, $section) {
    var $button = $section.querySelector('.' + this.sectionButtonClass);
    $button.setAttribute('aria-expanded', expanded);

    if (expanded) {
      $section.classList.add(this.sectionExpandedClass);
    } else {
      $section.classList.remove(this.sectionExpandedClass);
    }

    // See if "Open all" button text should be updated
    var areAllSectionsOpen = this.checkIfAllSectionsOpen();
    this.updateOpenAllButton(areAllSectionsOpen);
  };

  /**
   * Get state of section
   *
   * @param {object} $section - The section to check
   * @returns {boolean} Whether the section is expanded or not
   */
  IdskAccordion.prototype.isExpanded = function ($section) {
    return $section.classList.contains(this.sectionExpandedClass)
  };

  /**
   * Check if all sections are open
   *
   * @returns {boolean} Whether all sections are open or not
   */
  IdskAccordion.prototype.checkIfAllSectionsOpen = function () {
    // Get a count of all the Accordion sections
    var sectionsCount = this.$sections.length;
    // Get a count of all Accordion sections that are expanded
    var expandedSectionCount = this.$module.querySelectorAll(
      '.' + this.sectionExpandedClass
    ).length;
    var areAllSectionsOpen = sectionsCount === expandedSectionCount;

    return areAllSectionsOpen
  };

  /**
   * Update "Open all" button
   *
   * @param {boolean} expanded - Whether the sections are expanded or not
   */
  IdskAccordion.prototype.updateOpenAllButton = function (expanded) {
    var newButtonText = expanded ? this.closeTitle : this.openTitle;
    newButtonText +=
      '<span class="govuk-visually-hidden section-span"> ' +
      this.sectionTitle +
      '</span>';
    this.$openAllButton.setAttribute('aria-expanded', expanded);
    this.$openAllButton.innerHTML = newButtonText;
  };

  var helper$1 = {
    /**
     * Check for `window.sessionStorage`, and that it actually works.
     *
     * @returns {boolean} True if session storage is available
     */
    checkForSessionStorage: function () {
      var testString = 'this is the test string';
      var result;
      try {
        window.sessionStorage.setItem(testString, testString);
        result =
          window.sessionStorage.getItem(testString) === testString.toString();
        window.sessionStorage.removeItem(testString);
        return result
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
   * @param {object} $section - section DOM element
   */
  IdskAccordion.prototype.storeState = function ($section) {
    if (this.browserSupportsSessionStorage) {
      // We need a unique way of identifying each content in the accordion. Since
      // an `#id` should be unique and an `id` is required for `aria-` attributes
      // `id` can be safely used.
      var $button = $section.querySelector('.' + this.sectionButtonClass);

      if ($button) {
        var contentId = $button.getAttribute('aria-controls');
        var contentState = $button.getAttribute('aria-expanded');

        if (
          typeof contentId === 'undefined' &&
          (typeof console === 'undefined' || typeof console.log === 'undefined')
        ) {
          console.error(
            new Error('No aria controls present in accordion section heading.')
          );
        }

        if (
          typeof contentState === 'undefined' &&
          (typeof console === 'undefined' || typeof console.log === 'undefined')
        ) {
          console.error(
            new Error('No aria expanded present in accordion section heading.')
          );
        }

        // Only set the state when both `contentId` and `contentState` are taken from the DOM.
        if (contentId && contentState) {
          window.sessionStorage.setItem(contentId, contentState);
        }
      }
    }
  };

  /**
   * Read the state of the accordions from sessionStorage
   *
   * @param {object} $section - section DOM element
   */
  IdskAccordion.prototype.setInitialState = function ($section) {
    if (this.browserSupportsSessionStorage) {
      var $button = $section.querySelector('.' + this.sectionButtonClass);

      if ($button) {
        var contentId = $button.getAttribute('aria-controls');
        var contentState = contentId
          ? window.sessionStorage.getItem(contentId)
          : null;

        if (contentState !== null) {
          this.setExpanded(contentState === 'true', $section);
        }
      }
    }
  };

  /* eslint-disable */

  var KEY_SPACE$2 = 32;
  var DEBOUNCE_TIMEOUT_IN_SECONDS$1 = 1;

  /**
   * JavaScript enhancements for the Button component
   *
   * @param {object} $module - HTML element to use for button
   */
  function IdskButton ($module) {
    this.$module = $module;
    this.debounceFormSubmitTimer = null;
  }

  /**
   * JavaScript 'shim' to trigger the click event of element(s) when the space key is pressed.
   *
   * Created since some Assistive Technologies (for example some Screenreaders)
   * will tell a user to press space on a 'button', so this functionality needs to be shimmed
   * See https://github.com/alphagov/govuk_elements/pull/272#issuecomment-233028270
   *
   * @param {object} event - event
   */
  IdskButton.prototype.handleKeyDown = function (event) {
    // get the target element
    var target = event.target;
    // if the element has a role='button' and the pressed key is a space, we'll simulate a click
    if (target.getAttribute('role') === 'button' && event.keyCode === KEY_SPACE$2) {
      event.preventDefault();
      // trigger the target's click event
      target.click();
    }
  };

  /**
   * If the click quickly succeeds a previous click then nothing will happen.
   * This stops people accidentally causing multiple form submissions by
   * double clicking buttons.
   *
   * @param {object} event - event
   * @returns {boolean|undefined} - false if the click should be prevented
   */
  IdskButton.prototype.debounce = function (event) {
    var target = event.target;
    // Check the button that is clicked on has the preventDoubleClick feature enabled
    if (target.getAttribute('data-prevent-double-click') !== 'true') {
      return
    }

    // If the timer is still running then we want to prevent the click from submitting the form
    if (this.debounceFormSubmitTimer) {
      event.preventDefault();
      return false
    }

    this.debounceFormSubmitTimer = setTimeout(
      function () {
        this.debounceFormSubmitTimer = null;
      }.bind(this),
      DEBOUNCE_TIMEOUT_IN_SECONDS$1 * 1000
    );
  };

  /**
   * Initialise an event listener for keydown at document level
   * this will help listening for later inserted elements with a role="button"
   */
  IdskButton.prototype.init = function () {
    this.$module.addEventListener('keydown', this.handleKeyDown);
    this.$module.addEventListener('click', this.debounce);
  };

  // Implementation of common function is gathered in the `common` folder

  /* eslint-disable */

  /**
   * Crossroad Component
   */
  function IdskCrossroad ($module) {
    this.$module = $module;
    this.$items = $module.querySelectorAll('.idsk-crossroad-title');
  }

  /**
   * Crossroad init function
   */
  IdskCrossroad.prototype.init = function () {
    var $module = this.$module;
    var $items = this.$items;
    var $uncollapseButton = $module.querySelector(
      '#idsk-crossroad__uncollapse-button'
    );

    if (!$module || !$items) {
      return
    }

    if ($uncollapseButton) {
      // eslint-disable-next-line es-x/no-function-prototype-bind
      $uncollapseButton.addEventListener('click', this.handleShowItems.bind(this));
    }

    $items.forEach(
      function ($item) {
        $item.addEventListener('click', this.handleItemClick.bind(this));
      }.bind(this)
    );
  };

  /**
   * Crossroad handleItemClick callback
   */
  IdskCrossroad.prototype.handleItemClick = function (e) {
    var $item = e.target;
    $item.setAttribute('aria-current', 'true');
  };

  /**
   * Crossroad setAriaLabel callback
   */
  IdskCrossroad.prototype.setAriaLabel = function (arr) {
    arr.forEach(function (item) {
      if (item.classList.contains('idsk-crossroad__arria-hidden')) {
        item.setAttribute('aria-hidden', 'true');
        toggleClass(item, 'idsk-crossroad__arria-hidden');
      } else if (item.getAttribute('aria-hidden') === 'true') {
        item.setAttribute('aria-hidden', 'false');
        toggleClass(item, 'idsk-crossroad__arria-hidden');
      }
    });
  };

  /**
   * Crossroad handleShowItems callback
   */
  IdskCrossroad.prototype.handleShowItems = function (e) {
    var $crossroadItems = this.$module.querySelectorAll('.idsk-crossroad__item');
    var $uncollapseButton = this.$module.querySelector(
      '#idsk-crossroad__uncollapse-button'
    );
    var $uncollapseDiv = this.$module.querySelector(
      '.idsk-crossroad__uncollapse-div'
    );
    var $crossroadTitles = this.$module.querySelectorAll('.idsk-crossroad-title');
    var $crossroadSubtitles = this.$module.querySelectorAll(
      '.idsk-crossroad-subtitle'
    );
    var $expandedButton = this.$module.querySelector(
      '.idsk-crossroad__colapse--button'
    );

    $crossroadItems.forEach(function (crossroadItem) {
      toggleClass(crossroadItem, 'idsk-crossroad__item--two-columns-show');
    });

    this.setAriaLabel($crossroadTitles);
    this.setAriaLabel($crossroadSubtitles);

    $uncollapseButton.innerHTML =
      $uncollapseButton.textContent === $uncollapseButton.dataset.line1
        ? $uncollapseButton.dataset.line2
        : $uncollapseButton.dataset.line1;

    toggleClass(e.srcElement, 'idsk-crossroad__colapse--button-show');
    toggleClass($uncollapseDiv, 'idsk-crossroad__collapse--shadow');
    toggleClass($uncollapseDiv, 'idsk-crossroad__collapse--arrow');
    if (
      $expandedButton.classList.contains('idsk-crossroad__colapse--button-show')
    ) {
      $expandedButton.setAttribute('aria-expanded', 'true');
      $expandedButton.setAttribute(
        'aria-label',
        $expandedButton.getAttribute('data-text-for-show')
      );
    } else {
      $expandedButton.setAttribute('aria-expanded', 'false');
      $expandedButton.setAttribute(
        'aria-label',
        $expandedButton.getAttribute('data-text-for-hide')
      );
    }
  };

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

  /* eslint-disable */

  /**
   * Feedback for extended websites
   */
  function IdskFeedback ($module) {
    this.$module = $module;
  }

  /**
   * Feedback init function
   */
  IdskFeedback.prototype.init = function () {
    var $module = this.$module;
    // check for module
    if (!$module) {
      return
    }

    var $textAreaCharacterCount = $module.querySelector(
      '#idsk-feedback__question-bar #feedback'
    );
    var $sendButton = $module.querySelector('#idsk-feedback__send-button');
    var $radioButtons = $module.querySelectorAll('.idsk-feedback__radio-button');

    if ($radioButtons) {
      var $self = this;
      // Handle $radioButtons click events
      $radioButtons.forEach(function ($radioButton) {
        $radioButton.addEventListener(
          'click',
          $self.handleRadioButtonClick.bind($self)
        );
      });
    }

    if ($sendButton) {
      $sendButton.addEventListener('click', this.handleSendButtonClick.bind(this));
    }

    if ($textAreaCharacterCount) {
      $textAreaCharacterCount.addEventListener(
        'input',
        this.handleStatusOfCharacterCountButton.bind(this)
      );
    }
  };

  /**
   * Feedback handleSendButtonClick handler
   */
  IdskFeedback.prototype.handleSendButtonClick = function (e) {
    var $thanksForFeedbackBar = this.$module.querySelector(
      '.idsk-feedback__thanks'
    );
    var $feedbackContent = this.$module.querySelector('.idsk-feedback__content');

    $feedbackContent.classList.add('idsk-feedback--hidden');
    $thanksForFeedbackBar.classList.remove('idsk-feedback--hidden');
  };

  /**
   * Feedback handleRadioButtonClick handler
   */
  IdskFeedback.prototype.handleRadioButtonClick = function (e) {
    var $improoveQuestionBar = this.$module.querySelector(
      '#idsk-feedback__question-bar'
    );

    if (e.srcElement.classList.contains('idsk-feedback-textarea--show')) {
      $improoveQuestionBar.classList.add('idsk-feedback--open');
      $improoveQuestionBar.classList.remove('idsk-feedback--invisible');
    } else {
      $improoveQuestionBar.classList.remove('idsk-feedback--open');
      $improoveQuestionBar.classList.add('idsk-feedback--invisible');
    }
  };

  /**
   * Feedback handleStatusOfCharacterCountButton handler
   */
  IdskFeedback.prototype.handleStatusOfCharacterCountButton = function (e) {
    var $textAreaCharacterCount = this.$module.querySelector('#feedback');
    var $remainingCharacterCountMessage =
      this.$module.querySelector('#feedback-info');

    var $submitButton = this.$module.querySelector('#idsk-feedback__send-button');

    setTimeout(function () {
      if (
        $textAreaCharacterCount.classList.contains('govuk-textarea--error') ||
        $remainingCharacterCountMessage.classList.contains('govuk-error-message')
      ) {
        $submitButton.disabled = true;
      } else {
        $submitButton.disabled = false;
      }
    }, 300);
  };

  /* eslint-disable */

  /**
   * Footer for extended websites
   */
  function IdskFooterExtended ($module) {
    this.$module = $module;
  }

  /**
   * FooterExtended init function
   */
  IdskFooterExtended.prototype.init = function () {
    var $module = this.$module;
    // check for module
    if (!$module) {
      return
    }

    var $yesButton = $module.querySelector(
      '#idsk-footer-extended-feedback-yes-button'
    );
    var $noButton = $module.querySelector(
      '#idsk-footer-extended-feedback-no-button'
    );
    var $errorButton = $module.querySelector('#idsk-footer-extended-error-button');
    var $closeErrorFormButton = $module.querySelector(
      '#idsk-footer-extended-close-error-form-button'
    );
    var $closeHelpFormButton = $module.querySelector(
      '#idsk-footer-extended-close-help-form-button'
    );
    var $textAreaCharacterCount = $module.querySelector(
      '#idsk-footer-extended-error-form #with-hint'
    );
    var $submitErrorButton = $module.querySelector('#submit-button-error-form');
    var $writeUsButton = $module.querySelector(
      '#idsk-footer-extended-write-us-button'
    );
    var $upButton = $module.querySelector('#footer-extended-up-button');

    if ($yesButton && $noButton) {
      $yesButton.addEventListener('click', this.handleYesButtonClick.bind(this));
      $noButton.addEventListener('click', this.handleNoButtonClick.bind(this));
    }

    if ($errorButton) {
      $errorButton.addEventListener(
        'click',
        this.handleErrorButtonClick.bind(this)
      );
    }

    if ($writeUsButton) {
      $writeUsButton.addEventListener(
        'click',
        this.handleErrorButtonClick.bind(this)
      );
    }

    if ($closeHelpFormButton) {
      $closeHelpFormButton.addEventListener(
        'click',
        this.handleCloseHelpFormButtonClick.bind(this)
      );
    }

    if ($closeErrorFormButton) {
      $closeErrorFormButton.addEventListener(
        'click',
        this.handleCloseErrorFormButtonClick.bind(this)
      );
    }

    if ($submitErrorButton) {
      $submitErrorButton.addEventListener(
        'click',
        this.handleSubmitButtonClick.bind(this)
      );
    }

    if ($textAreaCharacterCount) {
      $textAreaCharacterCount.addEventListener(
        'input',
        this.handleStatusOfCharacterCountButton.bind(this)
      );
    }

    // Get the button
    // When the user scrolls down window screen heiht From the top of the document, show the button
    if ($upButton != null) {
      window.addEventListener('scroll', this.scrollFunction.bind(this));
    }
  };

  /**
   * FooterExtended handleSubmitButtonClick handler
   */
  IdskFooterExtended.prototype.handleSubmitButtonClick = function (e) {
    var $noOption = this.$module.querySelector('#idsk-footer-extended-help-form');
    var $errorOption = this.$module.querySelector(
      '#idsk-footer-extended-error-form'
    );
    var $infoQuestion = this.$module.querySelector(
      '#idsk-footer-extended-info-question'
    );
    var $heartSymbol = this.$module.querySelector('#idsk-footer-extended-heart');
    var $feedbackQuestion = this.$module.querySelector(
      '#idsk-footer-extended-feedback'
    );
    var $helpAndErrorContainer = this.$module.querySelector(
      '#idsk-footer-extended-feedback-content'
    );

    toggleClass($helpAndErrorContainer, 'idsk-footer-extended-feedback-content');
    $noOption.classList.add('idsk-footer-extended-display-hidden');
    $errorOption.classList.add('idsk-footer-extended-display-hidden');
    $noOption.classList.remove('idsk-footer-extended-open');
    $errorOption.classList.remove('idsk-footer-extended-open');

    toggleClass($infoQuestion, 'idsk-footer-extended-heart');
    toggleClass($heartSymbol, 'idsk-footer-extended-heart-visible');
    toggleClass($feedbackQuestion, 'idsk-footer-extended-display-none');

    var $selection = this.$module.querySelector('#sort');
    var $issueTextArea = this.$module.querySelector('#with-hint');
    var $feedbackInfo = this.$module.querySelector(
      '.idsk-footer-extended__feedback-info'
    );

    var selectedOption = $selection.value;
    var issueText = $issueTextArea.value;

    if ($feedbackInfo) {
      var email = $feedbackInfo.getAttribute('data-email');
      var subject = $feedbackInfo.getAttribute('data-subject');
      var emailBody = $feedbackInfo.textContent;
      emailBody = emailBody
        .replace('%issue%', selectedOption)
        .replace('%description%', issueText);
      document.location =
        'mailto:' + email + '?subject=' + subject + '&body=' + emailBody;
    }
  };

  /**
   * FooterExtended handleStatusOfCharacterCountButton handler
   */
  IdskFooterExtended.prototype.handleStatusOfCharacterCountButton = function (e) {
    var $textAreaCharacterCount = this.$module.querySelector('#with-hint');
    var $remainingCharacterCountMessage =
      this.$module.querySelector('#with-hint-info');

    var $submitButton = this.$module.querySelector('#submit-button-error-form');

    setTimeout(function () {
      if (
        $textAreaCharacterCount.classList.contains('govuk-textarea--error') ||
        $remainingCharacterCountMessage.classList.contains('govuk-error-message')
      ) {
        $submitButton.disabled = true;
      } else {
        $submitButton.disabled = false;
      }
    }, 300);
  };

  /**
   * Hiding feedback question text and showing thank notice with heart
   */
  IdskFooterExtended.prototype.handleYesButtonClick = function (e) {
    var $noOption = this.$module.querySelector('#idsk-footer-extended-help-form');
    var $errorOption = this.$module.querySelector(
      '#idsk-footer-extended-error-form'
    );
    var $infoQuestion = this.$module.querySelector(
      '#idsk-footer-extended-info-question'
    );
    var $heartSymbol = this.$module.querySelector('#idsk-footer-extended-heart');

    $noOption.classList.add('idsk-footer-extended-display-hidden');
    $errorOption.classList.add('idsk-footer-extended-display-hidden');

    toggleClass($infoQuestion, 'idsk-footer-extended-heart');
    toggleClass($heartSymbol, 'idsk-footer-extended-heart-visible');
    $heartSymbol.setAttribute('aria-label', 'Ďakujeme za Vašu spätnú väzbu');
  };

  /**
   * Hiding feedback question element and showing help form with animation
   */
  IdskFooterExtended.prototype.handleNoButtonClick = function (e) {
    var $helpOption = this.$module.querySelector(
      '#idsk-footer-extended-help-form'
    );
    var $feedbackQuestion = this.$module.querySelector(
      '#idsk-footer-extended-feedback'
    );
    var $helpInfo = this.$module.querySelector('.idsk-footer-extended-form-text');
    var $footerButton = this.$module.querySelector('#fill-feedback-help-form');

    var $helpAndErrorContainer = this.$module.querySelector(
      '#idsk-footer-extended-feedback-content'
    );

    toggleClass($helpAndErrorContainer, 'idsk-footer-extended-feedback-content');
    toggleClass($feedbackQuestion, 'idsk-footer-extended-display-none');
    toggleClass($helpOption, 'idsk-footer-extended-display-hidden');
    toggleClass($helpOption, 'idsk-footer-extended-open');
    $helpInfo.setAttribute(
      'aria-label',
      'Aby sme vedeli zlepšiť obsah na tejto stránke, chceli by sme vedieť o Vašej skúsenosti so stránkou. Pošleme Vám link na formulár spätnej väzby. Jeho vyplnenie Vám zaberie iba 2 minúty.'
    );
    $footerButton.setAttribute('aria-label', 'Vyplniť prieskum');
  };

  /**
   * Hiding feedback question element and showing error form with animation
   */
  IdskFooterExtended.prototype.handleErrorButtonClick = function (e) {
    var $errorOption = this.$module.querySelector(
      '#idsk-footer-extended-error-form'
    );
    var $helpOption = this.$module.querySelector(
      '#idsk-footer-extended-help-form'
    );
    var $feedbackQuestion = this.$module.querySelector(
      '#idsk-footer-extended-feedback'
    );

    var $helpAndErrorContainer = this.$module.querySelector(
      '#idsk-footer-extended-feedback-content'
    );

    toggleClass($helpAndErrorContainer, 'idsk-footer-extended-feedback-content');
    toggleClass($feedbackQuestion, 'idsk-footer-extended-display-none');
    $helpOption.classList.add('idsk-footer-extended-display-hidden');
    $helpOption.classList.remove('idsk-footer-extended-open');
    toggleClass($errorOption, 'idsk-footer-extended-display-hidden');
    toggleClass($errorOption, 'idsk-footer-extended-open');
  };

  /**
   * Hiding error form with animation and showing feedback question element
   */
  IdskFooterExtended.prototype.handleCloseErrorFormButtonClick = function (e) {
    var $errorOption = this.$module.querySelector(
      '#idsk-footer-extended-error-form'
    );
    var $feedbackQuestion = this.$module.querySelector(
      '#idsk-footer-extended-feedback'
    );
    var $helpAndErrorContainer = this.$module.querySelector(
      '#idsk-footer-extended-feedback-content'
    );

    toggleClass($helpAndErrorContainer, 'idsk-footer-extended-feedback-content');
    toggleClass($feedbackQuestion, 'idsk-footer-extended-display-none');
    toggleClass($errorOption, 'idsk-footer-extended-open');
    toggleClass($errorOption, 'idsk-footer-extended-display-hidden');
  };

  /**
   * Hiding help form with animation and showing feedback question element
   */
  IdskFooterExtended.prototype.handleCloseHelpFormButtonClick = function () {
    var $helpOption = this.$module.querySelector(
      '#idsk-footer-extended-help-form'
    );
    var $feedbackQuestion = this.$module.querySelector(
      '#idsk-footer-extended-feedback'
    );
    var $helpAndErrorContainer = this.$module.querySelector(
      '#idsk-footer-extended-feedback-content'
    );

    toggleClass($helpAndErrorContainer, 'idsk-footer-extended-feedback-content');
    toggleClass($feedbackQuestion, 'idsk-footer-extended-display-none');
    toggleClass($helpOption, 'idsk-footer-extended-open');
    toggleClass($helpOption, 'idsk-footer-extended-display-hidden');
  };

  /**
   * FooterExtended scrollFunction handler
   */
  IdskFooterExtended.prototype.scrollFunction = function () {
    var $upButton = this.$module.querySelector('#footer-extended-up-button');

    if (
      window.innerWidth > 768 &&
      (document.body.scrollTop > window.screen.height ||
        document.documentElement.scrollTop > window.screen.height)
    ) {
      $upButton.style.display = 'block';
    } else {
      $upButton.style.display = 'none';
    }
  };

  /* eslint-disable */

  /**
   * Header component
   *
   * @class
   * @param {Element} $module - HTML element to use for header
   */
  function IdskHeader($module) {
    this.$module = $module;
  }

  /**
   * Initialise header
   */
  IdskHeader.prototype.init = function () {
    // Check for module
    var $module = this.$module;
    if (!$module) {
      return
    }

    // Check for button
    var $toggleButton = $module.querySelector('.govuk-js-header-toggle');
    if (!$toggleButton) {
      return
    }

    // Handle $toggleButton click events
    $toggleButton.addEventListener('click', this.handleClick.bind(this));
  };

  /**
   * Toggle class
   *
   * @param {object} node - element
   * @param {string} className - className to toggle
   */
  IdskHeader.prototype.toggleClass = function (node, className) {
    if (node.className.indexOf(className) > 0) {
      node.className = node.className.replace(' ' + className, '');
    } else {
      node.className += ' ' + className;
    }
  };

  /**
   * An event handler for click event on $toggleButton
   *
   * @param {object} event - event
   */
  IdskHeader.prototype.handleClick = function (event) {
    var $module = this.$module;
    var $toggleButton = event.target || event.srcElement;
    var $target = $module.querySelector('#' + $toggleButton.getAttribute('aria-controls'));

    // If a button with aria-controls, handle click
    if ($toggleButton && $target) {
      toggleClass($target, 'idsk-header__navigation--open');
      toggleClass($toggleButton, 'idsk-header__menu-button--open');

      $toggleButton.setAttribute('aria-expanded', $toggleButton.getAttribute('aria-expanded') !== 'true');
      $target.setAttribute('aria-hidden', ($target.getAttribute('aria-hidden') === 'false').toString());
    }
  };

  /* eslint-disable */

  /**
   * Header for extended websites
   */
  function IdskHeaderExtended ($module) {
    this.$module = $module;
    this.$lastMenuElement = '';
    this.$firstMenuElement = '';
  }

  /**
   * HeaderExtended init function
   */
  IdskHeaderExtended.prototype.init = function () {
    var $module = this.$module;
    // check for module
    if (!$module) {
      return
    }

    // check for search component
    var $searchComponents = $module.querySelectorAll(
      '.idsk-header-extended__search'
    );
    if ($searchComponents) {
      $searchComponents.forEach(
        function ($searchComponent) {
          $searchComponent.addEventListener(
            'change',
            this.handleSearchChange.bind(this)
          );
          // trigger change event
          $searchComponent.dispatchEvent(new Event('change'));
        }.bind(this)
      );
    }

    // check for language switcher
    var $toggleLanguageSwitchers = $module.querySelectorAll(
      '.idsk-header-extended__language-button'
    );
    if ($toggleLanguageSwitchers) {
      // Handle $toggleLanguageSwitcher click events
      $toggleLanguageSwitchers.forEach(
        function ($toggleLanguageSwitcher) {
          $toggleLanguageSwitcher.addEventListener(
            'click',
            this.handleLanguageSwitcherClick.bind(this)
          );
          $toggleLanguageSwitcher.addEventListener(
            'focus',
            this.handleLanguageSwitcherClick.bind(this)
          );
        }.bind(this)
      );

      // close language list if i left the last item from langauge list e.g. if user use tab key for navigations
      var $lastLanguageItems = $module.querySelectorAll(
        '.idsk-header-extended__language-list-item:last-child .idsk-header-extended__language-list-link'
      );
      $lastLanguageItems.forEach(
        function ($lastLanguageItem) {
          $lastLanguageItem.addEventListener(
            'blur',
            this.checkBlurLanguageSwitcherClick.bind(this)
          );
        }.bind(this)
      );
    }

    // check for menu items
    var $menuItems = $module.querySelectorAll('.idsk-header-extended__link');
    if ($menuItems) {
      // Handle $menuItem click events
      $menuItems.forEach(
        function ($menuItem) {
          $menuItem.addEventListener('click', this.handleSubmenuClick.bind(this));
          $menuItem.addEventListener('focus', this.handleSubmenuClick.bind(this));
        }.bind(this)
      );
    }

    // check for menu button and close menu button
    var $hamburgerMenuButton = $module.querySelector(
      '.idsk-js-header-extended-side-menu'
    );
    var $closeMenuButton = $module.querySelector(
      '.idsk-header-extended__mobile-close'
    );
    if ($hamburgerMenuButton && $closeMenuButton) {
      this.initMobileMenuTabbing();
      $hamburgerMenuButton.addEventListener(
        'click',
        this.showMobileMenu.bind(this)
      );
      $closeMenuButton.addEventListener('click', this.hideMobileMenu.bind(this));
    }

    window.addEventListener('scroll', this.scrollFunction.bind(this));

    $module.boundCheckBlurMenuItemClick = this.checkBlurMenuItemClick.bind(this);
    $module.boundCheckBlurLanguageSwitcherClick =
      this.checkBlurLanguageSwitcherClick.bind(this);

    // check for cookies

    if (!window.localStorage.getItem('acceptedCookieBanner')) {
      $module.classList.add('idsk-header-extended--cookie');
      var $cookieBanner = document.querySelector('.idsk-cookie-banner');

      if ($cookieBanner) {
        // scroll handler
        window.addEventListener('scroll', function () {
          var headerPosition = document.body.getBoundingClientRect().top;
          // @ts-ignore
          var cookieBannerHeight = $cookieBanner.offsetHeight;
          if (headerPosition < -cookieBannerHeight) {
            $module.classList.remove('idsk-header-extended--cookie');
            $module.style.top = '0px';
          } else {
            $module.classList.add('idsk-header-extended--cookie');
            $module.style.top = cookieBannerHeight.toString() + 'px';
          }
        });

        // cookie resize handler
        var resizeObserver = new ResizeObserver(function () {
          // @ts-ignore
          $module.style.top = $cookieBanner.offsetHeight.toString() + 'px';
        });

        resizeObserver.observe($cookieBanner);
      }
    }
  };

  /**
   * Hide label if search input is not empty
   *
   * @param {object} e
   */
  IdskHeaderExtended.prototype.handleSearchChange = function (e) {
    var $searchInput = e.target || e.srcElement;
    var $search = $searchInput.closest('.idsk-header-extended__search');
    var $searchLabel = $search.querySelector('label');
    if ($searchInput.value) {
      $searchLabel.classList.add('idsk-header-extended__search-input--focus');
    } else {
      $searchLabel.classList.remove('idsk-header-extended__search-input--focus');
    }
  };

  /**
   * Handle open/hide language switcher
   *
   * @param {object} e
   */
  IdskHeaderExtended.prototype.handleLanguageSwitcherClick = function (e) {
    var $toggleButton = e.target || e.srcElement;
    // var $target = $toggleButton.closest('.idsk-header-extended__language');
    this.$activeSearch = $toggleButton.closest('.idsk-header-extended__language');
    toggleClass(this.$activeSearch, 'idsk-header-extended__language--active');
    document.addEventListener(
      'click',
      this.$module.boundCheckBlurLanguageSwitcherClick,
      true
    );
  };

  /**
   * handle click outside language switcher or "blur" the item link
   */
  IdskHeaderExtended.prototype.checkBlurLanguageSwitcherClick = function () {
    // var $target = this.$module.querySelectorAll('.idsk-header-extended__language');
    this.$activeSearch.classList.remove('idsk-header-extended__language--active');
    document.removeEventListener(
      'click',
      this.$module.boundCheckBlurLanguageSwitcherClick,
      true
    );
  };

  /**
   * Handle open/hide submenu
   *
   * @param {object} e
   */
  IdskHeaderExtended.prototype.handleSubmenuClick = function (e) {
    var $srcEl = e.target || e.srcElement;
    var $toggleButton = $srcEl.closest('.idsk-header-extended__navigation-item');
    var $currActiveList = this.$module.querySelectorAll(
      '.idsk-header-extended__navigation-item--active'
    );

    if ($currActiveList.length > 0) {
      $currActiveList[0].classList.remove(
        'idsk-header-extended__navigation-item--active'
      );
    }
    toggleClass($toggleButton, 'idsk-header-extended__navigation-item--active');

    document.addEventListener(
      'click',
      this.$module.boundCheckBlurMenuItemClick,
      true
    );
  };

  /**
   * handle click outside menu or "blur" the item link
   */
  IdskHeaderExtended.prototype.checkBlurMenuItemClick = function () {
    var $currActiveList = this.$module.querySelectorAll(
      '.idsk-header-extended__navigation-item--active'
    );
    $currActiveList[0].classList.remove(
      'idsk-header-extended__navigation-item--active'
    );
    document.removeEventListener(
      'click',
      this.$module.boundCheckBlurMenuItemClick,
      true
    );
  };

  /**
   * Show mobile menu
   *
   * @param {object} e
   */
  IdskHeaderExtended.prototype.showMobileMenu = function (e) {
    var $hamburgerMenuButton = this.$module.querySelector(
      '.idsk-js-header-extended-side-menu'
    );

    this.$module.classList.add('idsk-header-extended--show-mobile-menu');
    document.getElementsByTagName('body')[0].style.overflow = 'hidden';
    if (document.activeElement === $hamburgerMenuButton) {
      // @ts-ignore
      this.$lastMenuElement.focus();
    }
  };
  /**
   * Hide mobile menu
   *
   * @param {object} e
   */
  IdskHeaderExtended.prototype.hideMobileMenu = function (e) {
    var $hamburgerMenuButton = this.$module.querySelector(
      '.idsk-js-header-extended-side-menu'
    );

    this.$module.classList.remove('idsk-header-extended--show-mobile-menu');
    document.getElementsByTagName('body')[0].style.overflow = 'visible';
    $hamburgerMenuButton.focus();
  };

  /**
   * Create loop in mobile menu for tabbing elements
   */
  IdskHeaderExtended.prototype.initMobileMenuTabbing = function () {
    // Get header extended mobile menu focusable elements
    var $headerExtended = this.$module.querySelectorAll(
      '.idsk-header-extended__mobile'
    )[0];
    var $mobileMenuElements = $headerExtended.querySelectorAll(
      'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])'
    );
    this.$firstMenuElement = $mobileMenuElements[0];
    this.$lastMenuElement = $mobileMenuElements[$mobileMenuElements.length - 1];
    var KEYCODE_TAB = 9;

    document.addEventListener(
      'keydown',
      function (e) {
        var isTabPressed = e.key === 'Tab' || e.keyCode === KEYCODE_TAB;

        if (!isTabPressed) {
          return
        }

        if (e.shiftKey) {
          // shift + tab
          if (document.activeElement === this.$firstMenuElement) {
            this.$lastMenuElement.focus();
            e.preventDefault();
          }
        } else if (document.activeElement === this.$lastMenuElement) {
          // tab
          this.$firstMenuElement.focus();
          e.preventDefault();
        }
      }.bind(this)
    );
  };

  /**
   * When the user scrolls down from the top of the document, resize the navbar's padding and the logo
   */
  IdskHeaderExtended.prototype.scrollFunction = function () {
    var $module = this.$module;

    if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
      $module.classList.add('idsk-header-extended--shrink');
    } else if (
      document.body.scrollTop < 10 &&
      document.documentElement.scrollTop < 10
    ) {
      $module.classList.remove('idsk-header-extended--shrink');
    }
  };

  /* eslint-disable */

  /**
   * Header for web websites
   */
  function IdskHeaderWeb ($module) {
    this.$module = $module;
  }

  /**
   * HeaderWeb init function
   */
  IdskHeaderWeb.prototype.init = function () {
    var $module = this.$module;
    // check for module
    if (!$module) {
      return
    }

    // check for banner
    var $banner = $module.querySelector('.idsk-header-web__banner');
    this.$lastScrollTopPosition = 0;

    if ($banner) {
      document.addEventListener('scroll', this.handleToggleBanner.bind(this));
    }

    // check for close banner button
    var $bannerCloseBtn = $module.querySelector('.idsk-header-web__banner-close');

    if ($bannerCloseBtn) {
      $bannerCloseBtn.addEventListener('click', this.handleCloseBanner.bind(this));
    }

    // check for language switcher
    this.$languageBtn = $module.querySelector(
      '.idsk-header-web__brand-language-button'
    );

    if (this.$languageBtn) {
      // Handle esc button press
      var $languageSwitcher = $module.querySelector(
        '.idsk-header-web__brand-language'
      );
      $languageSwitcher.addEventListener(
        'keydown',
        this.languageEscPressed.bind(this)
      );

      // Handle $languageBtn click events
      this.$languageBtn.addEventListener(
        'click',
        this.handleLanguageSwitcherClick.bind(this)
      );

      // close language list if i left the last item from langauge list e.g. if user use tab key for navigations
      var $lastLanguageItems = $module.querySelectorAll(
        '.idsk-header-web__brand-language-list-item:last-child .idsk-header-web__brand-language-list-item-link'
      );
      $lastLanguageItems.forEach(
        function ($lastLanguageItem) {
          $lastLanguageItem.addEventListener(
            'blur',
            this.checkBlurLanguageSwitcherClick.bind(this)
          );
        }.bind(this)
      );

      // close language list if user back tabbing
      this.$languageBtn.addEventListener(
        'keydown',
        this.handleBackTabbing.bind(this)
      );
    }

    $module.boundCheckBlurLanguageSwitcherClick =
      this.checkBlurLanguageSwitcherClick.bind(this);

    // check for e-goverment button
    var $eGovermentButtons = $module.querySelectorAll(
      '.idsk-header-web__brand-gestor-button'
    );
    this.$eGovermentSpacer = $module.querySelector(
      '.idsk-header-web__brand-spacer'
    );
    if ($eGovermentButtons.length > 0) {
      // Handle $eGovermentButton click event
      $eGovermentButtons.forEach(
        function ($eGovermentButton) {
          $eGovermentButton.addEventListener(
            'click',
            this.handleEgovermentClick.bind(this)
          );
        }.bind(this)
      );
    }

    // check for menu items
    var $menuList = $module.querySelector('.idsk-header-web__nav-list');
    var $menuItems = $module.querySelectorAll(
      '.idsk-header-web__nav-list-item-link'
    );
    if ($menuItems && $menuList) {
      // Handle $menuItem click events
      $menuItems.forEach(
        function ($menuItem) {
          $menuItem.addEventListener('click', this.handleSubmenuClick.bind(this));
          if (
            $menuItem.parentElement.querySelector(
              '.idsk-header-web__nav-submenu'
            ) ||
            $menuItem.parentElement.querySelector(
              '.idsk-header-web__nav-submenulite'
            )
          ) {
            $menuItem.parentElement.lastElementChild.addEventListener(
              'keydown',
              this.menuTabbing.bind(this)
            );
          }
        }.bind(this)
      );
      $module.addEventListener('keydown', this.navEscPressed.bind(this));
    }

    // check for mobile menu button
    this.$menuButton = $module.querySelector(
      '.idsk-header-web__main-headline-menu-button'
    );
    if (this.$menuButton) {
      this.$menuButton.addEventListener('click', this.showMobileMenu.bind(this));
      this.menuBtnText = this.$menuButton.innerText.trim();
      this.initMobileMenuTabbing();
    }

    $module.boundCheckBlurMenuItemClick = this.checkBlurMenuItemClick.bind(this);
  };

  /**
   * Handle toggle banner on scrolling
   *
   * @param {object} e
   * @returns {boolean|void} False if mobile menu is open
   */
  IdskHeaderWeb.prototype.handleToggleBanner = function (e) {
    // ignore if mobile menu is open
    if (!this.$module.querySelector('.idsk-header-web__nav--mobile')) {
      return false
    }

    // @ts-ignore
    var $scrollTop = window.pageYOffset || document.scrollTop;
    if ($scrollTop > this.$lastScrollTopPosition) {
      this.$module
        .querySelector('.idsk-header-web__banner')
        .classList.add('idsk-header-web__banner--scrolled');
    } else if ($scrollTop < this.$lastScrollTopPosition) {
      this.$module
        .querySelector('.idsk-header-web__banner')
        .classList.remove('idsk-header-web__banner--scrolled');
    }

    // $scrollTop is not used, because element idsk-header-web__banner change height of header
    // @ts-ignore
    this.$lastScrollTopPosition = window.pageYOffset || document.scrollTop;
  };

  /**
   * Handle close banner
   *
   * @param {object} e
   */
  IdskHeaderWeb.prototype.handleCloseBanner = function (e) {
    var $closeButton = e.target || e.srcElement;
    var $banner = $closeButton.closest('.idsk-header-web__banner');
    $banner.classList.add('idsk-header-web__banner--hide');
  };

  /**
   * Handle open/hide language switcher
   *
   * @param {object} e
   */
  IdskHeaderWeb.prototype.handleLanguageSwitcherClick = function (e) {
    var $toggleButton = e.target || e.srcElement;
    this.$activeSearch = $toggleButton.closest('.idsk-header-web__brand-language');
    toggleClass(this.$activeSearch, 'idsk-header-web__brand-language--active');
    if (
      this.$activeSearch.classList.contains(
        'idsk-header-web__brand-language--active'
      )
    ) {
      this.$activeSearch.firstElementChild.setAttribute('aria-expanded', 'true');
      this.$activeSearch.firstElementChild.setAttribute(
        'aria-label',
        this.$activeSearch.firstElementChild.getAttribute('data-text-for-hide')
      );
    } else {
      this.$activeSearch.firstElementChild.setAttribute('aria-expanded', 'false');
      this.$activeSearch.firstElementChild.setAttribute(
        'aria-label',
        this.$activeSearch.firstElementChild.getAttribute('data-text-for-show')
      );
    }
    document.addEventListener(
      'click',
      this.$module.boundCheckBlurLanguageSwitcherClick,
      true
    );
  };

  /**
   * HeaderWeb checkBlurLanguageSwitcherClick handler
   */
  IdskHeaderWeb.prototype.checkBlurLanguageSwitcherClick = function (e) {
    if (!e.target.classList.contains('idsk-header-web__brand-language-button')) {
      this.$activeSearch.classList.remove(
        'idsk-header-web__brand-language--active'
      );
      this.$activeSearch.firstElementChild.setAttribute('aria-expanded', 'false');
      this.$activeSearch.firstElementChild.setAttribute(
        'aria-label',
        this.$activeSearch.firstElementChild.getAttribute('data-text-for-show')
      );
      document.removeEventListener(
        'click',
        this.$module.boundCheckBlurLanguageSwitcherClick,
        true
      );
    }
  };

  /**
   * HeaderWeb handleBackTabbing handler
   */
  IdskHeaderWeb.prototype.handleBackTabbing = function (e) {
    // shift was down when tab was pressed
    if (
      e.shiftKey &&
      e.keyCode === 9 &&
      document.activeElement === this.$languageBtn
    ) ;
  };

  /**
   * HeaderWeb languageEscPressed handler
   */
  IdskHeaderWeb.prototype.languageEscPressed = function (e) {
    if (
      e.key === 'Escape' &&
      this.$languageBtn.getAttribute('aria-expanded') === 'true'
    ) {
      this.handleLanguageSwitcherClick(e);
    }
  };

  /**
   * Handle open/hide e-goverment statement
   *
   * @param {object} e
   */
  IdskHeaderWeb.prototype.handleEgovermentClick = function (e) {
    var $eGovermentButtons = this.$module.querySelectorAll(
      '.idsk-header-web__brand-gestor-button'
    );
    var $eGovermentDropdown = this.$module.querySelector(
      '.idsk-header-web__brand-dropdown'
    );
    toggleClass($eGovermentDropdown, 'idsk-header-web__brand-dropdown--active');
    toggleClass(this.$eGovermentSpacer, 'idsk-header-web__brand-spacer--active');
    $eGovermentButtons.forEach(
      function ($eGovermentButton) {
        toggleClass(
          $eGovermentButton,
          'idsk-header-web__brand-gestor-button--active'
        );
        if (
          $eGovermentButton.classList.contains(
            'idsk-header-web__brand-gestor-button--active'
          )
        ) {
          $eGovermentButton.setAttribute('aria-expanded', 'true');
          $eGovermentButton.setAttribute(
            'aria-label',
            $eGovermentButton.getAttribute('data-text-for-hide')
          );
        } else {
          $eGovermentButton.setAttribute('aria-expanded', 'false');
          $eGovermentButton.setAttribute(
            'aria-label',
            $eGovermentButton.getAttribute('data-text-for-show')
          );
        }
      }.bind(this)
    );
  };

  /**
   * Handle open/hide submenu
   *
   * @param {object} e
   */
  IdskHeaderWeb.prototype.handleSubmenuClick = function (e) {
    var $srcEl = e.target || e.srcElement;
    var $toggleButton = $srcEl.closest('.idsk-header-web__nav-list-item');
    var $currActiveItem = this.$module.querySelector(
      '.idsk-header-web__nav-list-item--active'
    );

    if ($currActiveItem && $currActiveItem.isEqualNode($toggleButton)) {
      $currActiveItem.classList.remove('idsk-header-web__nav-list-item--active');
      if ($toggleButton.childNodes[3]) {
        $currActiveItem.childNodes[1].setAttribute('aria-expanded', 'false');
        $toggleButton.childNodes[1].setAttribute(
          'aria-label',
          $toggleButton.childNodes[1].getAttribute('data-text-for-show')
        );
      }
    } else {
      if ($currActiveItem) {
        $currActiveItem.classList.remove('idsk-header-web__nav-list-item--active');
      }
      toggleClass($toggleButton, 'idsk-header-web__nav-list-item--active');

      if (
        $toggleButton.childNodes[3] &&
        $toggleButton.classList.contains('idsk-header-web__nav-list-item--active')
      ) {
        $toggleButton.childNodes[1].setAttribute('aria-expanded', 'true');
        $toggleButton.childNodes[1].setAttribute(
          'aria-label',
          $toggleButton.childNodes[1].getAttribute('data-text-for-hide')
        );
        if (window.screen.width <= 768) {
          $toggleButton.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }

    document.addEventListener(
      'click',
      this.$module.boundCheckBlurMenuItemClick.bind(this),
      true
    );
  };

  /**
   * Remove active class from menu when user leaves menu with tabbing
   */
  IdskHeaderWeb.prototype.menuTabbing = function (e) {
    var isTabPressed = e.key === 'Tab' || e.keyCode === 9;

    if (!isTabPressed) {
      return
    }

    var $submenuList = e.srcElement.parentElement.parentElement;
    var $activeItem = $submenuList.closest('.idsk-header-web__nav-list-item');
    // shift + tab
    if (e.shiftKey) {
      if (
        document.activeElement ===
        $submenuList.firstElementChild.firstElementChild
      ) {
        $activeItem.classList.remove('idsk-header-web__nav-list-item--active');
        $activeItem.childNodes[1].setAttribute('aria-expanded', 'false');
        $activeItem.childNodes[1].setAttribute(
          'aria-label',
          $activeItem.childNodes[1].getAttribute('data-text-for-show')
        );
      }
      // tab
    } else if (
      document.activeElement === $submenuList.lastElementChild.lastElementChild
    ) {
      $activeItem.classList.remove('idsk-header-web__nav-list-item--active');
      $activeItem.childNodes[1].setAttribute('aria-expanded', 'false');
      $activeItem.childNodes[1].setAttribute(
        'aria-label',
        $activeItem.childNodes[1].getAttribute('data-text-for-show')
      );
    }
  };

  /**
   * Remove active class from menu when user leaves menu with esc
   */
  IdskHeaderWeb.prototype.navEscPressed = function (e) {
    if (e.key === 'Escape') {
      var $menuList = e.srcElement.parentElement.parentElement;
      if (
        $menuList.classList.contains('idsk-header-web__nav-submenulite-list') ||
        $menuList.classList.contains('idsk-header-web__nav-submenu-list')
      ) {
        $menuList = $menuList.closest('.idsk-header-web__nav-list');
      }
      var $activeItem = $menuList.querySelector(
        '.idsk-header-web__nav-list-item--active'
      );
      if ($activeItem) {
        $activeItem.classList.remove('idsk-header-web__nav-list-item--active');
        $activeItem.childNodes[1].setAttribute('aria-expanded', 'false');
        $activeItem.childNodes[1].setAttribute(
          'aria-label',
          $activeItem.childNodes[1].getAttribute('data-text-for-show')
        );
        $activeItem.childNodes[1].focus();
      } else if (this.$menuButton.getAttribute('aria-expanded') === 'true') {
        // Hide mobile menu if navigation is not active
        this.showMobileMenu();
      }
    }
  };

  /**
   * handle click outside menu or "blur" the item link
   */
  IdskHeaderWeb.prototype.checkBlurMenuItemClick = function (e) {
    var $currActiveItem = this.$module.querySelector(
      '.idsk-header-web__nav-list-item--active'
    );
    if (
      $currActiveItem &&
      !e.target.classList.contains('idsk-header-web__nav-list-item-link')
    ) {
      $currActiveItem.classList.remove('idsk-header-web__nav-list-item--active');
      if ($currActiveItem.childNodes[3]) {
        $currActiveItem.childNodes[1].setAttribute('aria-expanded', 'false');
        $currActiveItem.childNodes[1].setAttribute(
          'aria-label',
          $currActiveItem.childNodes[1].getAttribute('data-text-for-show')
        );
      }
      document.removeEventListener(
        'click',
        this.$module.boundCheckBlurMenuItemClick,
        true
      );
    }
  };

  /**
   * Show mobile menu
   */
  IdskHeaderWeb.prototype.showMobileMenu = function () {
    var closeText = this.menuBtnText ? 'Zavrieť' : '';
    var $mobileMenu = this.$module.querySelector('.idsk-header-web__nav');
    toggleClass($mobileMenu, 'idsk-header-web__nav--mobile');
    toggleClass(
      this.$menuButton,
      'idsk-header-web__main-headline-menu-button--active'
    );
    if (
      !this.$menuButton.classList.contains(
        'idsk-header-web__main-headline-menu-button--active'
      )
    ) {
      this.$menuButton.setAttribute('aria-expanded', 'false');
      this.$menuButton.setAttribute(
        'aria-label',
        this.$menuButton.getAttribute('data-text-for-show')
      );
    } else {
      this.$menuButton.setAttribute('aria-expanded', 'true');
      this.$menuButton.setAttribute(
        'aria-label',
        this.$menuButton.getAttribute('data-text-for-hide')
      );
    }
    var buttonIsActive = this.$menuButton.classList.contains(
      'idsk-header-web__main-headline-menu-button--active'
    );

    this.$menuButton.childNodes[0].nodeValue = buttonIsActive
      ? closeText
      : this.menuBtnText;
  };

  /**
   * Create loop in mobile menu for tabbing elements
   */
  IdskHeaderWeb.prototype.initMobileMenuTabbing = function () {
    var $menuItems = this.$module.querySelector('.idsk-header-web__nav');
    var $focusableElements = Array.from(
      $menuItems.querySelectorAll(
        'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])'
      )
    ).filter(function (s) {
      return window.getComputedStyle(s).getPropertyValue('display') !== 'none'
    });
    var $menuButton = this.$menuButton;
    var $lastMenuItem = $focusableElements[$focusableElements.length - 1];
    var KEYCODE_TAB = 9;

    $menuButton.addEventListener('keydown', function (e) {
      var isTabPressed = e.key === 'Tab' || e.keyCode === KEYCODE_TAB;

      if (
        isTabPressed &&
        e.shiftKey &&
        e.target.getAttribute('aria-expanded') === 'true'
      ) {
        $lastMenuItem.focus();
        e.preventDefault();
      }
    });

    $lastMenuItem.addEventListener('keydown', function (e) {
      var isTabPressed = e.key === 'Tab' || e.keyCode === KEYCODE_TAB;

      if (isTabPressed && !e.shiftKey && $menuButton.offsetParent !== null) {
        $menuButton.focus();
        e.preventDefault();
      }
    });
  };

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

  /* eslint-disable */
  /* eslint-disable es-x/no-function-prototype-bind -- Polyfill imported */

  /**
   * RegistrationForEvent Component
   *
   * @param {object} $module - HTML element to use for RegistrationForEvent component
   */
  function IdskRegistrationForEvent ($module) {
    this.$module = $module;
  }

  /**
   * RegistrationForEvent Component init function
   */
  IdskRegistrationForEvent.prototype.init = function () {
    // Check for module
    var $module = this.$module;
    if (!$module) {
      return
    }

    // Check for button
    var $submitButtons = $module.querySelectorAll(
      '.idsk-registration-for-event-js-submit'
    );
    if (!$submitButtons) {
      return
    }

    // Handle $submitButtons click events
    $submitButtons.forEach(
      function ($submitButton) {
        $submitButton.addEventListener('click', this.handleSubmitClick.bind(this));
      }.bind(this)
    );
  };

  /**
   * RegistrationForEvent Component handle submit click function
   */
  IdskRegistrationForEvent.prototype.handleSubmitClick = function (e) {
    e.preventDefault();

    var $module = this.$module;
    var $form = $module.querySelector('.idsk-registration-for-event__form');
    var $thankYouMsg = $module.querySelector(
      '.idsk-registration-for-event__thank-you-msg'
    );
    var $requiredFormItems = $module.querySelectorAll('[required]');
    var $valid = true;
    var emailRegex = /\S+@\S+\.\S+/;

    $requiredFormItems.forEach(function ($item) {
      var $formGroup = $item.closest('.govuk-form-group');

      if (
        !$item.checkValidity() ||
        ($item.type === 'email' && !emailRegex.test($item.value))
      ) {
        $formGroup.querySelector('.govuk-error-message').style.display = 'block';
        $formGroup.classList.add('govuk-form-group--error');
        $item.classList.add('govuk-input--error');
        $valid = false;
      } else {
        $formGroup.querySelector('.govuk-error-message').style.display = 'none';
        $formGroup.classList.remove('govuk-form-group--error');
        $item.classList.remove('govuk-input--error');
      }
    });

    if ($valid) {
      $thankYouMsg.style.display = 'block';
      $form.style.display = 'none';
    }
  };

  /* eslint-disable */

  /**
   * Search Component
   *
   * @param {object} $module - HTML element to use for search component
   */
  function IdskSearchComponent ($module) {
    this.$module = $module;
  }

  /**
   * Search Component init function
   */
  IdskSearchComponent.prototype.init = function () {
    // Check for module
    var $module = this.$module;
    if (!$module) {
      return
    }

    var $searchInputs = $module.querySelectorAll('.idsk-search-component__input');
    if (!$searchInputs) {
      return
    }

    $searchInputs.forEach(
      function ($searchInput) {
        $searchInput.addEventListener('change', this.handleSearchInput.bind(this));
      }.bind(this)
    );
  };

  /**
   * Handle search input
   *
   * @param {object} e
   */
  IdskSearchComponent.prototype.handleSearchInput = function (e) {
    var $el = e.target || e.srcElement || e;
    var $searchComponent = $el.closest('.idsk-search-component');
    var $searchLabel = $searchComponent.querySelector('label');

    if ($el.value === '') {
      $searchLabel.classList.remove('govuk-visually-hidden');
    } else {
      $searchLabel.classList.add('govuk-visually-hidden');
    }
  };

  /* eslint-disable */

  /**
   * Search Results component
   *
   * @param {object} $module - HTML element to use for search component
   */
  function IdskSearchResults ($module) {
    this.$module = $module;
  }

  /**
   * Search Results init function
   */
  IdskSearchResults.prototype.init = function () {
    // Check for module
    if (!this.$module) {
      return
    }
    var $module = this.$module;
    $module.resultCards = [];
    $module.countOfCardsPerPage = Number();
    $module.currentPageNumber = Number();
    $module.subTopicButton = $module.querySelector(
      '.idsk-search-results__subtopic'
    );

    if ($module.subTopicButton) {
      $module.subTopicButton.disabled = true;
    }

    // Check for button
    var $links = $module.querySelectorAll('.idsk-search-results__link');
    if (!$links) {
      return
    }

    var $resultsPerPageDropdown = $module.querySelector(
      '.idsk-search-results__content .govuk-select'
    );
    if (!$resultsPerPageDropdown) {
      return
    }

    var $backButton = $module.querySelector('.idsk-search-results__button--back');
    if (!$backButton) {
      return
    }

    var $forwardButton = $module.querySelector(
      '.idsk-search-results__button--forward'
    );
    if (!$forwardButton) {
      return
    }

    var $backButtonMobile = $module.querySelector(
      '.idsk-search-results__button--back__mobile'
    );
    if (!$backButton) {
      return
    }

    var $forwardButtonMobile = $module.querySelector(
      '.idsk-search-results__button--forward__mobile'
    );
    if (!$forwardButton) {
      return
    }

    $module.resultCards = $module.querySelectorAll('.idsk-search-results__card');
    if (!$module.resultCards) {
      return
    }

    var $linkPanelButtons = $module.querySelectorAll(
      '.idsk-search-results__link-panel-button'
    );
    if (!$linkPanelButtons) {
      return
    }

    var $filtersButtonMobile = $module.querySelector(
      '.idsk-search-results__filters__button'
    );
    if (!$filtersButtonMobile) {
      return
    }

    var $turnFiltersOffButtonMobile = $module.querySelector(
      '.idsk-search-results__button--turn-filters-off'
    );
    if (!$turnFiltersOffButtonMobile) {
      return
    }

    var $showResultsButtonMobile = $module.querySelector(
      '.idsk-search-results__button-show-results'
    );
    if (!$showResultsButtonMobile) {
      return
    }

    var $backToResultsButtonMobile = $module.querySelector(
      '.idsk-search-results__button--back-to-results'
    );
    if (!$backToResultsButtonMobile) {
      return
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

    var $dateFrom = $module.querySelector('#datum-od');
    var $dateTo = $module.querySelector('#datum-do');

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

    if ($dateFrom) {
      $dateFrom.addEventListener(
        'focusout',
        this.handleFillDate.bind(this, 'from')
      );
      if ($dateFrom.value !== '') {
        this.handleFillDate.call(this, 'from', $dateFrom);
      }
      $dateTo.addEventListener('focusout', this.handleFillDate.bind(this, 'to'));
      if ($dateTo.value !== '') {
        this.handleFillDate.call(this, 'to', $dateTo);
      }
    }

    $backButton.addEventListener('click', this.handleClickPreviousPage.bind(this));
    $forwardButton.addEventListener('click', this.handleClickNextPage.bind(this));
    $backButtonMobile.addEventListener(
      'click',
      this.handleClickPreviousPage.bind(this)
    );
    $forwardButtonMobile.addEventListener(
      'click',
      this.handleClickNextPage.bind(this)
    );
    $filtersButtonMobile.addEventListener(
      'click',
      this.handleClickFiltersButton.bind(this)
    );
    $turnFiltersOffButtonMobile.addEventListener(
      'click',
      this.handleClickTurnFiltersOffButton.bind(this)
    );
    $showResultsButtonMobile.addEventListener(
      'click',
      this.handleClickShowResultsButton.bind(this)
    );
    $backToResultsButtonMobile.addEventListener(
      'click',
      this.handleClickShowResultsButton.bind(this)
    );
    $module.boundHandleClickLinkPanel = this.handleClickLinkPanel.bind(this);

    // set selected value in dropdown
    $module.countOfCardsPerPage = $resultsPerPageDropdown.value;
    $module.currentPageNumber = 1;
    this.showResultCardsPerPage.call(this, 0, $resultsPerPageDropdown.value);
    $resultsPerPageDropdown.addEventListener(
      'change',
      this.handleClickResultsPerPageDropdown.bind(this)
    );
    $filtersButtonMobile.innerText = $filtersButtonMobile.title + '(0)';

    $linkPanelButtons.forEach(
      function ($button) {
        $button.addEventListener('click', $module.boundHandleClickLinkPanel, true);
      }.bind(this)
    );

    $radioButtonsInput.forEach(
      function ($input) {
        $input.addEventListener(
          'click',
          this.handleClickRadioButton.bind(this),
          true
        );
        if ($input.checked) {
          this.handleClickRadioButton.call(this, $input);
        }
      }.bind(this)
    );

    $contentTypeCheckBoxes.forEach(
      function ($checkBox) {
        $checkBox.addEventListener(
          'click',
          this.handleClickContentTypeCheckBox.bind(this),
          true
        );
        if ($checkBox.checked) {
          this.handleClickContentTypeCheckBox.call(this, $checkBox);
        }
      }.bind(this)
    );

    this.handleClickFiltersButton.call(this);
    this.handleClickShowResultsButton.call(this);
  };

  /**
   * function for handling show results button and 'back to results' button in mobile view
   * hiding and showing elements - mobile version only
   *
   * @param {object} e - click event
   */
  IdskSearchResults.prototype.handleClickShowResultsButton = function (e) {
    var $module = this.$module;
    var $filterBar = $module.querySelector('.idsk-search-results__filter');
    var $searchBar = $module.querySelector(
      '.idsk-search-results .idsk-search-results__search-bar'
    );
    var $searchBarTitle = $module.querySelector(
      '.idsk-search-results .idsk-intro-block__search__span'
    );
    var $orderByDropdown = $module.querySelector(
      '.idsk-search-results--order__dropdown'
    );
    var $resultsPerPage = $module.querySelector(
      '.idsk-search-results__filter-panel--mobile'
    );
    var $orderByDropdownMobile = $module.querySelector(
      '.idsk-search-results--order'
    );
    var $pagingMobile = $module.querySelector(
      '.idsk-search-results__page-number--mobile'
    );
    var $pagingDesktop = $module.querySelector(
      '.idsk-search-results__content__page-changer'
    );
    var $searchResultsAll = $module.querySelector(
      '.idsk-search-results__content__all'
    );
    var $filterHeaderPanel = $module.querySelector(
      '.idsk-search-results__filter-header-panel'
    );
    var $pickedFiltersPanel = $module.querySelector(
      '.idsk-search-results__content__picked-filters'
    );
    var $showResultsButton = $module.querySelector(
      '.idsk-search-results__show-results__button'
    );
    var $contentContainer = $module.querySelector('.idsk-search-results__content');
    var $title = $module.querySelector('.idsk-search-results__title');
    var $header = document.getElementsByTagName('header');
    var $footer = document.getElementsByTagName('footer');
    var $breadcrumbs = document.getElementsByClassName('govuk-breadcrumbs');

    $title.classList.remove('idsk-search-results--invisible__mobile');
    $contentContainer.classList.remove('idsk-search-results--invisible__mobile');
    $showResultsButton.classList.add('idsk-search-results--invisible');
    $pickedFiltersPanel.classList.add('idsk-search-results--invisible__mobile');
    $filterBar.classList.remove('idsk-search-results--visible');
    $filterHeaderPanel.classList.remove(
      'idsk-search-results--visible__mobile--inline'
    );
    $searchResultsAll.classList.remove('idsk-search-results--invisible__mobile');
    $pagingMobile.classList.remove('idsk-search-results--invisible');
    $pagingDesktop.classList.remove('idsk-search-results--invisible__mobile');
    $searchBar.classList.remove('idsk-search-results--invisible__mobile');
    if ($searchBarTitle) {
      $searchBarTitle.classList.remove('idsk-search-results--invisible__mobile');
    }
    $orderByDropdown.classList.remove('idsk-search-results--invisible__mobile');
    $resultsPerPage.classList.remove('idsk-search-results--invisible__mobile');
    $orderByDropdownMobile.classList.remove('idsk-search-results--invisible');
    if ($header[0] && $footer[0] && $breadcrumbs[0]) {
      $header[0].classList.remove('idsk-search-results--invisible__mobile');
      $footer[0].classList.remove('idsk-search-results--invisible__mobile');
      $breadcrumbs[0].classList.remove('idsk-search-results--invisible__mobile');
    }
  };

  /**
   * function for handling whether is some filter picked, because of hiding and showing elements in container with picked items
   *
   * @param {object} e - click event
   * @returns {boolean} - true if some filter is picked, false if not
   */
  IdskSearchResults.prototype.handleSomeFilterPicked = function (e) {
    var $module = this.$module;
    var $contentContainer = $module.querySelector('.idsk-search-results__content');
    var $pickedTopics = $module.querySelectorAll(
      '.idsk-search-results__picked-topic'
    );
    var $pickedContentTypes = $module.querySelectorAll(
      '.idsk-search-results__picked-content-type'
    );
    var $pickedDates = $module.querySelectorAll(
      '.idsk-search-results__picked-date'
    );
    var $isFilterPicked =
      $pickedTopics.length > 0 ||
      $pickedContentTypes.length > 0 ||
      $pickedDates.length > 0;

    if ($isFilterPicked) {
      $contentContainer.classList.remove('idsk-search-results--invisible__mobile');
    } else {
      $contentContainer.classList.add('idsk-search-results--invisible__mobile');
    }

    return $isFilterPicked
  };

  /**
   * function for counting selected filters, for mobile button 'Filters' purposes
   *
   */
  IdskSearchResults.prototype.handleCountForFiltersButton = function (e) {
    var $module = this.$module;
    var $pickedTopics = $module.querySelectorAll(
      '.idsk-search-results__picked-topic'
    );
    var $pickedContentTypes = $module.querySelectorAll(
      '.idsk-search-results__picked-content-type'
    );
    var $pickedDates = $module.querySelectorAll(
      '.idsk-search-results__picked-date'
    );
    var $filtersButtonMobile = $module.querySelector(
      '.idsk-search-results__filters__button'
    );
    var $countOfPickedFilters =
      $pickedTopics.length + $pickedContentTypes.length + $pickedDates.length;

    $filtersButtonMobile.innerText =
      $filtersButtonMobile.title + '(' + $countOfPickedFilters + ')';
  };

  /**
   * function for disabling all picked filters
   *
   */
  IdskSearchResults.prototype.handleClickTurnFiltersOffButton = function (e) {
    var $module = this.$module;
    var $contentContainer = $module.querySelector('.idsk-search-results__content');
    var $pickedTopics = $module.querySelectorAll(
      '.idsk-search-results__picked-topic'
    );
    var $pickedContentTypes = $module.querySelectorAll(
      '.idsk-search-results__picked-content-type'
    );
    var $pickedDates = $module.querySelectorAll(
      '.idsk-search-results__picked-date'
    );
    var $filtersButtonMobile = $module.querySelector(
      '.idsk-search-results__filters__button'
    );

    $contentContainer.classList.add('idsk-search-results--invisible__mobile');
    $filtersButtonMobile.innerText = $filtersButtonMobile.title + '(0)';

    $pickedTopics.forEach(
      function ($topic) {
        this.handleRemovePickedTopic.call(this, $topic);
      }.bind(this)
    );

    $pickedContentTypes.forEach(
      function ($contentType) {
        this.handleRemovePickedContentType.call(this, $contentType);
      }.bind(this)
    );

    $pickedDates.forEach(
      function ($date) {
        this.handleRemovePickedDate.call(this, $date);
      }.bind(this)
    );
  };

  /**
   * function for changing view for mobile after click on "Filters" button
   *
   */
  IdskSearchResults.prototype.handleClickFiltersButton = function (e) {
    var $module = this.$module;
    var $filterBar = $module.querySelector('.idsk-search-results__filter');
    var $searchBar = $module.querySelector(
      '.idsk-search-results .idsk-search-results__search-bar'
    );
    var $searchBarTitle = $module.querySelector(
      '.idsk-search-results .idsk-intro-block__search__span'
    );
    var $orderByDropdown = $module.querySelector(
      '.idsk-search-results--order__dropdown'
    );
    var $resultsPerPage = $module.querySelector(
      '.idsk-search-results__filter-panel--mobile'
    );
    var $orderByDropdownMobile = $module.querySelector(
      '.idsk-search-results--order'
    );
    var $pagingMobile = $module.querySelector(
      '.idsk-search-results__page-number--mobile'
    );
    var $pagingDesktop = $module.querySelector(
      '.idsk-search-results__content__page-changer'
    );
    var $searchResultsAll = $module.querySelector(
      '.idsk-search-results__content__all'
    );
    var $filterHeaderPanel = $module.querySelector(
      '.idsk-search-results__filter-header-panel'
    );
    var $pickedFiltersPanel = $module.querySelector(
      '.idsk-search-results__content__picked-filters'
    );
    var $showResultsButton = $module.querySelector(
      '.idsk-search-results__show-results__button'
    );
    var $title = $module.querySelector('.idsk-search-results__title');
    var $header = document.getElementsByTagName('header');
    var $footer = document.getElementsByTagName('footer');
    var $breadcrumbs = document.getElementsByClassName('govuk-breadcrumbs');

    if (this.handleSomeFilterPicked.call(this)) {
      $showResultsButton.classList.remove('idsk-search-results--invisible');
      $pickedFiltersPanel.classList.remove(
        'idsk-search-results--invisible__mobile'
      );
    }

    $title.classList.add('idsk-search-results--invisible__mobile');
    $filterBar.classList.add('idsk-search-results--visible');
    $filterHeaderPanel.classList.add(
      'idsk-search-results--visible__mobile--inline'
    );
    $searchResultsAll.classList.add('idsk-search-results--invisible__mobile');
    $pagingMobile.classList.add('idsk-search-results--invisible');
    $pagingDesktop.classList.add('idsk-search-results--invisible__mobile');
    $searchBar.classList.add('idsk-search-results--invisible__mobile');
    if ($searchBarTitle) {
      $searchBarTitle.classList.add('idsk-search-results--invisible__mobile');
    }
    $orderByDropdown.classList.add('idsk-search-results--invisible__mobile');
    $resultsPerPage.classList.add('idsk-search-results--invisible__mobile');

    if ($header[0] && $footer[0] && $breadcrumbs[0]) {
      $header[0].classList.add('idsk-search-results--invisible__mobile');
      $footer[0].classList.add('idsk-search-results--invisible__mobile');
      $breadcrumbs[0].classList.add('idsk-search-results--invisible__mobile');
    }
    $orderByDropdownMobile.classList.add('idsk-search-results--invisible');
  };

  /**
   * SearchResults handleClickPreviousPage handler
   *
   * @param {object} e - click event
   */
  IdskSearchResults.prototype.handleClickPreviousPage = function (e) {
    var $module = this.$module;

    location.href = '#';
    $module.currentPageNumber = $module.currentPageNumber - 1;
    this.showResultCardsPerPage.call(
      this,
      $module.countOfCardsPerPage * ($module.currentPageNumber - 1),
      $module.countOfCardsPerPage * $module.currentPageNumber
    );
  };

  /**
   * SearchResults handleClickNextPage handler
   *
   * @param {object} e - click event
   */
  IdskSearchResults.prototype.handleClickNextPage = function (e) {
    var $module = this.$module;

    location.href = '#';
    $module.currentPageNumber = $module.currentPageNumber + 1;
    this.showResultCardsPerPage.call(
      this,
      $module.countOfCardsPerPage * ($module.currentPageNumber - 1),
      $module.countOfCardsPerPage * $module.currentPageNumber
    );
  };

  /**
   * SearchResults handleClickResultsPerPageDropdown handler
   *
   * @param {object} e - click event
   */
  IdskSearchResults.prototype.handleClickResultsPerPageDropdown = function (e) {
    var $el = e.target || e.srcElement;
    var $module = this.$module;

    $module.countOfCardsPerPage = $el.value;
    this.showResultCardsPerPage.call(this, 0, $el.value);
  };

  /**
   * SearchResults handleSearchItemsFromInput handler
   *
   * @param {string} $type - search type
   * @param {object} e - click event
   */
  IdskSearchResults.prototype.handleSearchItemsFromInput = function ($type, e) {
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
   * SearchResults handleFillDate handler
   *
   * @param {string} $period - search date period
   * @param {object} e - click event
   */
  IdskSearchResults.prototype.handleFillDate = function ($period, e) {
    var $el = e.target || e.srcElement || e;
    var $module = this.$module;
    var $choosenDatesInFiltersContainer = $module.querySelector(
      '.idsk-search-results__content__picked-filters__date'
    );
    var $class = 'idsk-search-results__picked-date';
    var $dateElementInContainer = $choosenDatesInFiltersContainer.querySelector(
      '[data-source="' + $el.id + '"]'
    );
    var $contentContainer = $module.querySelector('.idsk-search-results__content');

    if (
      $el.value === '' ||
      !(
        $el.value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/) ||
        $el.value.match(/^(\d{4})$/)
      )
    ) {
      return
    }

    if ($el.value && !$dateElementInContainer) {
      var $contentTypePicked = this.createTopicInContainer.call(
        this,
        $choosenDatesInFiltersContainer,
        $el.id,
        $class,
        $el,
        $el.id === 'datum-od'
      );
    } else if ($dateElementInContainer) {
      $contentTypePicked = $dateElementInContainer;
      $contentTypePicked.innerHTML = $el.value + ' &#10005;';
    }

    $contentContainer.classList.remove('idsk-search-results--invisible__mobile');
    $contentTypePicked.addEventListener(
      'click',
      this.handleRemovePickedDate.bind(this)
    );
    $el.value = '';
    $choosenDatesInFiltersContainer.classList.remove(
      'idsk-search-results--invisible'
    );
    this.checkValuesInDateContainer.call(this);
    this.changeBackgroundForPickedFilters.call(this);
  };

  /**
   * SearchResults handleRemovePickedDate handler
   *
   * @param {object} e - click event
   */
  IdskSearchResults.prototype.handleRemovePickedDate = function (e) {
    var $el = e.target || e.srcElement || e;

    $el.remove();
    this.handleSomeFilterPicked.call(this);
    this.checkValuesInDateContainer.call(this);
    this.handleCountForFiltersButton.call(this);
    this.changeBackgroundForPickedFilters.call(this);
  };

  /**
   * SearchResults createSpanElement handler
   *
   * @param {string} $class - element class
   * @param {string} $text - element inner value
   * @returns {object} - span element
   */
  IdskSearchResults.prototype.createSpanElement = function ($class, $text) {
    var $spanElement = document.createElement('span');
    $spanElement.setAttribute('class', $class);
    $spanElement.innerHTML = $text;

    return $spanElement
  };

  /**
   * function for checking whether is there any date items selected in container
   *
   */
  IdskSearchResults.prototype.checkValuesInDateContainer = function (e) {
    var $choosenDatesInFiltersContainer = this.$module.querySelector(
      '.idsk-search-results__content__picked-filters__date'
    );
    var $beforeDateClass = 'idsk-search-results__before-date';
    var $afterDateClass = 'idsk-search-results__after-date';
    var $beforeDateSpan = $choosenDatesInFiltersContainer.querySelector(
      '.' + $beforeDateClass
    );
    var $afterDateSpan = $choosenDatesInFiltersContainer.querySelector(
      '.' + $afterDateClass
    );

    if (
      !$choosenDatesInFiltersContainer.querySelector(
        '[data-source="datum-od"]'
      ) &&
      !$choosenDatesInFiltersContainer.querySelector('[data-source="datum-do"]')
    ) {
      $choosenDatesInFiltersContainer.classList.add(
        'idsk-search-results--invisible'
      );
      return
    }

    if (
      $choosenDatesInFiltersContainer.querySelector('[data-source="datum-od"]') &&
      $choosenDatesInFiltersContainer.querySelector('[data-source="datum-do"]')
    ) {
      $beforeDateSpan = this.createSpanElement.call(
        this,
        $beforeDateClass,
        $choosenDatesInFiltersContainer.dataset.lines +
          ' ' +
          $choosenDatesInFiltersContainer.dataset.middle
      );
      $afterDateSpan = this.createSpanElement.call(this, $afterDateClass, 'a ');

      $choosenDatesInFiltersContainer.insertBefore(
        $beforeDateSpan,
        $choosenDatesInFiltersContainer.querySelector('[data-source="datum-od"]')
      );
      $choosenDatesInFiltersContainer.insertBefore(
        $afterDateSpan,
        $choosenDatesInFiltersContainer.querySelector('[data-source="datum-do"]')
      );
    } else if (
      $choosenDatesInFiltersContainer.querySelector('[data-source="datum-od"]')
    ) {
      $beforeDateSpan = this.createSpanElement.call(
        this,
        $beforeDateClass,
        $choosenDatesInFiltersContainer.dataset.lines +
          ' ' +
          $choosenDatesInFiltersContainer.dataset.after
      );
      $choosenDatesInFiltersContainer.insertBefore(
        $beforeDateSpan,
        $choosenDatesInFiltersContainer.querySelector('[data-source="datum-od"]')
      );
    } else if (
      $choosenDatesInFiltersContainer.querySelector('[data-source="datum-do"]')
    ) {
      $afterDateSpan = this.createSpanElement.call(
        this,
        $afterDateClass,
        $choosenDatesInFiltersContainer.dataset.lines +
          ' ' +
          $choosenDatesInFiltersContainer.dataset.before
      );
      $choosenDatesInFiltersContainer.insertBefore(
        $afterDateSpan,
        $choosenDatesInFiltersContainer.querySelector('[data-source="datum-do"]')
      );
    }
  };

  /**
   * function for changing number of cards on page
   *
   * @param {number} $startIndex - start index
   * @param {number} $endIndex - end index
   */
  IdskSearchResults.prototype.showResultCardsPerPage = function (
    $startIndex,
    $endIndex
  ) {
    var $module = this.$module;
    var $backButton = $module.querySelector('.idsk-search-results__button--back');
    var $forwardButton = $module.querySelector(
      '.idsk-search-results__button--forward'
    );
    var $backButtonMobile = $module.querySelector(
      '.idsk-search-results__button--back__mobile'
    );
    var $forwardButtonMobile = $module.querySelector(
      '.idsk-search-results__button--forward__mobile'
    );
    var $pageNumberMobile = $module.querySelector(
      '.idsk-search-results__page-number__mobile'
    );
    var $i;

    // hide all cards
    $module.resultCards.forEach(
      function ($card) {
        if (!$card.classList.contains('idsk-search-results--invisible')) {
          $card.classList.add('idsk-search-results--invisible');
        }
      }.bind(this)
    );

    if ($endIndex >= $module.resultCards.length) {
      $endIndex = $module.resultCards.length;
      $forwardButton.classList.add('idsk-search-results--hidden');
      $backButton.classList.remove('idsk-search-results--hidden');
      $forwardButtonMobile.classList.add('idsk-search-results--hidden');
      $backButtonMobile.classList.remove('idsk-search-results--hidden');
    } else {
      $forwardButton.classList.remove('idsk-search-results--hidden');
      $forwardButtonMobile.classList.remove('idsk-search-results--hidden');
    }

    if ($startIndex < 0) {
      $startIndex = 0;
    } else if ($startIndex > 0) {
      $backButton.classList.remove('idsk-search-results--hidden');
      $backButtonMobile.classList.remove('idsk-search-results--hidden');
    } else if ($startIndex === 0) {
      $module.currentPageNumber = 1;
    }

    for ($i = $startIndex; $i < $endIndex; $i++) {
      $module.resultCards[$i].classList.remove('idsk-search-results--invisible');
    }

    // hide back button if 1st page is showed
    if (
      $startIndex === 0 &&
      !$backButton.classList.contains('idsk-search-results--hidden')
    ) {
      $backButton.classList.add('idsk-search-results--hidden');
      $backButtonMobile.classList.add('idsk-search-results--hidden');
    }

    var $numberOfPages =
      (($module.resultCards.length / $module.countOfCardsPerPage) | 0) + 1;
    var $pageNumberSpan = $module.querySelector(
      '.idsk-search-results__page-number span'
    );
    var $pageNumberText = $pageNumberSpan.dataset.lines
      .replace('$value1', $module.currentPageNumber)
      .replace('$value2', $numberOfPages);
    $pageNumberSpan.innerText = $pageNumberText;
    $pageNumberMobile.innerText = $pageNumberText;
  };

  /**
   * An event handler for click event on $linkPanel - collapse or expand filter
   *
   * @param {object} e - click event
   */
  IdskSearchResults.prototype.handleClickLinkPanel = function (e) {
    var $el = e.target || e.srcElement;
    var $linkPanelButton = $el.closest('.idsk-search-results__link-panel');
    var $contentPanel = $linkPanelButton.querySelector(
      '.idsk-search-results__list'
    );

    toggleClass($contentPanel, 'idsk-search-results--hidden');
    toggleClass($linkPanelButton, 'idsk-search-results--expand');
  };

  /**
   * An event handler for click event on radio button
   *
   * @param {object} e - click event
   */
  IdskSearchResults.prototype.handleClickRadioButton = function (e) {
    var $el = e.target || e.srcElement || e;
    var $module = this.$module;
    var $linkPanelButton = $el.closest('.idsk-search-results__link-panel');
    var $buttonCaption = $linkPanelButton.querySelector(
      '.idsk-search-results__link-panel--span'
    );
    var $choosenFiltersContainer = $module.querySelector(
      '.idsk-search-results__content__picked-filters__topics'
    );
    var $radios = $el.closest('.govuk-radios');
    var $filterContainer = $choosenFiltersContainer.querySelector(
      '[data-source="' + $radios.dataset.id + '"]'
    );
    var $class = 'idsk-search-results__picked-topic';
    var $contentContainer = $module.querySelector('.idsk-search-results__content');
    var $topicPicked;

    // creating or renaming new span element for picked topic
    if ($el.value && !$filterContainer) {
      $topicPicked = this.createTopicInContainer.call(
        this,
        $choosenFiltersContainer,
        $radios.dataset.id,
        $class,
        $el,
        false
      );
      if ($module.subTopicButton) {
        $module.subTopicButton.disabled = false;
      }
    } else if ($filterContainer.dataset.source === $radios.dataset.id) {
      $topicPicked = $filterContainer;
      $topicPicked.innerHTML = $el.value + ' &#10005;';
    } else if ($filterContainer.dataset.source !== $radios.dataset.id) {
      $topicPicked = this.createTopicInContainer.call(
        this,
        $choosenFiltersContainer,
        $radios.dataset.id,
        $class,
        $el,
        false
      );
    }

    $contentContainer.classList.remove('idsk-search-results--invisible__mobile');
    $choosenFiltersContainer.classList.remove('idsk-search-results--invisible');
    $topicPicked.removeEventListener(
      'click',
      this.handleRemovePickedTopic.bind(this),
      true
    );
    $topicPicked.addEventListener(
      'click',
      this.handleRemovePickedTopic.bind(this)
    );
    this.changeBackgroundForPickedFilters.call(this);
    $buttonCaption.innerText = '1 ' + $buttonCaption.dataset.lines;
  };

  /**
   * SearchResults handleClickContentTypeCheckBox handler
   *
   * @param {object} e - click event
   */
  IdskSearchResults.prototype.handleClickContentTypeCheckBox = function (e) {
    var $el = e.target || e.srcElement || e;
    var $module = this.$module;
    var $linkPanelButton = $el.closest('.idsk-search-results__link-panel');
    var $choosenFiltersContainer = $module.querySelector(
      '.idsk-search-results__content__picked-filters__content-type'
    );
    var $checkBoxes = $el.closest('.govuk-checkboxes');
    var $class = 'idsk-search-results__picked-content-type';
    var $contentContainer = $module.querySelector('.idsk-search-results__content');

    if ($el.checked) {
      var $contentTypePicked = this.createTopicInContainer.call(
        this,
        $choosenFiltersContainer,
        $el.id,
        $class,
        $el,
        false
      );
      $contentTypePicked.addEventListener(
        'click',
        this.handleRemovePickedContentType.bind(this)
      );
    } else {
      var $itemToRemove = $module.querySelector('[data-source="' + $el.id + '"]');
      $itemToRemove.remove();
    }

    $contentContainer.classList.remove('idsk-search-results--invisible__mobile');
    $choosenFiltersContainer.classList.remove('idsk-search-results--invisible');
    this.handleCountOfPickedContentTypes.call(this, $checkBoxes, $linkPanelButton);
    this.changeBackgroundForPickedFilters.call(this);
  };

  /**
   * SearchResults handleRemovePickedContentType handler
   *
   * @param {object} e - click event
   */
  IdskSearchResults.prototype.handleRemovePickedContentType = function (e) {
    var $el = e.target || e.srcElement || e;
    var $checkBoxes = this.$module.querySelector(
      '.idsk-search-results__content-type-filter .govuk-checkboxes'
    );
    var $checkBoxToRemove = $checkBoxes.querySelector('#' + $el.dataset.source);
    var $linkPanelButton = $checkBoxes.closest('.idsk-search-results__link-panel');

    $checkBoxToRemove.checked = false;
    $el.remove();
    this.handleSomeFilterPicked.call(this);
    this.handleCountOfPickedContentTypes.call(this, $checkBoxes, $linkPanelButton);
    this.handleCountForFiltersButton.call(this);
    this.changeBackgroundForPickedFilters.call(this);
  };

  /**
   * function for counting selected checkboxes in content type filter
   *
   * @param {object} $checkBoxes - checkboxes element
   * @param {object} $linkPanelButton - link panel button element
   */
  IdskSearchResults.prototype.handleCountOfPickedContentTypes = function (
    $checkBoxes,
    $linkPanelButton
  ) {
    var $choosenFiltersContainer = this.$module.querySelector(
      '.idsk-search-results__content__picked-filters__content-type'
    );
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
      $choosenFiltersContainer.classList.add('idsk-search-results--invisible');
    } else {
      $buttonCaption.innerText = $counter + ' ' + $buttonCaption.dataset.lines;
    }
  };

  /**
   * function for creating element in container, in case of date we need param $insertBeforeFirst to check whether it should be on first position or not
   *
   * @param {object} $chosenFiltersContainer
   * @param {object} $input
   * @param {string} $class
   * @param {object} $el
   * @param {boolean} $insertBeforeFirst
   * @returns {object} $topicPicked - created element
   */
  IdskSearchResults.prototype.createTopicInContainer = function (
    $chosenFiltersContainer,
    $input,
    $class,
    $el,
    $insertBeforeFirst
  ) {
    var $showResultsMobileButton = this.$module.querySelector(
      '.idsk-search-results__show-results__button'
    );
    var $turnFiltersOffMobileButton = this.$module.querySelector(
      '.idsk-search-results__button--turn-filters-off'
    );
    var $pickedFiltersContainer = this.$module.querySelector(
      '.idsk-search-results__content__picked-filters'
    );

    var $topicPicked = document.createElement('button');
    $topicPicked.setAttribute('class', $class);
    $topicPicked.setAttribute('tabindex', '0');
    $topicPicked.setAttribute('data-source', $input);
    $topicPicked.setAttribute('data-id', $el.id);
    $topicPicked.innerHTML = $el.value + ' &#10005;';
    if ($insertBeforeFirst) {
      $chosenFiltersContainer.prepend($topicPicked);
    } else {
      $chosenFiltersContainer.appendChild($topicPicked);
    }

    $pickedFiltersContainer.classList.remove('idsk-search-results--invisible');
    $pickedFiltersContainer.classList.remove(
      'idsk-search-results--invisible__mobile'
    );
    $showResultsMobileButton.classList.remove('idsk-search-results--invisible');
    $turnFiltersOffMobileButton.classList.remove('idsk-search-results--invisible');
    this.handleCountForFiltersButton.call(this);

    return $topicPicked
  };

  /**
   * function for setting grey background for odd elements in picked topics container
   *
   * @param {object} e - click event
   */
  IdskSearchResults.prototype.changeBackgroundForPickedFilters = function (e) {
    var $module = this.$module;
    var $pickedFiltersContainer = $module.querySelector(
      '.idsk-search-results__content__picked-filters'
    );
    var $notEmptySections = $pickedFiltersContainer.querySelectorAll(
      'div:not(.idsk-search-results--invisible)'
    );

    if ($notEmptySections.length === 0) {
      return
    }

    $notEmptySections.forEach(
      function ($section) {
        $section.classList.remove('idsk-search-results--grey');
        $section.classList.remove('idsk-search-results--border');
      }.bind(this)
    );

    var $i;
    for ($i = 0; $i < $notEmptySections.length; $i++) {
      if ($i === 0 || $i === 2) {
        $notEmptySections[$i].classList.add('idsk-search-results--grey');
      }
    }

    $notEmptySections[$notEmptySections.length - 1].classList.add(
      'idsk-search-results--border'
    );
  };

  /**
   * function for disabling 'subtopic' filter, in case of removing topic filter
   *
   * @param {object} e - click event
   */
  IdskSearchResults.prototype.disableSubtopic = function (e) {
    var $contentPanel = this.$module.subTopicButton.parentElement.querySelector(
      '.idsk-search-results__list'
    );

    this.$module.subTopicButton.parentElement.classList.remove(
      'idsk-search-results--expand'
    );
    $contentPanel.classList.add('idsk-search-results--hidden');
    if (this.$module.subTopicButton) {
      this.$module.subTopicButton.disabled = true;
    }
  };

  /**
   * SearchResults handleRemovePickedTopic handler
   *
   * @param {object} e - click event
   */
  IdskSearchResults.prototype.handleRemovePickedTopic = function (e) {
    var $el = e.target || e.srcElement || e;
    var $choosenFiltersContainer = this.$module.querySelector(
      '.idsk-search-results__content__picked-filters__topics'
    );

    if ($el.dataset.source === 'tema') {
      var $subTopic = $choosenFiltersContainer.querySelector(
        '[data-source="podtema"]'
      );
      if ($subTopic) {
        this.removeTopic.call(this, $subTopic, true);
      } else {
        if (this.$module.subTopicButton) {
          this.disableSubtopic.call(this);
        }
      }
      $choosenFiltersContainer.classList.add('idsk-search-results--invisible');
    }

    this.removeTopic.call(this, $el, false);
  };

  /**
   * SearchResults removeTopic handler
   *
   * @param {object} $el - element
   * @param {boolean} $disableFilter - element
   */
  IdskSearchResults.prototype.removeTopic = function ($el, $disableFilter) {
    var $radios = this.$module.querySelector(
      '[data-id="' + $el.dataset.source + '"]'
    );
    var $buttonCaption = $radios.closest('.idsk-search-results__link-panel');

    $buttonCaption.querySelector(
      '.idsk-search-results__link-panel--span'
    ).innerText = '';
    $radios.querySelectorAll('.govuk-radios__input').forEach(
      function ($radio) {
        $radio.checked = false;
      }.bind(this)
    );

    if ($disableFilter && this.$module.subTopicButton) {
      this.disableSubtopic.call(this);
    }

    $el.remove();
    this.handleSomeFilterPicked.call(this);
    this.handleCountForFiltersButton.call(this);
    this.changeBackgroundForPickedFilters.call(this);
  };

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

  /* eslint-disable */

  /**
   * SubscriptionForm
   *
   * @param {object} $module - The module to enhance
   */
  function IdskSubscriptionForm ($module) {
    this.$module = $module;
  }

  /**
   * SubscriptionForm init function
   */
  IdskSubscriptionForm.prototype.init = function () {
    // Check for module
    var $module = this.$module;
    if (!$module) {
      return
    }

    // button to toggle content
    var $form = $module.querySelector('.idsk-subscription-form__submit-handler');
    if ($form) {
      $form.addEventListener('submit', this.handleSubmitForm.bind(this));
    }

    var $input = $module.querySelector('.govuk-input');

    $input.addEventListener('change', this.handleInput.bind(this));
  };

  /**
   * An event handler for submit event on $form
   *
   * @param {object} e - The event object
   */
  IdskSubscriptionForm.prototype.handleSubmitForm = function (e) {
    e.preventDefault();
    var $input = e.target.querySelector('#subscription-email-value');
    var $formGroup = $input.parentElement;

    // Handle email validation
    if (!$input.checkValidity()) {
      $formGroup.querySelectorAll('.govuk-error-message').forEach(function (e) {
        e.remove();
      });
      var $errorLabel = document.createElement('span');
      $errorLabel.classList.add('govuk-error-message');
      $errorLabel.textContent = $input.validationMessage;

      $input.classList.add('govuk-input--error');
      $formGroup.classList.add('govuk-form-group--error');
      $input.before($errorLabel);
      return
    }

    // set class for different state
    this.$module.classList.add('idsk-subscription-form__subscription-confirmed');
  };

  /**
   * SubscriptionForm handleInput handler
   *
   * @param {object} e - The event object
   */
  IdskSubscriptionForm.prototype.handleInput = function (e) {
    var $el = e.target || e.srcElement || e;
    var $searchComponent = $el.closest('.idsk-subscription-form__input');
    var $searchLabel = $searchComponent.querySelector('label');

    // Handle label visibility
    if ($el.value === '') {
      $searchLabel.classList.remove('govuk-visually-hidden');
    } else {
      $searchLabel.classList.add('govuk-visually-hidden');
    }
  };

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

  /* eslint-disable */

  /**
   * TableFilter
   *
   * @param {object} $module - The module to enhance
   */
  function IdskTableFilter ($module) {
    this.$module = $module;
    this.selectedFitlersCount = 0;
    this.$activeFilters = [];

    // get texts
    this.removeAllFiltersText = $module.querySelector(
      '.idsk-table-filter__active-filters'
    ).dataset.removeAllFilters;
    this.removeFilterText = $module.querySelector(
      '.idsk-table-filter__active-filters'
    ).dataset.removeFilter;
  }

  /**
   * TableFilter init function
   */
  IdskTableFilter.prototype.init = function () {
    // Check for module
    var $module = this.$module;
    if (!$module) {
      return
    }

    // button to toggle content
    var $toggleButtons = $module.querySelectorAll('.idsk-filter-menu__toggle');

    // Form with all inputs and selects
    var $form = $module.querySelector('form');

    // all inputs for count of selected filters
    var $filterInputs = $module.querySelectorAll('.govuk-input, .govuk-select');

    $toggleButtons.forEach(
      function ($button) {
        $button.addEventListener('click', this.handleClickTogglePanel.bind(this));
      }.bind(this)
    );

    if ($form) {
      $form.addEventListener(
        'submit',
        function (e) {
          e.preventDefault();
          this.handleSubmitFilter(this);
        }.bind(this)
      );
    }

    $filterInputs.forEach(
      function ($input) {
        // for selects
        $input.addEventListener('change', this.handleFilterValueChange.bind(this));
        // for text inputs
        $input.addEventListener(
          'keyup',
          function (e) {
            // submit if key is enter else change count of used filters
            if (e.key === 'Enter') {
              // send event like this, because submitting form will be ignored if fields are empty
              this.sendSubmitEvent();
            } else {
              this.handleFilterValueChange(e);
            }
          }.bind(this)
        );
      }.bind(this)
    );

    // recalculate height of all expanded panels on window resize
    window.addEventListener('resize', this.handleWindowResize.bind(this));
  };
  /**
   * Forcing submit event for form
   */
  IdskTableFilter.prototype.sendSubmitEvent = function () {
    this.$module.querySelector('form').dispatchEvent(
      new Event('submit', {
        bubbles: true,
        cancelable: true
      })
    );
  };

  /**
   * An event handler for click event on $togglePanel - collapse or expand table-filter
   *
   * @param {object} e - Event
   */
  IdskTableFilter.prototype.handleClickTogglePanel = function (e) {
    var $el = e.target || e.srcElement;
    var $expandablePanel = $el.parentNode;
    var $content = $el.nextElementSibling;

    // get texts from button dataset
    var openText = $el.dataset.openText;
    var closeText = $el.dataset.closeText;

    // if panel is category, change size of whole panel with animation
    var isCategory = $expandablePanel.classList.contains(
      'idsk-table-filter__category'
    );
    if (isCategory) {
      var $categoryParent = $expandablePanel.parentNode;

      // made more fluid animations for changed spacing with transition
      var marginBottomTitle = isCategory ? 18 : 20;
      var marginBottomExpandedCategory = 25;
      var newParentHeight =
        $content.style.height && $content.style.height !== '0px'
          ? parseInt($categoryParent.style.height) -
            $content.scrollHeight -
            marginBottomTitle +
            marginBottomExpandedCategory
          : parseInt($categoryParent.style.height) +
            $content.scrollHeight +
            marginBottomTitle -
            marginBottomExpandedCategory;

      $categoryParent.style.height = newParentHeight + 'px';
    }

    // show element after toggle with slide down animation
    toggleClass($expandablePanel, 'idsk-table-filter--expanded');
    $content.style.height =
      ($content.style.height && $content.style.height !== '0px'
        ? '0'
        : $content.scrollHeight) + 'px';

    // set text for toggle
    var hidden = $content.style.height === '0px';
    var newToggleText = hidden ? openText : closeText;
    var newToggleButton = hidden ? 'false' : 'true';
    var $ariaToggleForm = document.querySelector('.idsk-table-filter__content');
    $el.innerHTML = newToggleText;
    $el.setAttribute(
      'aria-label',
      newToggleText +
        ($el.dataset.categoryName ? ' ' + $el.dataset.categoryName : '')
    );
    $ariaToggleForm.setAttribute('aria-hidden', newToggleButton);

    // toggle tabbable if content is shown or not
    var $items = $content.querySelectorAll(
      ':scope > .idsk-table-filter__filter-inputs input, :scope > .idsk-table-filter__filter-inputs select, .idsk-filter-menu__toggle'
    );
    var tabIndex = hidden ? -1 : 0;
    $items.forEach(function ($filter) {
      // @ts-ignore
      $filter.tabIndex = tabIndex;
    });
  };

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
    );
    if ($filterToRemoveValue.tagName === 'SELECT') {
      // if filter is select find option with empty value
      $filterToRemoveValue
        .querySelectorAll('option')
        .forEach(function (option, index) {
          if (option.value === '') {
            $filterToRemoveValue.selectedIndex = index;
          }
        });
    } else $filterToRemoveValue.value = '';

    // simulate change event of inputs to change count of active filters and call form submit to send information about filter was changed
    $filterToRemoveValue.dispatchEvent(new Event('change'));

    // send submit event of form to call data changes
    this.sendSubmitEvent();

    this.$activeFilters = this.$activeFilters.filter(function ($filter) {
      return $filter.id !== $filterToRemove.id
    });

    this.renderActiveFilters();
  };

  /**
   * A function to remove all active filters
   */
  IdskTableFilter.prototype.removeAllActiveFilters = function () {
    this.$activeFilters.forEach(
      function ($filter) {
        this.removeActiveFilter($filter);
      }.bind(this)
    );
  };

  /**
   * A function to add elements to DOM object
   */
  IdskTableFilter.prototype.renderActiveFilters = function () {
    // remove all existing filters from array
    var $activeFiltersPanel = this.$module.querySelector(
      '.idsk-table-filter__active-filters'
    );
    var $activeFilters = $activeFiltersPanel.querySelector(
      '.idsk-table-filter__active-filters .idsk-table-filter__content'
    );
    $activeFilters.innerHTML = '';

    // open filter if active filters was hidden before
    if (
      $activeFiltersPanel.classList.contains(
        'idsk-table-filter__active-filters__hide'
      )
    ) {
      $activeFiltersPanel.classList.add('idsk-table-filter--expanded');
    }

    // render all filters in active filters
    this.$activeFilters.forEach(
      function ($filter) {
        var $activeFilter = document.createElement('div');
        $activeFilter.classList.add('idsk-table-filter__parameter', 'govuk-body');
        var $removeFilterBtn =
          '<button class="idsk-table-filter__parameter-remove" tabindex="0">✕ <span class="govuk-visually-hidden">' +
          this.removeFilterText +
          ' ' +
          $filter.value +
          '</span></button>';
        $activeFilter.innerHTML =
          '<span class="idsk-table-filter__parameter-title">' +
          $filter.value +
          '</span>' +
          $removeFilterBtn;

        $activeFilter
          .querySelector('.idsk-table-filter__parameter-remove')
          .addEventListener(
            'click',
            function () {
              this.removeActiveFilter($filter);
            }.bind(this)
          );

        $activeFilters.appendChild($activeFilter);
      }.bind(this)
    );

    // add remove everything button if some filter is activated else print none filter is activated
    if (this.$activeFilters.length > 0) {
      $activeFiltersPanel.classList.remove(
        'idsk-table-filter__active-filters__hide'
      );
      var $removeAllFilters = document.createElement('button');
      $removeAllFilters.classList.add('govuk-body', 'govuk-link');
      $removeAllFilters.innerHTML =
        '<span class="idsk-table-filter__parameter-title">' +
        this.removeAllFiltersText +
        ' (' +
        this.$activeFilters.length +
        ')</span><span class="idsk-table-filter__parameter-remove">✕</span>';
      $removeAllFilters.addEventListener(
        'click',
        this.removeAllActiveFilters.bind(this)
      );
      $activeFilters.appendChild($removeAllFilters);
    } else {
      $activeFiltersPanel.classList.add('idsk-table-filter__active-filters__hide');
    }

    // calc height of 'active filter' panel if panel is expanded
    var $activeFiltersContainer = this.$module.querySelector(
      '.idsk-table-filter__active-filters.idsk-table-filter--expanded .idsk-table-filter__content'
    );
    if ($activeFiltersContainer) {
      $activeFiltersContainer.style.height = 'initial'; // to changing height from initial height
      $activeFiltersContainer.style.height =
        $activeFiltersContainer.scrollHeight + 'px';
    }
  };

  /**
   * A function to refresh number of selected filters count
   */
  IdskTableFilter.prototype.renderSelectedFiltersCount = function () {
    var submitButton = this.$module.querySelector('.submit-table-filter');
    submitButton.disabled = this.selectedFitlersCount === 0;

    var counter = submitButton.querySelector('.count');
    counter.innerHTML = this.selectedFitlersCount;
  };

  /**
   * A submit filters event on click at $submitButton or pressing enter in inputs
   */
  IdskTableFilter.prototype.handleSubmitFilter = function () {
    // get all inputs and selects
    var $inputs = this.$module.querySelectorAll(
      '.idsk-table-filter__inputs input'
    );
    var $selects = this.$module.querySelectorAll(
      '.idsk-table-filter__inputs select'
    );

    // add values of inputs to $activeFilters if it is not empty
    this.$activeFilters = [];
    $inputs.forEach(
      function ($input) {
        if ($input.value.length > 0) {
          this.$activeFilters.push({
            id: $input.getAttribute('id'),
            name: $input.getAttribute('name'),
            value: $input.value
          });
        }
      }.bind(this)
    );

    $selects.forEach(
      function ($select) {
        if ($select.value) {
          this.$activeFilters.push({
            id: $select.value,
            name: $select.getAttribute('name'),
            value: $select.options[$select.selectedIndex].text
          });
        }
      }.bind(this)
    );

    // render all filters in active filters
    this.renderActiveFilters();
  };

  /**
   * An event handler for on change event for all inputs and selects
   *
   * @param {object} e - event
   */
  IdskTableFilter.prototype.handleFilterValueChange = function (e) {
    var $el = e.target || e.srcElement;

    // if filter is in category get count of selected filters only from that category
    var $category = $el.closest('.idsk-table-filter__category');
    if ($category) {
      var $allCategoryFilters = $category.querySelectorAll(
        '.idsk-table-filter__inputs input, .idsk-table-filter__inputs select'
      );
      var selectedCategoryFiltersCount = 0;
      $allCategoryFilters.forEach(function ($filter) {
        if ($filter.value) {
          selectedCategoryFiltersCount++;
        }
      });
      $category.querySelector('.count').innerHTML = selectedCategoryFiltersCount
        ? '(' + selectedCategoryFiltersCount + ')'
        : '';
    }

    // get count of all selected filters
    this.selectedFitlersCount = 0;
    var $allFilters = this.$module.querySelectorAll(
      '.idsk-table-filter__inputs input, .idsk-table-filter__inputs select'
    );
    $allFilters.forEach(
      function ($filter) {
        if ($filter.value) {
          this.selectedFitlersCount++;
        }
      }.bind(this)
    );

    // render count of selected filters
    this.renderSelectedFiltersCount();
  };

  /**
   * An event handler for window resize to change elements based on scrollHeight
   */
  IdskTableFilter.prototype.handleWindowResize = function () {
    var $allExpandedPanels = this.$module.querySelectorAll(
      '.idsk-table-filter--expanded'
    );
    $allExpandedPanels.forEach(function ($panel) {
      // @ts-ignore
      var $content = $panel.querySelector('.idsk-table-filter__content');
      $content.style.height = 'initial'; // to changing height from initial height
      $content.style.height = $content.scrollHeight + 'px';
    });
  };

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

  /**
   * Notification Banner component
   *
   * @class
   * @param {Element} $module - HTML element to use for notification banner
   * @param {NotificationBannerConfig} [config] - Notification banner config
   */
  function NotificationBanner ($module, config) {
    if (!($module instanceof HTMLElement)) {
      return this
    }

    /** @deprecated Will be made private in v5.0 */
    this.$module = $module;

    /** @type {NotificationBannerConfig} */
    var defaultConfig = {
      disableAutoFocus: false
    };

    /**
     * @deprecated Will be made private in v5.0
     * @type {NotificationBannerConfig}
     */
    this.config = mergeConfigs(
      defaultConfig,
      config || {},
      normaliseDataset($module.dataset)
    );
  }

  /**
   * Initialise component
   */
  NotificationBanner.prototype.init = function () {
    // Check that required elements are present
    if (!this.$module) {
      return
    }

    this.setFocus();
  };

  /**
   * Focus the element
   *
   * If `role="alert"` is set, focus the element to help some assistive technologies
   * prioritise announcing it.
   *
   * You can turn off the auto-focus functionality by setting `data-disable-auto-focus="true"` in the
   * component HTML. You might wish to do this based on user research findings, or to avoid a clash
   * with another element which should be focused when the page loads.
   *
   * @deprecated Will be made private in v5.0
   */
  NotificationBanner.prototype.setFocus = function () {
    var $module = this.$module;

    if (this.config.disableAutoFocus) {
      return
    }

    if ($module.getAttribute('role') !== 'alert') {
      return
    }

    // Set tabindex to -1 to make the element focusable with JavaScript.
    // Remove the tabindex on blur as the component doesn't need to be focusable after the page has
    // loaded.
    if (!$module.getAttribute('tabindex')) {
      $module.setAttribute('tabindex', '-1');

      $module.addEventListener('blur', function () {
        $module.removeAttribute('tabindex');
      });
    }

    $module.focus();
  };

  /**
   * Notification banner config
   *
   * @typedef {object} NotificationBannerConfig
   * @property {boolean} [disableAutoFocus=false] - If set to `true` the
   *   notification banner will not be focussed when the page loads. This only
   *   applies if the component has a `role` of `alert` – in other cases the
   *   component will not be focused on page load, regardless of this option.
   */

  /**
   * Radios component
   *
   * @class
   * @param {Element} $module - HTML element to use for radios
   */
  function Radios ($module) {
    if (!($module instanceof HTMLElement)) {
      return this
    }

    /** @satisfies {NodeListOf<HTMLInputElement>} */
    var $inputs = $module.querySelectorAll('input[type="radio"]');
    if (!$inputs.length) {
      return this
    }

    /** @deprecated Will be made private in v5.0 */
    this.$module = $module;

    /** @deprecated Will be made private in v5.0 */
    this.$inputs = $inputs;
  }

  /**
   * Initialise component
   *
   * Radios can be associated with a 'conditionally revealed' content block – for
   * example, a radio for 'Phone' could reveal an additional form field for the
   * user to enter their phone number.
   *
   * These associations are made using a `data-aria-controls` attribute, which is
   * promoted to an aria-controls attribute during initialisation.
   *
   * We also need to restore the state of any conditional reveals on the page (for
   * example if the user has navigated back), and set up event handlers to keep
   * the reveal in sync with the radio state.
   */
  Radios.prototype.init = function () {
    // Check that required elements are present
    if (!this.$module || !this.$inputs) {
      return
    }

    var $module = this.$module;
    var $inputs = this.$inputs;

    $inputs.forEach(function ($input) {
      var targetId = $input.getAttribute('data-aria-controls');

      // Skip radios without data-aria-controls attributes, or where the
      // target element does not exist.
      if (!targetId || !document.getElementById(targetId)) {
        return
      }

      // Promote the data-aria-controls attribute to a aria-controls attribute
      // so that the relationship is exposed in the AOM
      $input.setAttribute('aria-controls', targetId);
      $input.removeAttribute('data-aria-controls');
    });

    // When the page is restored after navigating 'back' in some browsers the
    // state of form controls is not restored until *after* the DOMContentLoaded
    // event is fired, so we need to sync after the pageshow event in browsers
    // that support it.
    window.addEventListener(
      'onpageshow' in window ? 'pageshow' : 'DOMContentLoaded',
      this.syncAllConditionalReveals.bind(this)
    );

    // Although we've set up handlers to sync state on the pageshow or
    // DOMContentLoaded event, init could be called after those events have fired,
    // for example if they are added to the page dynamically, so sync now too.
    this.syncAllConditionalReveals();

    // Handle events
    $module.addEventListener('click', this.handleClick.bind(this));
  };

  /**
   * Sync the conditional reveal states for all radio buttons in this $module.
   *
   * @deprecated Will be made private in v5.0
   */
  Radios.prototype.syncAllConditionalReveals = function () {
    this.$inputs.forEach(this.syncConditionalRevealWithInputState.bind(this));
  };

  /**
   * Sync conditional reveal with the input state
   *
   * Synchronise the visibility of the conditional reveal, and its accessible
   * state, with the input's checked state.
   *
   * @deprecated Will be made private in v5.0
   * @param {HTMLInputElement} $input - Radio input
   */
  Radios.prototype.syncConditionalRevealWithInputState = function ($input) {
    var targetId = $input.getAttribute('aria-controls');
    if (!targetId) {
      return
    }

    var $target = document.getElementById(targetId);
    if ($target && $target.classList.contains('govuk-radios__conditional')) {
      var inputIsChecked = $input.checked;

      $input.setAttribute('aria-expanded', inputIsChecked.toString());
      $target.classList.toggle('govuk-radios__conditional--hidden', !inputIsChecked);
    }
  };

  /**
   * Click event handler
   *
   * Handle a click within the $module – if the click occurred on a radio, sync
   * the state of the conditional reveal for all radio buttons in the same form
   * with the same name (because checking one radio could have un-checked a radio
   * in another $module)
   *
   * @deprecated Will be made private in v5.0
   * @param {MouseEvent} event - Click event
   */
  Radios.prototype.handleClick = function (event) {
    var $component = this;
    var $clickedInput = event.target;

    // Ignore clicks on things that aren't radio buttons
    if (!($clickedInput instanceof HTMLInputElement) || $clickedInput.type !== 'radio') {
      return
    }

    // We only need to consider radios with conditional reveals, which will have
    // aria-controls attributes.
    /** @satisfies {NodeListOf<HTMLInputElement>} */
    var $allInputs = document.querySelectorAll('input[type="radio"][aria-controls]');

    var $clickedInputForm = $clickedInput.form;
    var $clickedInputName = $clickedInput.name;

    $allInputs.forEach(function ($input) {
      var hasSameFormOwner = $input.form === $clickedInputForm;
      var hasSameName = $input.name === $clickedInputName;

      if (hasSameName && hasSameFormOwner) {
        $component.syncConditionalRevealWithInputState($input);
      }
    });
  };

  /**
   * Skip link component
   *
   * @class
   * @param {Element} $module - HTML element to use for skip link
   */
  function SkipLink ($module) {
    if (!($module instanceof HTMLAnchorElement)) {
      return this
    }

    /** @deprecated Will be made private in v5.0 */
    this.$module = $module;

    /** @deprecated Will be made private in v5.0 */
    this.$linkedElement = null;

    /** @deprecated Will be made private in v5.0 */
    this.linkedElementListener = false;
  }

  /**
   * Initialise component
   */
  SkipLink.prototype.init = function () {
    // Check that required elements are present
    if (!this.$module) {
      return
    }

    // Check for linked element
    var $linkedElement = this.getLinkedElement();
    if (!$linkedElement) {
      return
    }

    this.$linkedElement = $linkedElement;
    this.$module.addEventListener('click', this.focusLinkedElement.bind(this));
  };

  /**
   * Get linked element
   *
   * @deprecated Will be made private in v5.0
   * @returns {HTMLElement | null} $linkedElement - DOM element linked to from the skip link
   */
  SkipLink.prototype.getLinkedElement = function () {
    var linkedElementId = this.getFragmentFromUrl();
    if (!linkedElementId) {
      return null
    }

    return document.getElementById(linkedElementId)
  };

  /**
   * Focus the linked element
   *
   * Set tabindex and helper CSS class. Set listener to remove them on blur.
   *
   * @deprecated Will be made private in v5.0
   */
  SkipLink.prototype.focusLinkedElement = function () {
    var $linkedElement = this.$linkedElement;

    if (!$linkedElement.getAttribute('tabindex')) {
      // Set the element tabindex to -1 so it can be focused with JavaScript.
      $linkedElement.setAttribute('tabindex', '-1');
      $linkedElement.classList.add('govuk-skip-link-focused-element');

      // Add listener for blur on the focused element (unless the listener has previously been added)
      if (!this.linkedElementListener) {
        this.$linkedElement.addEventListener('blur', this.removeFocusProperties.bind(this));
        this.linkedElementListener = true;
      }
    }

    $linkedElement.focus();
  };

  /**
   * Remove the tabindex that makes the linked element focusable because the element only needs to be
   * focusable until it has received programmatic focus and a screen reader has announced it.
   *
   * Remove the CSS class that removes the native focus styles.
   *
   * @deprecated Will be made private in v5.0
   */
  SkipLink.prototype.removeFocusProperties = function () {
    this.$linkedElement.removeAttribute('tabindex');
    this.$linkedElement.classList.remove('govuk-skip-link-focused-element');
  };

  /**
   * Get fragment from URL
   *
   * Extract the fragment (everything after the hash symbol) from a URL, but not including
   * the symbol.
   *
   * @deprecated Will be made private in v5.0
   * @returns {string | undefined} Fragment from URL, without the hash symbol
   */
  SkipLink.prototype.getFragmentFromUrl = function () {
    // Bail if the anchor link doesn't have a hash
    if (!this.$module.hash) {
      return
    }

    return this.$module.hash.split('#').pop()
  };

  /**
   * Tabs component
   *
   * @class
   * @param {Element} $module - HTML element to use for tabs
   */
  function Tabs ($module) {
    if (!($module instanceof HTMLElement)) {
      return this
    }

    /** @satisfies {NodeListOf<HTMLAnchorElement>} */
    var $tabs = $module.querySelectorAll('a.govuk-tabs__tab');
    if (!$tabs.length) {
      return this
    }

    /** @deprecated Will be made private in v5.0 */
    this.$module = $module;

    /** @deprecated Will be made private in v5.0 */
    this.$tabs = $tabs;

    /** @deprecated Will be made private in v5.0 */
    this.keys = { left: 37, right: 39, up: 38, down: 40 };

    /** @deprecated Will be made private in v5.0 */
    this.jsHiddenClass = 'govuk-tabs__panel--hidden';

    // Save bounded functions to use when removing event listeners during teardown

    /** @deprecated Will be made private in v5.0 */
    this.boundTabClick = this.onTabClick.bind(this);

    /** @deprecated Will be made private in v5.0 */
    this.boundTabKeydown = this.onTabKeydown.bind(this);

    /** @deprecated Will be made private in v5.0 */
    this.boundOnHashChange = this.onHashChange.bind(this);

    /** @deprecated Will be made private in v5.0 */
    this.changingHash = false;
  }

  /**
   * Initialise component
   */
  Tabs.prototype.init = function () {
    // Check that required elements are present
    if (!this.$module || !this.$tabs) {
      return
    }

    if (typeof window.matchMedia === 'function') {
      this.setupResponsiveChecks();
    } else {
      this.setup();
    }
  };

  /**
   * Setup viewport resize check
   *
   * @deprecated Will be made private in v5.0
   */
  Tabs.prototype.setupResponsiveChecks = function () {
    /** @deprecated Will be made private in v5.0 */
    this.mql = window.matchMedia('(min-width: 40.0625em)');
    this.mql.addListener(this.checkMode.bind(this));
    this.checkMode();
  };

  /**
   * Setup or teardown handler for viewport resize check
   *
   * @deprecated Will be made private in v5.0
   */
  Tabs.prototype.checkMode = function () {
    if (this.mql.matches) {
      this.setup();
    } else {
      this.teardown();
    }
  };

  /**
   * Setup tab component
   *
   * @deprecated Will be made private in v5.0
   */
  Tabs.prototype.setup = function () {
    var $component = this;
    var $module = this.$module;
    var $tabs = this.$tabs;
    var $tabList = $module.querySelector('.govuk-tabs__list');
    var $tabListItems = $module.querySelectorAll('.govuk-tabs__list-item');

    if (!$tabs || !$tabList || !$tabListItems) {
      return
    }

    $tabList.setAttribute('role', 'tablist');

    $tabListItems.forEach(function ($item) {
      $item.setAttribute('role', 'presentation');
    });

    $tabs.forEach(function ($tab) {
      // Set HTML attributes
      $component.setAttributes($tab);

      // Handle events
      $tab.addEventListener('click', $component.boundTabClick, true);
      $tab.addEventListener('keydown', $component.boundTabKeydown, true);

      // Remove old active panels
      $component.hideTab($tab);
    });

    // Show either the active tab according to the URL's hash or the first tab
    var $activeTab = this.getTab(window.location.hash) || this.$tabs[0];
    if (!$activeTab) {
      return
    }

    this.showTab($activeTab);

    // Handle hashchange events
    window.addEventListener('hashchange', this.boundOnHashChange, true);
  };

  /**
   * Teardown tab component
   *
   * @deprecated Will be made private in v5.0
   */
  Tabs.prototype.teardown = function () {
    var $component = this;
    var $module = this.$module;
    var $tabs = this.$tabs;
    var $tabList = $module.querySelector('.govuk-tabs__list');
    var $tabListItems = $module.querySelectorAll('a.govuk-tabs__list-item');

    if (!$tabs || !$tabList || !$tabListItems) {
      return
    }

    $tabList.removeAttribute('role');

    $tabListItems.forEach(function ($item) {
      $item.removeAttribute('role');
    });

    $tabs.forEach(function ($tab) {
      // Remove events
      $tab.removeEventListener('click', $component.boundTabClick, true);
      $tab.removeEventListener('keydown', $component.boundTabKeydown, true);

      // Unset HTML attributes
      $component.unsetAttributes($tab);
    });

    // Remove hashchange event handler
    window.removeEventListener('hashchange', this.boundOnHashChange, true);
  };

  /**
   * Handle hashchange event
   *
   * @deprecated Will be made private in v5.0
   * @returns {void | undefined} Returns void, or undefined when prevented
   */
  Tabs.prototype.onHashChange = function () {
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
    if (!$previousTab) {
      return
    }

    this.hideTab($previousTab);
    this.showTab($tabWithHash);
    $tabWithHash.focus();
  };

  /**
   * Hide panel for tab link
   *
   * @deprecated Will be made private in v5.0
   * @param {HTMLAnchorElement} $tab - Tab link
   */
  Tabs.prototype.hideTab = function ($tab) {
    this.unhighlightTab($tab);
    this.hidePanel($tab);
  };

  /**
   * Show panel for tab link
   *
   * @deprecated Will be made private in v5.0
   * @param {HTMLAnchorElement} $tab - Tab link
   */
  Tabs.prototype.showTab = function ($tab) {
    this.highlightTab($tab);
    this.showPanel($tab);
  };

  /**
   * Get tab link by hash
   *
   * @deprecated Will be made private in v5.0
   * @param {string} hash - Hash fragment including #
   * @returns {HTMLAnchorElement | null} Tab link
   */
  Tabs.prototype.getTab = function (hash) {
    return this.$module.querySelector('a.govuk-tabs__tab[href="' + hash + '"]')
  };

  /**
   * Set tab link and panel attributes
   *
   * @deprecated Will be made private in v5.0
   * @param {HTMLAnchorElement} $tab - Tab link
   */
  Tabs.prototype.setAttributes = function ($tab) {
    // set tab attributes
    var panelId = this.getHref($tab).slice(1);
    $tab.setAttribute('id', 'tab_' + panelId);
    $tab.setAttribute('role', 'tab');
    $tab.setAttribute('aria-controls', panelId);
    $tab.setAttribute('aria-selected', 'false');
    $tab.setAttribute('tabindex', '-1');

    // set panel attributes
    var $panel = this.getPanel($tab);
    if (!$panel) {
      return
    }

    $panel.setAttribute('role', 'tabpanel');
    $panel.setAttribute('aria-labelledby', $tab.id);
    $panel.classList.add(this.jsHiddenClass);
  };

  /**
   * Unset tab link and panel attributes
   *
   * @deprecated Will be made private in v5.0
   * @param {HTMLAnchorElement} $tab - Tab link
   */
  Tabs.prototype.unsetAttributes = function ($tab) {
    // unset tab attributes
    $tab.removeAttribute('id');
    $tab.removeAttribute('role');
    $tab.removeAttribute('aria-controls');
    $tab.removeAttribute('aria-selected');
    $tab.removeAttribute('tabindex');

    // unset panel attributes
    var $panel = this.getPanel($tab);
    if (!$panel) {
      return
    }

    $panel.removeAttribute('role');
    $panel.removeAttribute('aria-labelledby');
    $panel.classList.remove(this.jsHiddenClass);
  };

  /**
   * Handle tab link clicks
   *
   * @deprecated Will be made private in v5.0
   * @param {MouseEvent} event - Mouse click event
   * @returns {void} Returns void
   */
  Tabs.prototype.onTabClick = function (event) {
    var $currentTab = this.getCurrentTab();
    var $nextTab = event.currentTarget;

    if (!$currentTab || !($nextTab instanceof HTMLAnchorElement)) {
      return
    }

    event.preventDefault();

    this.hideTab($currentTab);
    this.showTab($nextTab);
    this.createHistoryEntry($nextTab);
  };

  /**
   * Update browser URL hash fragment for tab
   *
   * - Allows back/forward to navigate tabs
   * - Avoids page jump when hash changes
   *
   * @deprecated Will be made private in v5.0
   * @param {HTMLAnchorElement} $tab - Tab link
   */
  Tabs.prototype.createHistoryEntry = function ($tab) {
    var $panel = this.getPanel($tab);
    if (!$panel) {
      return
    }

    // Save and restore the id
    // so the page doesn't jump when a user clicks a tab (which changes the hash)
    var panelId = $panel.id;
    $panel.id = '';
    this.changingHash = true;
    window.location.hash = this.getHref($tab).slice(1);
    $panel.id = panelId;
  };

  /**
   * Handle tab keydown event
   *
   * - Press right/down arrow for next tab
   * - Press left/up arrow for previous tab
   *
   * @deprecated Will be made private in v5.0
   * @param {KeyboardEvent} event - Keydown event
   */
  Tabs.prototype.onTabKeydown = function (event) {
    switch (event.keyCode) {
      case this.keys.left:
      case this.keys.up:
        this.activatePreviousTab();
        event.preventDefault();
        break
      case this.keys.right:
      case this.keys.down:
        this.activateNextTab();
        event.preventDefault();
        break
    }
  };

  /**
   * Activate next tab
   *
   * @deprecated Will be made private in v5.0
   */
  Tabs.prototype.activateNextTab = function () {
    var $currentTab = this.getCurrentTab();
    if (!$currentTab || !$currentTab.parentElement) {
      return
    }

    var $nextTabListItem = $currentTab.parentElement.nextElementSibling;
    if (!$nextTabListItem) {
      return
    }

    /** @satisfies {HTMLAnchorElement} */
    var $nextTab = $nextTabListItem.querySelector('a.govuk-tabs__tab');
    if (!$nextTab) {
      return
    }

    this.hideTab($currentTab);
    this.showTab($nextTab);
    $nextTab.focus();
    this.createHistoryEntry($nextTab);
  };

  /**
   * Activate previous tab
   *
   * @deprecated Will be made private in v5.0
   */
  Tabs.prototype.activatePreviousTab = function () {
    var $currentTab = this.getCurrentTab();
    if (!$currentTab || !$currentTab.parentElement) {
      return
    }

    var $previousTabListItem = $currentTab.parentElement.previousElementSibling;
    if (!$previousTabListItem) {
      return
    }

    /** @satisfies {HTMLAnchorElement} */
    var $previousTab = $previousTabListItem.querySelector('a.govuk-tabs__tab');
    if (!$previousTab) {
      return
    }

    this.hideTab($currentTab);
    this.showTab($previousTab);
    $previousTab.focus();
    this.createHistoryEntry($previousTab);
  };

  /**
   * Get tab panel for tab link
   *
   * @deprecated Will be made private in v5.0
   * @param {HTMLAnchorElement} $tab - Tab link
   * @returns {Element | null} Tab panel
   */
  Tabs.prototype.getPanel = function ($tab) {
    return this.$module.querySelector(this.getHref($tab))
  };

  /**
   * Show tab panel for tab link
   *
   * @deprecated Will be made private in v5.0
   * @param {HTMLAnchorElement} $tab - Tab link
   */
  Tabs.prototype.showPanel = function ($tab) {
    var $panel = this.getPanel($tab);
    if (!$panel) {
      return
    }

    $panel.classList.remove(this.jsHiddenClass);
  };

  /**
   * Hide tab panel for tab link
   *
   * @deprecated Will be made private in v5.0
   * @param {HTMLAnchorElement} $tab - Tab link
   */
  Tabs.prototype.hidePanel = function ($tab) {
    var $panel = this.getPanel($tab);
    if (!$panel) {
      return
    }

    $panel.classList.add(this.jsHiddenClass);
  };

  /**
   * Unset 'selected' state for tab link
   *
   * @deprecated Will be made private in v5.0
   * @param {HTMLAnchorElement} $tab - Tab link
   */
  Tabs.prototype.unhighlightTab = function ($tab) {
    if (!$tab.parentElement) {
      return
    }

    $tab.setAttribute('aria-selected', 'false');
    $tab.parentElement.classList.remove('govuk-tabs__list-item--selected');
    $tab.setAttribute('tabindex', '-1');
  };

  /**
   * Set 'selected' state for tab link
   *
   * @deprecated Will be made private in v5.0
   * @param {HTMLAnchorElement} $tab - Tab link
   */
  Tabs.prototype.highlightTab = function ($tab) {
    if (!$tab.parentElement) {
      return
    }

    $tab.setAttribute('aria-selected', 'true');
    $tab.parentElement.classList.add('govuk-tabs__list-item--selected');
    $tab.setAttribute('tabindex', '0');
  };

  /**
   * Get current tab link
   *
   * @deprecated Will be made private in v5.0
   * @returns {HTMLAnchorElement | null} Tab link
   */
  Tabs.prototype.getCurrentTab = function () {
    return this.$module.querySelector('.govuk-tabs__list-item--selected a.govuk-tabs__tab')
  };

  /**
   * Get link hash fragment for href attribute
   *
   * this is because IE doesn't always return the actual value but a relative full path
   * should be a utility function most prob
   * {@link http://labs.thesedays.com/blog/2010/01/08/getting-the-href-value-with-jquery-in-ie/}
   *
   * @deprecated Will be made private in v5.0
   * @param {HTMLAnchorElement} $tab - Tab link
   * @returns {string} Hash fragment including #
   */
  Tabs.prototype.getHref = function ($tab) {
    var href = $tab.getAttribute('href');
    var hash = href.slice(href.indexOf('#'), href.length);
    return hash
  };

  /**
   * Initialise all components
   *
   * Use the `data-module` attributes to find, instantiate and init all of the
   * components provided as part of GOV.UK Frontend.
   *
   * @param {Config} [config] - Config for all components
   */
  function initAll (config) {
    config = typeof config !== 'undefined' ? config : {};

    // Allow the user to initialise GOV.UK Frontend in only certain sections of the page
    // Defaults to the entire document if nothing is set.
    var $scope = config.scope instanceof HTMLElement ? config.scope : document;

    var $accordions = $scope.querySelectorAll('[data-module="govuk-accordion"]');
    $accordions.forEach(function ($accordion) {
      new Accordion($accordion, config.accordion).init();
    });

    var $buttons = $scope.querySelectorAll('[data-module="govuk-button"]');
    $buttons.forEach(function ($button) {
      new Button($button, config.button).init();
    });

    var $characterCounts = $scope.querySelectorAll('[data-module="govuk-character-count"]');
    $characterCounts.forEach(function ($characterCount) {
      new CharacterCount($characterCount, config.characterCount).init();
    });

    var $checkboxes = $scope.querySelectorAll('[data-module="govuk-checkboxes"]');
    $checkboxes.forEach(function ($checkbox) {
      new Checkboxes($checkbox).init();
    });

    var $details = $scope.querySelectorAll('[data-module="govuk-details"]');
    $details.forEach(function ($detail) {
      new Details($detail).init();
    });

    // Find first error summary module to enhance.
    var $errorSummary = $scope.querySelector('[data-module="govuk-error-summary"]');
    if ($errorSummary) {
      new ErrorSummary($errorSummary, config.errorSummary).init();
    }

    // Find first header module to enhance.
    var $header = $scope.querySelector('[data-module="govuk-header"]');
    if ($header) {
      new Header($header).init();
    }

    var $notificationBanners = $scope.querySelectorAll('[data-module="govuk-notification-banner"]');
    $notificationBanners.forEach(function ($notificationBanner) {
      new NotificationBanner($notificationBanner, config.notificationBanner).init();
    });

    var $radios = $scope.querySelectorAll('[data-module="govuk-radios"]');
    $radios.forEach(function ($radio) {
      new Radios($radio).init();
    });

    // Find first skip link module to enhance.
    var $skipLink = $scope.querySelector('[data-module="govuk-skip-link"]');
    if ($skipLink) {
      new SkipLink($skipLink).init();
    }

    var $tabs = $scope.querySelectorAll('[data-module="govuk-tabs"]');
    $tabs.forEach(function ($tabs) {
      new Tabs($tabs).init();
    });

    var $idskAccordions = $scope.querySelectorAll('[data-module="idsk-accordion"]');
    $idskAccordions.forEach(function ($idskAccordions) {
      new IdskAccordion($idskAccordions).init();
    });

    var $idskButtons = $scope.querySelectorAll('[data-module="idsk-button"]');
    $idskButtons.forEach(function ($idskButtons) {
      new IdskButton($idskButtons).init();
    });

    var $idskCrossroad = $scope.querySelectorAll('[data-module="idsk-crossroad"]');
    $idskCrossroad.forEach(function ($idskCrossroad) {
      new IdskCrossroad($idskCrossroad).init();
    });

    var $idskCustomerSurveys = $scope.querySelectorAll('[data-module="idsk-customer-surveys"]');
    $idskCustomerSurveys.forEach(function ($idskCustomerSurveys) {
      new IdskCustomerSurveys($idskCustomerSurveys).init();
    });

    var $idskFeedback = $scope.querySelectorAll('[data-module="idsk-feedback"]');
    $idskFeedback.forEach(function ($idskFeedback) {
      new IdskFeedback($idskFeedback).init();
    });

    var $idskFooterExtended = $scope.querySelectorAll('[data-module="idsk-footer-extended"]');
    $idskFooterExtended.forEach(function ($idskFooterExtended) {
      new IdskFooterExtended($idskFooterExtended).init();
    });

    // Find first idsk header module to enhance.
    var $idskHeader = $scope.querySelector('[data-module="idsk-header"]');
    if ($idskHeader) {
      new IdskHeader($idskHeader).init();
    }

    // Find first idsk-header-extended module to enhance.
    var $idskHeaderExtended = $scope.querySelector('[data-module="idsk-header-extended"]');
    if ($idskHeaderExtended) {
      new IdskHeaderExtended($idskHeaderExtended).init();
    }

    // Find first idsk-header-web module to enhance.
    var $idskHeaderWeb = $scope.querySelector('[data-module="idsk-header-web"]');
    if ($idskHeaderWeb) {
      new IdskHeaderWeb($idskHeaderWeb).init();
    }

    var $idskInPageNavigation = $scope.querySelectorAll('[data-module="idsk-in-page-navigation"]');
    $idskInPageNavigation.forEach(function ($idskInPageNavigation) {
      new IdskInPageNavigation($idskInPageNavigation).init();
    });

    var idskInteractiveMap = $scope.querySelectorAll('[data-module="idsk-interactive-map"]');
    idskInteractiveMap.forEach(function (idskInteractiveMap) {
      new IdskInteractiveMap(idskInteractiveMap).init();
    });

    var $idskRegistrationForEvent = $scope.querySelectorAll('[data-module="idsk-registration-for-event"]');
    $idskRegistrationForEvent.forEach(function ($idskRegistrationForEvent) {
      new IdskRegistrationForEvent($idskRegistrationForEvent).init();
    });

    var $idskSearchComponent = $scope.querySelectorAll('[data-module="idsk-search-component"]');
    $idskSearchComponent.forEach(function ($idskSearchComponent) {
      new IdskSearchComponent($idskSearchComponent).init();
    });

    var $idskSearchResults = $scope.querySelectorAll('[data-module="idsk-search-results"]');
    $idskSearchResults.forEach(function ($idskSearchResults) {
      new IdskSearchResults($idskSearchResults).init();
    });

    var $idskSearchResultsFilter = $scope.querySelectorAll('[data-module="idsk-search-results-filter"]');
    $idskSearchResultsFilter.forEach(function ($idskSearchResultsFilter) {
      new IdskSearchResultsFilter($idskSearchResultsFilter).init();
    });

    var $idskStepper = $scope.querySelectorAll('[data-module="idsk-stepper"]');
    $idskStepper.forEach(function ($idskStepper) {
      new IdskStepper($idskStepper).init();
    });

    var $idskSubscriptionForm = $scope.querySelectorAll('[data-module="idsk-stepper"]');
    $idskSubscriptionForm.forEach(function ($idskSubscriptionForm) {
      new IdskSubscriptionForm($idskSubscriptionForm).init();
    });

    var $idskTable = $scope.querySelectorAll('[data-module="idsk-table"]');
    $idskTable.forEach(function ($idskTable) {
      new IdskTable($idskTable).init();
    });

    var $idskTableFilter = $scope.querySelectorAll('[data-module="idsk-table-filter"]');
    $idskTableFilter.forEach(function ($idskTableFilter) {
      new IdskTableFilter($idskTableFilter).init();
    });

    var $idskTabs = $scope.querySelectorAll('[data-module="idsk-tabs"]');
    $idskTabs.forEach(function ($idskTabs) {
      new IdskTabs($idskTabs).init();
    });
  }

  /**
   * Config for all components via `initAll()`
   *
   * @typedef {object} Config
   * @property {Element} [scope=document] - Scope to query for components
   * @property {AccordionConfig} [accordion] - Accordion config
   * @property {ButtonConfig} [button] - Button config
   * @property {CharacterCountConfig} [characterCount] - Character Count config
   * @property {ErrorSummaryConfig} [errorSummary] - Error Summary config
   * @property {NotificationBannerConfig} [notificationBanner] - Notification Banner config
   */

  /**
   * Config for individual components
   *
   * @typedef {import('./components/accordion/accordion.mjs').AccordionConfig} AccordionConfig
   * @typedef {import('./components/accordion/accordion.mjs').AccordionTranslations} AccordionTranslations
   * @typedef {import('./components/button/button.mjs').ButtonConfig} ButtonConfig
   * @typedef {import('./components/character-count/character-count.mjs').CharacterCountConfig} CharacterCountConfig
   * @typedef {import('./components/character-count/character-count.mjs').CharacterCountConfigWithMaxLength} CharacterCountConfigWithMaxLength
   * @typedef {import('./components/character-count/character-count.mjs').CharacterCountConfigWithMaxWords} CharacterCountConfigWithMaxWords
   * @typedef {import('./components/character-count/character-count.mjs').CharacterCountTranslations} CharacterCountTranslations
   * @typedef {import('./components/error-summary/error-summary.mjs').ErrorSummaryConfig} ErrorSummaryConfig
   * @typedef {import('./components/notification-banner/notification-banner.mjs').NotificationBannerConfig} NotificationBannerConfig
   */

  exports.initAll = initAll;
  exports.version = version;
  exports.Accordion = Accordion;
  exports.Button = Button;
  exports.Details = Details;
  exports.CharacterCount = CharacterCount;
  exports.Checkboxes = Checkboxes;
  exports.ErrorSummary = ErrorSummary;
  exports.Header = Header;
  exports.NotificationBanner = NotificationBanner;
  exports.Radios = Radios;
  exports.SkipLink = SkipLink;
  exports.Tabs = Tabs;
  exports.IdskAccordion = IdskAccordion;
  exports.IdskButton = IdskButton;
  exports.IdskCrossroad = IdskCrossroad;
  exports.IdskCustomerSurveys = IdskCustomerSurveys;
  exports.IdskFeedback = IdskFeedback;
  exports.IdskFooterExtended = IdskFooterExtended;
  exports.IdskHeader = IdskHeader;
  exports.IdskHeaderExtended = IdskHeaderExtended;
  exports.IdskHeaderWeb = IdskHeaderWeb;
  exports.IdskInPageNavigation = IdskInPageNavigation;
  exports.IdskInteractiveMap = IdskInteractiveMap;
  exports.IdskRegistrationForEvent = IdskRegistrationForEvent;
  exports.IdskSearchComponent = IdskSearchComponent;
  exports.IdskSearchResults = IdskSearchResults;
  exports.IdskSearchResultsFilter = IdskSearchResultsFilter;
  exports.IdskStepper = IdskStepper;
  exports.IdskSubscriptionForm = IdskSubscriptionForm;
  exports.IdskTable = IdskTable;
  exports.IdskTableFilter = IdskTableFilter;
  exports.IdskTabs = IdskTabs;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=all.js.map

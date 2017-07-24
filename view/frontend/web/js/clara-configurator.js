/**
 * Copyright © Exocortex, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
  'jquery',
  'underscore',
  'mage/template',
  'mage/smart-keyboard-handler',
  'mage/translate',
  'priceUtils',
  'claraplayer',
  'jquery/ui',
  'jquery/jquery.parsequery',
  'mage/validation/validation'
], function($, _, mageTemplate,  keyboardHandler, $t, priceUtils, claraPlayer) {
  'use strict';

  window.claraplayer = claraPlayer;

  $.widget('clara.Configurator', {
    options: {
      optionConfig: null,
      claraUUID: ''
    },

    /*
    * map clara config to magento option id
    */
    configMap: null,

    /*
    * type can be Options, Number, Boolean, Color
    */
    configType: null,

    /* for a config option in clara, if a mapping in magento config cannot be found,
    *  treat it as an additional text field when add to cart
    */
    additionalOptions: null,

    isMapCreated: false,

    _init: function init() {

    },

    _create: function create() {
      var self = this;
      // init react app
      require(["cillowreact"], function (){
        // setup configurator
        self._setupConfigurator(window.clara.api);
      });

      console.log(this.options.optionConfig);
    },

    _setupConfigurator: function _setupConfigurator(clara) {
      var self = this;
      // clara is already loaded at this point


      var dimensions = ['Height', 'Width (A)', 'Depth'];

      clara.on('configurationChange', function (ev) {
        if (!self.isMapCreated) {
          self.configMap = self._mappingConfiguration(clara.configuration.getAttributes(), self.options.optionConfig.options);
          self.configType = self._createConfigType(clara.configuration.getAttributes());
          self._createFormFields(self.options.optionConfig.options);
          self.isMapCreated = true;
        }
        // update add-to-cart form
        self._updateFormFields(clara.configuration.getConfiguration(), self.configMap, self.configType, self.additionalOptions, dimensions);
      });
    },

    _createConfigType: function createConfigType(claraConfig) {
      var configType = new Map();
      for (var key in claraConfig) {
        configType.set(claraConfig[key].name, claraConfig[key].type);
      }
      return configType;
    },

    // map clara configuration with magento (reverse map of this.options.optionConfig.options)
    /* this.options.optionConfig.options structure
    * options[key]:
    *               - title
    *               - selections[key]
    *                                  - name
    *  task: reverse the above key-value
    * config[title]:
    *               - key
    *               - selections[name]
    *                                  - key
    *
    * Note: title and name in config and options have to be exactly the name string
    * Name and title are unique
    * Make sure it's an one-to-one mapping, otherwise report error
    */
    _mappingConfiguration: function mappingConfiguration(claraCon, magentoCon) {
      var claraKey = new Map();
      var claraSelectionKey = new Map();
      claraSelectionKey.set('keyInParent', 'values');
      claraSelectionKey.set('type', 'array');
      claraKey.set('key', 'name');
      claraKey.set('type', 'object');
      claraKey.set('nested', claraSelectionKey);

      var magentoKey = new Map();
      var magentoSelectionKey = new Map();
      magentoSelectionKey.set('keyInParent', 'selections');
      magentoSelectionKey.set('type', 'object');
      magentoSelectionKey.set('matching', 'endsWith');
      magentoSelectionKey.set('key', 'name');
      magentoKey.set('key', 'title');
      magentoKey.set('type', 'object');
      magentoKey.set('matching', 'exactly');
      magentoKey.set('nested', magentoSelectionKey);

      // add volume price to claraCon
      var volumePrice = {
        name: "Volume_Price",
        type: 'Options',
        values: ['Leather_Price', 'Fabric_Price']
      };
      claraCon.push(volumePrice);

      this.additionalOptions = [];
      var map = this._reverseMapping(magentoCon, magentoKey, claraCon, claraKey, this.additionalOptions);
      if (!map) {
        console.error("Auto mapping clara configuration with magento failed");
        return null;
      }
      console.log(map);
      console.log(this.additionalOptions);

      return map;
    },


    // recursively reverse mapping in primary using target as reference
    _reverseMapping: function reverseMapping(primary, primaryKey, target, targetKey, optionsNotFound) {
      // result (using ES6 map)
      var map = new Map();
      // save the values in target that already find a matching, to ensure 1-to-1 mapping
      var valueHasMapped = new Map();

      // complexity = o(n^2), could be reduced to o(nlog(n))
      for (var pKey in primary) {
        var primaryValue = primaryKey.get('type') === 'object' ? primary[pKey][primaryKey.get('key')] : primary[pKey];
        if (!primaryValue) {
          console.error("Can not read primaryKey from primary");
          return null;
        }
        // search for title in claraCon
        var foundMatching = false;
        for (var tKey in target) {
          var targetValue = targetKey.get('type') === 'object' ? target[tKey][targetKey.get('key')] : target[tKey];
          if (!targetValue) {
            console.error("Can not read  targetKey from target");
            return null;
          }
          if (typeof primaryValue !== 'string' || typeof targetValue !== 'string') {
            console.error("Primary or target attribute value is not a string");
            return null;
          }
          var matching = false;
          if (primaryKey.get('matching') === 'exactly') {
            matching = (primaryValue === targetValue);
          }
          else if(primaryKey.get('matching') === 'endsWith') {
            matching = (primaryValue.endsWith(targetValue));
          }
          if (matching) {
            if (valueHasMapped.has(targetValue)) {
              console.error("Found target attributes with same name, unable to perform auto mapping");
              return null;
            }
            // find a match
            valueHasMapped.set(targetValue, true);
            var mappedValue = new Map();
            mappedValue.set('key', pKey);
            // recursively map nested object until primaryKey and targetKey have no 'nested' key
            if (primaryKey.has('nested') && targetKey.has('nested')) {
              var childMap = null;
              switch (target[tKey].type) {
                case 'Number':
                  childMap = [primaryValue];
                  break;
                case 'Options':
                  childMap = target[tKey][targetKey.get('nested').get('keyInParent')]
                  break;
                case 'Boolean':
                  childMap = ['true', 'false'];
                  break;
                case 'Color':
                  break;
              }
              var nestedMap = reverseMapping(primary[pKey][primaryKey.get('nested').get('keyInParent')],
                                               primaryKey.get('nested'),
                                               childMap,
                                               targetKey.get('nested'));
              mappedValue.set(targetKey.get('nested').get('keyInParent'), nestedMap);
            }
            map.set(targetValue, mappedValue);
            foundMatching = true;
            break;
          }
        }
        if (!foundMatching) {
          console.warn("Can not find primary value " + primaryValue + " in target config");
        }
      }

      // check all target to see if all target value has been mapped
      for (var tKey in target) {
        var targetValue = targetKey.get('type') === 'object' ? target[tKey][targetKey.get('key')] : target[tKey];
        if (!valueHasMapped.has(targetValue)) {
          if (targetKey.has('nested')) {
            optionsNotFound.push(targetValue);
          }
          else {
            console.warn("Target value " + targetValue + " has not been mapped!");
          }
        }
      }
      return map;
    },

    // check if clara configuration match with magento
    _validateConfiguration(claraCon, magentoCon) {

    },


    // add invisible input to product_addtocart_form
    _createFormFields(options) {
      // locate the form div
      var wrapper = document.getElementById('clara-form-configurations-wrapper');
      if (!wrapper) {
        console.error("Can not find clara configuration wrapper");
        return;
      }
      // check if the fields are already created
      if (wrapper.hasChildNodes()) {
        console.warn("Form fields already exist");
        return;
      }

      // insert input fields
      console.log("Making custom configurator...");
      var formFields = document.createElement('div');
      var optionCounter=1;
      var selectionCounter=1;
      for(var key in options) {
        // add div
        var optionEI = document.createElement('input');
        var optionQtyEI = document.createElement('input');

        // set option name and leave default value empty
        optionEI.setAttribute('name', 'bundle_option[' + key + ']');
        optionEI.setAttribute('id', 'bundle_option[' + key + ']');
        optionEI.setAttribute('value', '');
        optionEI.setAttribute('type','hidden');
        // set option quantity
        optionQtyEI.setAttribute('name', 'bundle_option_qty[' + key + ']');
        optionQtyEI.setAttribute('id', 'bundle_option_qty[' + key + ']');
        optionQtyEI.setAttribute('value', '');
        optionQtyEI.setAttribute('type', 'hidden');
        // append to form
        formFields.appendChild(optionEI);
        formFields.appendChild(optionQtyEI)
      }
      // additional options
      var addEI = document.createElement('input');
      addEI.setAttribute('name', 'clara_additional_options');
      addEI.setAttribute('id', 'clara_additional_options');
      addEI.setAttribute('value', '');
      addEI.setAttribute('type','hidden');
      formFields.appendChild(addEI);

      wrapper.appendChild(formFields);
      console.log("done");
    },

    _isNumber: function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    },

    // update form fields when configuration change
    _updateFormFields: function updateFormFields(config, map, configType, additionalOptions, dimensions) {
      var volume = 1;
      var additionalString = "";
      for (var attr in config) {
        if (map.has(attr)) {
          var attrId = map.get(attr).get('key');
          switch (configType.get(attr)) {
            case 'Number':
              // update number
              if (dimensions.includes(attr)) {
                volume = config[attr] * volume;
              }
              var attrValue = map.get(attr).get('values').get(attr).get('key');
              document.getElementById('bundle_option[' + attrId + ']').setAttribute('value', attrValue);
              document.getElementById('bundle_option_qty[' + attrId + ']').setAttribute('value', config[attr]);
              break;
            case 'Options':
              // update options
              // choose from leather or fabric
              if (attr === "Fabric Options" && config["Cover Material"] === "Leather" ||
                  attr === "Leather Options" && config["Cover Material"] === "Fabric") {
                break;
              }
              // sometimes config[attr] is an obj...
              var configString = typeof config[attr] == 'string' ? config[attr] : config[attr].value;
              var attrValue = map.get(attr).get('values').get(configString).get('key');
              document.getElementById('bundle_option[' + attrId + ']').setAttribute('value', attrValue);
              document.getElementById('bundle_option_qty[' + attrId + ']').setAttribute('value', '1');
              break;
            case 'Boolean':
              // update boolean
              var attrValue = map.get(attr).get('values').get(config[attr].toString()).get('key');
              document.getElementById('bundle_option[' + attrId + ']').setAttribute('value', attrValue);
              document.getElementById('bundle_option_qty[' + attrId + ']').setAttribute('value', '1');
              break;
            case 'Color':
              break;
          }


        }
        else if (additionalOptions.includes(attr)) {
          var optionString = "";
          if (typeof config[attr] == 'string') {
            optionString = config[attr];
          }
          else if (typeof config[attr] == 'number') {
            optionString = config[attr].toString();
          }
          else if (typeof config[attr] == 'object') {
            for (var key in config[attr]) {
              optionString = optionString + key + ": " + config[attr][key] + " ";
            }
          }
          else {
            console.warn("Don't know how to print " + attr);
          }
          additionalString = additionalString + attr + ": " + optionString + "\r\n";
        }
        else {
          console.warn(attr + " not found in config map");
        }
      }
      // update volume price
      var materialPrice = config['Cover Material'] === "Leather" ? "Leather_Price" : "Fabric_Price";
      var volumeId = map.get('Volume_Price').get('key');
      var volumeValue = map.get('Volume_Price').get('values').get(materialPrice).get('key');
      document.getElementById('bundle_option[' + volumeId + ']').setAttribute('value', volumeValue);
      document.getElementById('bundle_option_qty[' + volumeId + ']').setAttribute('value', volume);

      // update additional options
      document.getElementById('clara_additional_options').setAttribute('value', additionalString);
    }

  });

  return $.clara.Configurator;
});

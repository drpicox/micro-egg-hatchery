'use strict';

var makeBreedEgg = require('./makeBreedEgg');

function hatchEgg(egg, tools, hatchedEggs) {
  if (hatchedEggs.has(egg)) return;
  egg(tools);
  hatchedEggs.add(egg);
}

function hatchEggs(eggs, tools, hatchedEggs) {
  for (var i = 0; i < eggs.length; i++) {
    if (Array.isArray(eggs[i])) hatchEggs(eggs[i], tools, hatchedEggs);else hatchEgg(eggs[i], tools, hatchedEggs);
  }
}

function hatch() {
  var _isHatched = false;
  var hatchedEggs = new Set();

  var checkNoHatched = function () {
    if (_isHatched) throw new Error('cannot use tools once the egg is hatched');
  };

  var tools = {
    tool: function tool(name, value) {
      checkNoHatched();
      tools[name] = typeof value === 'function' ? function () {
        checkNoHatched();
        value.apply(void 0, arguments);
      } : value;
    },
    isHatched: function isHatched() {
      return _isHatched;
    }
  };

  var _makeBreedEgg = makeBreedEgg(),
      breedEgg = _makeBreedEgg[0],
      getBreed = _makeBreedEgg[1];

  hatchEgg(breedEgg, tools, hatchedEggs);

  for (var _len = arguments.length, eggs = new Array(_len), _key = 0; _key < _len; _key++) {
    eggs[_key] = arguments[_key];
  }

  hatchEggs(eggs, tools, hatchedEggs);
  _isHatched = true;
  delete tools.tool;
  return getBreed();
}

module.exports = hatch;

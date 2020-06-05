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
  var hatchedEggs = new Set();
  var tools = {
    tool: function tool(name, value) {
      tools[name] = value;
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
  return getBreed();
}

export default hatch;

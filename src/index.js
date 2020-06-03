const makeBreedEgg = require("./makeBreedEgg");

function hatchEgg(egg, incubators) {
  egg(incubators);
}

function hatchEggs(eggs, incubators) {
  for (var i = 0; i < eggs.length; i++)
    if (Array.isArray(eggs[i])) hatchEggs(eggs[i], incubators);
    else hatchEgg(eggs[i], incubators);
}

export default function hatch(...eggs) {
  const incubators = {
    incubator(name, value) {
      incubators[name] = value;
    }
  };

  const [breedEgg, getBreed] = makeBreedEgg();

  hatchEgg(breedEgg, incubators);
  hatchEggs(eggs, incubators);

  return getBreed();
}

const { defineProperty } = Object;

module.exports = function makeBreedEgg() {
  let breeds = {};
  let values = {};

  const breedEgg = ({ incubator }) => {
    incubator("breed", function breed(name, factory) {
      const oldBreeds = breeds;
      const newBreeds = Object.create(oldBreeds);
      defineProperty(newBreeds, name, {
        get: function() {
          const value = factory(oldBreeds);
          defineProperty(newBreeds, name, { value, configurable: true });
          return value;
        },
        configurable: true
      });
      breeds = newBreeds;
    });
  };

  const getBreed = () => breeds;

  return [breedEgg, getBreed];
};

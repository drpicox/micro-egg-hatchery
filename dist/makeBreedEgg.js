"use strict";

const {
  defineProperty
} = Object;

module.exports = function () {
  const breeds = Object.create(null);
  const factories = Object.create(null);
  return [({
    tool
  }) => {
    tool('breed', function (name, factory) {
      const uberFactory = factories[name];
      const localBreeds = Object.create(breeds);
      defineProperty(localBreeds, name, {
        get: uberFactory
      });
      factories[name] = factory;
      defineProperty(breeds, name, {
        get() {
          const value = factory(localBreeds);
          defineProperty(breeds, name, {
            value,
            configurable: true
          });
          delete factories[name];
          return value;
        },

        configurable: true
      });
    });
  }, () => breeds];
};
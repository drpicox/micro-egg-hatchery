const {defineProperty} = Object

module.exports = function makeBreedEgg() {
  const breeds = Object.create(null)
  const factories = Object.create(null)

  const breedEgg = ({tool}) => {
    tool('breed', function breed(name, factory) {
      const uberFactory = factories[name]
      const localBreeds = Object.create(breeds)
      defineProperty(localBreeds, name, {get: uberFactory})
      factories[name] = factory

      defineProperty(breeds, name, {
        get() {
          const value = factory(localBreeds)
          defineProperty(breeds, name, {value, configurable: true})
          delete factories[name]
          return value
        },
        configurable: true,
      })
    })
  }

  const getBreed = () => breeds

  return [breedEgg, getBreed]
}

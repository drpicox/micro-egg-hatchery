const {defineProperty} = Object

module.exports = function makeBreedEgg() {
  const breeds = Object.create(null)
  const factories = Object.create(null)

  const breedEgg = ({tool}) => {
    tool('breed', function breed(name, rawFactory) {
      const uberFactory = factories[name]
      const factory = () => {
        defineProperty(breeds, name, {get: uberFactory, configurable: true})
        const value = rawFactory(breeds)
        defineProperty(breeds, name, {value, configurable: true})
        return value
      }
      factories[name] = factory

      defineProperty(breeds, name, {get: factory, configurable: true})
    })
  }

  const getBreed = () => breeds

  return [breedEgg, getBreed]
}

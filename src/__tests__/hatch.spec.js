import hatch from '../'

test('you can hatch an egg', () => {
  const egg = () => {}
  hatch(egg)
})

test('hatching eggs breed things', () => {
  const egg = ({breed}) => breed('chick', () => true)
  const {chick} = hatch(egg)
  expect(chick).toBe(true)
})

test('breed receives previous breeds', () => {
  const egg = ({breed}) => {
    breed('chick', () => 1)
    breed('chick', ({chick}) => chick + 1)
  }

  const {chick} = hatch(egg)
  expect(chick).toBe(2)
})

test('deeply receives previous breeds', () => {
  const egg = ({breed}) => {
    breed('chick', () => 1)
    breed('chick', ({chick}) => chick + 2)
    breed('chick', ({chick}) => chick + 3)
    breed('chick', ({chick}) => chick + 4)
  }

  const {chick} = hatch(egg)
  expect(chick).toBe(10)
})

test('once breed function finishes, breeds replaces the previous definition by the final definition', () => {
  let previousChick, foundBreeds
  const egg = ({breed}) => {
    breed('chick', breeds => {
      previousChick = breeds.chick
      foundBreeds = breeds
      return 'its a chick'
    })
  }

  const {chick} = hatch(egg)
  expect(previousChick).toBeUndefined()
  expect(foundBreeds.chick).toBe('its a chick')
  expect(chick).toBe('its a chick')
})

test('breed multiple things', () => {
  const egg = ({breed}) => {
    breed('chick', () => true)
    breed('duckling', () => true)
  }

  const {chick, duckling} = hatch(egg)

  expect(chick).toBe(true)
  expect(duckling).toBe(true)
})

test('breed receives other things, not matter the order', () => {
  const egg = ({breed}) => {
    breed('chick', ({small}) => small)
    breed('small', () => true)
  }

  const {chick} = hatch(egg)

  expect(chick).toBe(true)
})

test('breed function does nothing if result is not asked', () => {
  const log = []

  function logAndReturn(value) {
    log.push(value)
    return value
  }

  const egg = ({breed}) => {
    breed('chick', ({small}) => logAndReturn(small && 'chick'))
    breed('small', () => logAndReturn('small'))
    breed('big', () => logAndReturn('big'))
  }

  const {chick} = hatch(egg)
  expect(log).toEqual(['small', 'chick'])
  expect(chick).toBe('chick')
})

test('breed functions executes at most once', () => {
  const log = []

  function logAndReturn(value) {
    log.push(value)
    return value
  }

  const egg = ({breed}) => {
    breed('chick', ({small}) => logAndReturn(small && 'chick'))
    breed('small', () => logAndReturn('small'))
    breed('big', () => logAndReturn('big'))
  }

  const hatchery = hatch(egg)
  expect(hatchery.chick).toBe('chick')
  expect(hatchery.chick).toBe('chick')
  expect(log).toEqual(['small', 'chick'])
})

test('multiple eggs', () => {
  const chickenEgg = ({breed}) => breed('chick', () => true)
  const duckEgg = ({breed}) => breed('duckling', () => true)

  const {chick, duckling} = hatch(chickenEgg, duckEgg)

  expect(chick).toBe(true)
  expect(duckling).toBe(true)
})

test('multiple eggs nested array', () => {
  const chickenEgg = ({breed}) => breed('chick', () => true)
  const duckEgg = ({breed}) => breed('duckling', () => true)

  const {chick, duckling} = hatch([[chickenEgg, [[duckEgg]]]])

  expect(chick).toBe(true)
  expect(duckling).toBe(true)
})

test('eggs hatch once', () => {
  const log = []
  function egg() {
    log.push('egg')
  }

  const eggs = [egg, egg, [egg], [[[egg]]]]
  hatch(eggs)
  expect(log).toEqual(['egg'])
})

test('tool adds more tools to hatch other eggs', () => {
  function familyEgg({breed, tool}) {
    const family = []
    tool('addMember', member => family.push(member))
    breed('family', () => family)
  }

  function chickenEgg({addMember}) {
    addMember({type: 'chicken'})
  }

  const {family} = hatch(familyEgg, chickenEgg)
  expect(family).toEqual([{type: 'chicken'}])
})

test('tools are executed before hatching and they are designed to concrete the new breed', () => {
  const chickenEgg = ({tool, breed}) => {
    let color = 'white'
    tool('withColor', newColor => (color = newColor))
    breed('chick', () => ({chick: true, color}))
  }

  const yellowChicksEgg = ({withColor}) => {
    withColor('yellow')
  }

  const {chick} = hatch(chickenEgg, yellowChicksEgg)

  expect(chick).toEqual({chick: true, color: 'yellow'})
})

test('tools can overwrite and use previous tools', () => {
  const chickenEgg = ({tool, breed}) => {
    let color = 'white'
    tool('withColor', newColor => (color = newColor))
    breed('chick', () => ({chick: true, color}))
  }

  const ishColoredChicksEgg = ({tool, withColor}) => {
    tool('withColor', color => withColor(`${color}ish`))
  }

  const yellowChicksEgg = ({withColor}) => {
    withColor('yellow')
  }

  const {chick} = hatch(chickenEgg, ishColoredChicksEgg, yellowChicksEgg)

  expect(chick).toEqual({chick: true, color: 'yellowish'})
})

test('tools, unlike breeds, are executed in the hatch order', () => {
  const eggEgg = ({tool}) => {
    tool('chickDNA', 'CACAGAATA')
  }
  const chickenEgg = ({chickDNA, breed}) => {
    breed('chick', () => ({chickDNA}))
  }

  const eggThenChick = hatch(eggEgg, chickenEgg).chick
  const chickThenEgg = hatch(chickenEgg, eggEgg).chick

  expect(eggThenChick).toEqual({chickDNA: 'CACAGAATA'})
  expect(chickThenEgg).toEqual({chickDNA: undefined})
})

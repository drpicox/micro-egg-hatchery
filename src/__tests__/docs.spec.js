import hatch from '../'

test('usage', () => {
  function firstEgg({tool, breed}) {
    const list = ['first']

    tool('addItem', item => list.push(item))
    breed('list', () => list)
  }

  function secondEgg({addItem}) {
    addItem('second')
  }

  const hatchery = hatch(firstEgg, secondEgg)
  expect(hatchery.list).toEqual(['first', 'second'])
})

test('hatch', () => {
  const log = []
  function egg() {
    log.push('opened')
  }

  hatch(egg)
  expect(log).toEqual(['opened'])
})

test('hatch more than once', () => {
  const log = []
  function makeEgg(name) {
    return function egg() {
      log.push(name)
    }
  }

  const eggs = [makeEgg('egg1'), makeEgg('egg2')]
  hatch(eggs)
  expect(log).toEqual(['egg1', 'egg2'])
})

test('hatch eggs inside eggs', () => {
  const log = []
  function makeEgg(name) {
    return function egg() {
      log.push(name)
    }
  }

  function makeManyEggs(base) {
    return [makeEgg(`${base}1`), makeEgg(`${base}2`)]
  }

  const eggs = [makeEgg('egg1'), makeManyEggs('more')]
  hatch(eggs)
  expect(log).toEqual(['egg1', 'more1', 'more2'])
})

test('hatch eggs inside arrays of ... of arrays', () => {
  const log = []
  function makeEgg(name) {
    return function egg() {
      log.push(name)
    }
  }

  const eggs = [
    makeEgg('egg1'),
    [makeEgg('egg2'), [makeEgg('egg3'), [makeEgg('egg4')]]],
    [[[[[[[[[[[[[[[[[[[[[[[makeEgg('egg5')]]]]]]]]]]]]]]]]]]]]]]],
  ]
  hatch(eggs)
  expect(log).toEqual(['egg1', 'egg2', 'egg3', 'egg4', 'egg5'])
})

test('hatch eggs once', () => {
  const log = []
  function egg() {
    log.push('egg')
  }

  const eggs = [egg, egg]
  hatch(eggs)
  expect(log).toEqual(['egg'])
})

test('breed defines a new symbol', () => {
  function chickenEgg({breed}) {
    breed('chick', () => 'I am a chick')
  }

  const breeds = hatch(chickenEgg)
  expect(breeds.chick).toBe('I am a chick')
})

test('breed factory function receives other breeds', () => {
  function oneEgg({breed}) {
    breed('one', () => 1)
  }

  function twoEgg({breed}) {
    breed('two', ({one}) => one + one)
  }

  const egg = [oneEgg, twoEgg]
  const breeds = hatch(egg)
  expect(breeds.one).toBe(1)
  expect(breeds.two).toBe(2)
})

test('breed factory function receives other breeds without care of the order', () => {
  function threeEgg({breed}) {
    breed('three', ({one, two}) => one + two)
  }

  function oneEgg({breed}) {
    breed('one', () => 1)
  }

  function twoEgg({breed}) {
    breed('two', ({one}) => one + one)
  }

  const egg = [threeEgg, oneEgg, twoEgg]
  const breeds = hatch(egg)
  expect(breeds.one).toBe(1)
  expect(breeds.two).toBe(2)
  expect(breeds.three).toBe(3)
})

test('breed factory function is executed when it is needed', () => {
  const log = ['setup']

  function logThree({breed}) {
    breed('three', ({one, two}) => {
      log.push('three')
      return one + two
    })
  }
  function logOne({breed}) {
    breed('one', () => {
      log.push('one')
      return 1
    })
  }
  function logTwo({breed}) {
    breed('two', ({one}) => {
      log.push('two')
      return one + one
    })
  }

  const egg = [logThree, logOne, logTwo]
  log.push('hatch')
  const breeds = hatch(egg)
  log.push('hatched')
  expect(breeds.two).toBe(2)
  log.push('end')
  expect(log).toEqual(['setup', 'hatch', 'hatched', 'one', 'two', 'end'])
})

test('breed factory function is called at most once', () => {
  const log = ['setup']

  function logThree({breed}) {
    breed('three', ({one, two}) => {
      log.push('three')
      return one + two
    })
  }
  function logOne({breed}) {
    breed('one', () => {
      log.push('one')
      return 1
    })
  }
  function logTwo({breed}) {
    breed('two', ({one}) => {
      log.push('two')
      return one + one
    })
  }

  const egg = [logThree, logOne, logTwo]
  log.push('hatch')
  const breeds = hatch(egg)
  log.push('hatched')
  expect(breeds.one).toBe(1)
  expect(breeds.two).toBe(2)
  expect(breeds.three).toBe(3)
  log.push('end')
  expect(log).toEqual([
    'setup',
    'hatch',
    'hatched',
    'one',
    'two',
    'three',
    'end',
  ])
})

test('tool', () => {
  function listEgg({tool, breed}) {
    const list = []
    tool('addElement', e => list.push(e))
    breed('list', () => list)
  }

  function oneEgg({addElement}) {
    addElement('one')
  }

  const breeds = hatch(listEgg, oneEgg)
  expect(breeds.list).toEqual(['one'])
})

test('isHatched', () => {
  let foundIsHatched, foundIsHatchedResult
  function exampleEgg({isHatched, breed}) {
    foundIsHatched = isHatched
    foundIsHatchedResult = isHatched()
    breed('isHatched', () => isHatched())
  }

  expect(foundIsHatched).toBeUndefined()
  const breeds = hatch(exampleEgg)
  expect(foundIsHatchedResult).toBe(false)
  expect(foundIsHatched()).toBe(true)
  expect(breeds.isHatched).toBe(true)
})

test('Tools rod outside hatch', () => {
  function listEgg({tool, breed}) {
    const list = []
    tool('addElement', e => list.push(e))
    breed('list', () => list)
  }

  let foundAddElement
  function hijackEgg({addElement}) {
    foundAddElement = addElement
  }

  const breeds = hatch(listEgg, hijackEgg)
  expect(breeds.list).toEqual([])
  expect(foundAddElement).toBeInstanceOf(Function)
  expect(foundAddElement).toThrow()
})

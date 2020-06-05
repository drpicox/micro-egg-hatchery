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

  const hatchings = hatch(chickenEgg)
  expect(hatchings.chick).toBe('I am a chick')
})

test('breedFn receives other hatchings', () => {
  function oneEgg({breed}) {
    breed('one', () => 1)
  }

  function twoEgg({breed}) {
    breed('two', ({one}) => one + one)
  }

  const egg = [oneEgg, twoEgg]
  const hatchings = hatch(egg)
  expect(hatchings.one).toBe(1)
  expect(hatchings.two).toBe(2)
})

test('breedFn receives other hatchings without care of the order', () => {
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
  const hatchings = hatch(egg)
  expect(hatchings.one).toBe(1)
  expect(hatchings.two).toBe(2)
  expect(hatchings.three).toBe(3)
})

test('breedFn is executed when it is needed', () => {
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
  const hatchings = hatch(egg)
  log.push('hatched')
  expect(hatchings.two).toBe(2)
  log.push('end')
  expect(log).toEqual(['setup', 'hatch', 'hatched', 'one', 'two', 'end'])
})

test('breedFn is called at most once', () => {
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
  const hatchings = hatch(egg)
  log.push('hatched')
  expect(hatchings.one).toBe(1)
  expect(hatchings.two).toBe(2)
  expect(hatchings.three).toBe(3)
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
    tool('list', list)
    breed('list', () => list)
  }

  function oneEgg({list}) {
    list.push('one')
  }

  const hatchings = hatch(listEgg, oneEgg)
  expect(hatchings.list).toEqual(['one'])
})

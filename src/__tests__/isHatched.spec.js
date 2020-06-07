import hatch from '../'

test('isHatched is false while hatching', () => {
  let isHatchedValue

  const anEgg = ({isHatched}) => {
    isHatchedValue = isHatched()
  }
  hatch(anEgg)

  expect(isHatchedValue).toBe(false)
})

test('isHatched is true while breeding', () => {
  let isHatchedValue

  const anEgg = ({breed, isHatched}) => {
    breed('a', () => {
      isHatchedValue = isHatched()
      return 1
    })
  }

  const {a} = hatch(anEgg)
  expect(a).toEqual(1)
  expect(isHatchedValue).toBe(true)
})

test('isHatched is true after hatch', () => {
  let foundIsHatched
  const anEgg = ({isHatched}) => {
    foundIsHatched = isHatched
  }

  hatch(anEgg)
  expect(foundIsHatched()).toBe(true)
})

test('tool fails if isHatched', () => {
  let foundTool
  const anEgg = ({tool}) => {
    foundTool = tool
  }

  hatch(anEgg)

  expect(() => foundTool('newTool', () => {})).toThrow(
    /cannot use tools once the egg is hatched/,
  )
})

test('custom function tools expire when the egg is hatched', () => {
  let foundCustomTool
  function customToolEgg({tool}) {
    tool('customTool', () => true)
  }
  function recoverCustomToolEgg({customTool}) {
    foundCustomTool = customTool
  }

  hatch(customToolEgg, recoverCustomToolEgg)

  expect(() => foundCustomTool()).toThrow(
    /cannot use tools once the egg is hatched/,
  )
})

const makeBreedEgg = require('./makeBreedEgg')

function hatchEgg(egg, tools, hatchedEggs) {
  if (hatchedEggs.has(egg)) return
  egg(tools)
  hatchedEggs.add(egg)
}

function hatchEggs(eggs, tools, hatchedEggs) {
  for (let i = 0; i < eggs.length; i++)
    if (Array.isArray(eggs[i])) hatchEggs(eggs[i], tools, hatchedEggs)
    else hatchEgg(eggs[i], tools, hatchedEggs)
}

export default function hatch(...eggs) {
  let isHatched = false
  const hatchedEggs = new Set()
  const checkNoHatched = () => {
    if (isHatched) throw new Error('cannot use tools once the egg is hatched')
  }

  const tools = {
    tool(name, value) {
      checkNoHatched()
      tools[name] =
        typeof value === 'function'
          ? (...args) => {
              checkNoHatched()
              value(...args)
            }
          : value
    },
    isHatched() {
      return isHatched
    },
  }

  const [breedEgg, getBreed] = makeBreedEgg()

  hatchEgg(breedEgg, tools, hatchedEggs)
  hatchEggs(eggs, tools, hatchedEggs)
  isHatched = true
  delete tools.tool

  return getBreed()
}

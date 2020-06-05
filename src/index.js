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
  const hatchedEggs = new Set()
  const tools = {
    tool(name, value) {
      tools[name] = value
    },
  }

  const [breedEgg, getBreed] = makeBreedEgg()

  hatchEgg(breedEgg, tools, hatchedEggs)
  hatchEggs(eggs, tools, hatchedEggs)

  return getBreed()
}

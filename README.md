<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Micro Egg Hatchery 🐣](#micro-egg-hatchery-)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API](#api)
    - [Hatch](#hatch)
    - [Breed](#breed)
    - [Tool](#tool)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Micro Egg Hatchery 🐣

> 🥚 Eggs are the new 🦆 ducks.

Minimal version of the:

- https://github.com/drpicox/egg-hatchery

It has less code, less checks, and it is less powerful. But it is almost API
compatible.

```javascript
import hatch from 'micro-egg-hatchery'
import reduxEgg from 'redux-egg'
import counterEgg, {increment, getCount} from '@my/counter-egg'

test('counter egg increments in one', () => {
  const {store} = hatch(reduxEgg, counterEgg)
  store.dispatch(increment())
  expect(getCount(store.getState())).toBe(1)
})
```

## Installation

Install the last version with:

```
npm install micro-egg-hatchery
```

## Usage

```javascript
import hatch from 'micro-egg-hatchery'

// this is an egg
function firstEgg({tool, breed}) {
  const list = ['first']

  // use tool to make a tool available for other egg
  tool('addItem', item => list.push(item))
  // use breed to define a factory
  breed('list', () => list)
}

// this is another egg
function secondEgg({addItem}) {
  // it uses the tool defined by the firstEgg
  addItem('second')
}

// hatch opens the egg
const hatchery = hatch(firstEgg, secondEgg)
// the resulting hatchery
// contains the list defined in the firstEgg
// and this list contains the item added by the secondEgg
expect(hatchery.list).toEqual(['first', 'second'])
```

## API

Please, refer to the [redux-egg](https://github.com/drpicox/redux-egg) to know
how redux works with eggs.

- https://github.com/drpicox/redux-egg

### Hatch

The hatch function opens an egg.

```typescript
type Egg = Function | Egg[];
function hatch(...eggs: Egg[]): Hatchings { ... }
```

**Example**:

```javascript
import hatch from 'micro-egg-hatchery'

const log = []
function egg() {
  log.push('opened')
}

hatch(egg)
expect(log).toEqual(['opened'])
```

<details>
<summary>You can hatch more than one egg at once:</summary>

```javascript
import hatch from 'micro-egg-hatchery'

const log = []
function makeEgg(name) {
  return function egg() {
    log.push(name)
  }
}

const eggs = [makeEgg('egg1'), makeEgg('egg2')]
hatch(eggs)
expect(log).toEqual(['egg1', 'egg2'])
```

</details>

<details>
<summary>And hatch eggs inside other eggs:</summary>

```javascript
import hatch from 'micro-egg-hatchery'

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
```

</details>

<details>
<summary>Or eggs inside an arrays of arrays of ... of arrays of eggs:</summary>

```javascript
import hatch from 'micro-egg-hatchery'

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
```

</details>

<details>
<summary>Eggs are hatched once. Even if they are include twice:</summary>

```javascript
import hatch from 'micro-egg-hatchery'

const log = []
function egg() {
  log.push('egg')
}

const eggs = [egg, egg]
hatch(eggs)
expect(log).toEqual(['egg'])
```

</details>

<details>
<summary>Note that the objective of nesting eggs, 
and do not execute twice the same egg, is to make possible to include
your egg dependencies.</summary>

```javascript
import hatch from 'micro-egg-hatchery'
import usersEgg from '@my/users-egg'
import moviesEgg from '@my/movies-egg'

function rankingEgg({users, movies}) {
  // do something with users and movies
}

const egg = [usersEgg, moviesEgg, rankingEgg]
export default egg
```

</details>

### Breed

All eggs receives the `breed` function. This function allows eggs to create new
breeds. Breeds are the variables that can be obtained with the `hatch(...)`
result. But breeds results are not given directly. They are defined, but are
hatched only under demmand, when their use is required. Because of it, breeds
receive a `name` and a function that creates this new breed.

```typescript
function breed(name: string, breedFn: Hatchings): void { ... }
// injected at egg
function egg({ breed }): void { ... }
```

**Parameters**:

- `name`: name of the new breed
- `breedFn`: a function that returns the new breed

**Example**:

```typescript
import hatch from 'micro-egg-hatchery'

function chickenEgg({breed}) {
  breed('chick', () => 'I am a chick')
}

const hatchings = hatch(chickenEgg)
expect(hatchings.chick).toBe('I am a chick')
```

<details>
<summary>The `breedFn` passed to `breed` also 
receives all the hatchings defined in all eggs.</summary>

```javascript
import hatch from 'micro-egg-hatchery'

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
```

</details>

<details>
<summary>The order of breed calls are not important,
any breedFn can use other hatchings, even if they are
defined after them.</summary>

```javascript
import hatch from 'micro-egg-hatchery'

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
```

</details>
<details>
<summary>The `breedFn` are called only when they are used.
If their breed is not used in the hatching, then
they are neved called.</summary>

```javascript
import hatch from 'micro-egg-hatchery'

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
```

</details>
<details>
<summary>The `breedFn` are called at most once.</summary>

```javascript
import hatch from 'micro-egg-hatchery'

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
expect(log).toEqual(['setup', 'hatch', 'hatched', 'one', 'two', 'three', 'end'])
```

</details>

### Tool

All eggs receives tools. There are two tools default for all eggs, and then,
each egg can define new tools for the following eggs. Unlike breeds, tools are
affected by the order of execution. Any breed can access to previous tools, but
not to following tools. Eggs can define new tools with the `tool` function. It
receives a `name` for the tool, and a value. Next eggs will have access to that
tools through that name.

```typescript
function tool(name: string, tool: any): void { ... }
// injected at egg
function egg({ tool, breed, ...otherTools }): void { ... }
```

**Parameters**:

- `name`: name of the new tool
- `value`: value injected to an egg when it requires the tool

**Example**:

```typescript
import hatch from 'micro-egg-hatchery'

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
```

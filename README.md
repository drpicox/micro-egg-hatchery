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

## Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
  - [# hatch(eggs)](#-hatcheggs)
  - [# breed](#-breed)
  - [# tool](#-tool)
  - [# isHatched](#-ishatched)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

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

### # hatch(eggs)

The hatch function opens eggs. It executes a series of well-ordered module
initialization functions and makes their results available. These initialization
functions are called eggs. It also accepts grouping eggs in arrays; we also call
those arrays eggs. It allows you to split your application into several eggs;
they should be small, well-defined, and modular. Glue all your eggs together
with arrays, with any nesting levels. It also ignores repeated eggs, so you can
include any egg in your array that you need and do not worry about duplications
in initializations.

```typescript
type Egg = Function | Egg[];
function hatch(...eggs: Egg[]): Breeds { ... }
```

An egg is a function that receives tools and uses them to define new breeds.
Eggs should return undefined. Hatch accepts one or more eggs; it executes each
egg function in the same order that it is received. As a result, the hatch
function returns all the breeds defined by each egg. Hatch accepts eggs inside
arrays, and arrays inside arrays with eggs with any level of nesting. Hatch
flattens that array and executes all eggs in order. If there is any egg
duplicated, it invokes the egg's first occurrence and ignores all subsequent egg
appearances. Aka, if the same function instance appears twice, it executes when
it first time and does not call it anymore.

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

Opening more than one egg at once:

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

Nesting eggs inside eggs:

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

Nesting eggs inside eggs with any arbitrary nesting level:

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

Opening duplicated eggs once:

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

Note that the objective of nesting eggs, and do not execute twice the same egg,
is to make possible to include your egg dependencies:

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

### # breed

The Egg Hatchery is a Dependency Injection library for Javascript. It leverages
the Javascript getters to create a smooth programming experience on all eggs and
modules and define their properties and needs. The library wires all
dependencies together, so the programmer does not need to think about running
order. Each property has a factory function associated. This factory function
receives all available properties defined by any of the hatched modules; uses
those properties need to generate its value. Factories execute at most once and
only if someone outside hatch consumes its result.

The breed function defines those properties. It receives two parameters the name
and the breed factory function. The name is the name of the property; it is the
property name of the breeds object, which corresponds to the generated value of
the breed factory. The breed factory function receives all other defined breeds
and produces the result. There is no breed factory function execution before the
hatch call, although the hatch function returns the breeds object. When any
piece of code access to that object, and uses one property, hatch automatically
calls to the breed factory that generates that value and all its corresponding
dependencies and generates the value.

```typescript
function breed(name: string, breedFactoryFn: Breeds): void { ... }
// injected at egg
function egg({ breed }): void { ... }
```

**Parameters**:

- `name`: name of the new breed
- `breedFactoryFn`: a function that returns the new breed value

**Example**:

```typescript
import hatch from 'micro-egg-hatchery'

function chickenEgg({breed}) {
  breed('chick', () => 'I am a chick')
}

const breeds = hatch(chickenEgg)
expect(breeds.chick).toBe('I am a chick')
```

Using breeds defined by other eggs:

```javascript
import hatch from 'micro-egg-hatchery'

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
```

Using breeds in dependency order, not definition order:

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
const breeds = hatch(egg)
expect(breeds.one).toBe(1)
expect(breeds.two).toBe(2)
expect(breeds.three).toBe(3)
```

Breed factory functions are not executed if not used:

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
const breeds = hatch(egg)
log.push('hatched')
expect(breeds.two).toBe(2)
log.push('end')
expect(log).toEqual(['setup', 'hatch', 'hatched', 'one', 'two', 'end'])
```

The breed factory functions are called at most once:

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
const breeds = hatch(egg)
log.push('hatched')
expect(breeds.one).toBe(1)
expect(breeds.two).toBe(2)
expect(breeds.three).toBe(3)
log.push('end')
expect(log).toEqual(['setup', 'hatch', 'hatched', 'one', 'two', 'three', 'end'])
```

### # tool

The breed function is powerful, but it gives a stable result after
initialization. Some times, some modules require, or accept, configuration. The
tool function allows establishing these configurations before any breeding.

Tools are just the opposite of breeds. If breeds are lazy and order independent,
tools are eager and order dependent. Tools are available directly in the egg,
you can use them immediately, but they are order sensitive; you cannot use any
tool not defined by a previous egg. Two examples of tools are the breed
function, and the tool function itself. Both methods are available to all eggs
as tools; they allow eggs to modify configurations for other eggs and the hatch
result.

Tools execute greedily. Incorrect use may slow down the application boot and
tests. Think about tools as configuration tools, nothing more. Tools should
allow defining variables, options, and other things required in your module.
They should compute nothing. Because configurations affect breed function
factories, it is the task of the breed function factory to collect all
configuration values and calculate the result. That automatically removes the
computation if no one access to the property. This property is especially
critical for tests.

```typescript
function tool(name: string, tool: any): void { ... }
// injected at egg
function egg({ tool, breed, ...otherTools }): void { ... }
```

**Parameters**:

- `name`: name of the new tool
- `value`: value injected to an egg when it requires the tool

**Example**:

```javascript
import hatch from 'micro-egg-hatchery'

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
```

### # isHatched

Tools are meant to use while the egg is hatching and before any breed instances.
The `isHatched` returns a boolean.

```typescript
function isHatched(): boolean { ... }
```

**Example**:

```javascript
import hatch from 'micro-egg-hatchery'

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
```

All function tools stop working when the egg is hatched:

```javascript
import hatch from 'micro-egg-hatchery'

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
```

# Redux Connect (declarative)

A more declarative approach to working with Redux without writing numerous HoC containers. Uses a component based approach and children functions similar to approaches in react-motion and react-router.

## Why?

This library was really developed as an alternative to using the `react-redux` package and its use of higher order components (HoC's) for wrapping components that needed state statically at build time.

I wanted a more declarative and component based API for connecting application state to my components. I was inspired by the _render props_ and _children as function_ approach seen in a number of other libraries.

Hopefully you'll find it useful, too. YMMV.

## Installation

This package should always work with the latest version of React, which currently is 16.x; and the latest version of Redux.

```sh
npm install --save redux-connect-component
```

or, if using `yarn`

```sh
yarn add redux-connect-component
```

If you're not using `npm` or a modern module bundler and would prefer to use a UMD build that makes the included components available in a global named `ReduxConnect`, you can grab this pre-built version from [unpkg.com](unpkg.com/redux-connect-component@latest/dist).

## Usage

`redux-connect-component` provides two components, `<Provider>` and `<Connect>`. `Provider` works nearly identically to the `Provider` in `react-redux`, in that it lets you provide your redux store, via context, to it's child component tree.

### `<Provider store>`

`Provider` takes one prop which should be the Redux store, or an object with a matching API, ie an object with a `subscribe`, `getState` and `dispatch` method provided. It will ensure the `store` is available to any `<Connect>` components

#### Props

* **store** _{Object([Redux Store](http://redux.js.org/docs/api/Store.html))}_ - the single, redux store object for your application
* **children** = _{ReactElement}_ - the single, root element of your React component tree

#### Example

```js
const store = createStore(reducer);

ReactDOM.render(
  <Provider store={store}>
    <Child />
  </Provider>,
  document.querySelector("#root")
);
```

### `<Connect [selector actions]>`

With the `Connect` component, we can declaratively get access to this store's state and provide it to our own components directly. The `Connect` component takes two props:

#### Props

* **selector** _{Function}_ - a single selector function, which is passed the store's state as an argument and should return the state slice to pass to the children function.
* **actions** _{Function|Object}_ - an object of action creator functions. Each of these will be wrapped with a call the store's `dispatch` method with their return value. If passed a function, it will be called with the store's `dispatch` method as an argument and expects it to return an object of bound action creator methods.
* **children** _{Function}_ - a rendering function which will receive an object with the following properties:
  * **state** {Object} - the slice of state returned by the function or function mapping object passed to the `selector` property. (_only if a `selector` prop is passed to `Connect`_)
  * **dispatch** {Function} - the store's `dispatch` method (_only if *no* `actions` prop is passed to `Connect`_)
  * **actions** {Object} - an object of action creators from the `actions` property, each bound to call the store's `dispatch` method with their return value. (_only if an `actions` prop is passed to `Connect`_)

#### Children Function Parameters

The props you pass to the `Connect` component determine whether the `Connect` component will subscribe to store updates and the types and order of the props the children function recieves.

**Pass just `dispatch`**

```
<Connect>{(dispatch) => {
  /* ... */
}}
</Connect>
```

With no props, `Connect` will not subscribe to store updates and will pass the store's `dispatch` method to the children function.

**Pass state slice and `dispatch`**

```
const select = state => state.foo;
<Connect selector={select}>{(state, dispatch) => {
  /* ... use state.foo ... */
}}
</Connect>
```

With a `selector` prop, the `Connect` component will subscribe to store updates and pass the slice of state returned by the selector as the first parameter and the store's `dispatch` method as the second parameter.

**Pass bound actions only**

```
const actions = {
  setFoo: () => ({ type: 'ACTION' })
};
<Connect actions={actions}>{(actions) => {
  /* ... use action.setFoo() ... */
}}
</Connect>
```

With an `actions` prop, the `Connect` component will not subscribe to store updates and will pass the bound action creators as an object as the only param to the children function.

**Pass state slice and bound actions**

```
const select = state => state.foo;
const actions = {
  setFoo: () => ({ type: 'ACTION' })
};
<Connect selector={select} actions={actions}>{(state, actions) => {
  /* ... use action.setFoo(), state.foo ... */
}}
</Connect>
```

With both `actions` and `selector` props, the `Connect` component will subscribe to store updates and pass the slice of state returned from the selector as the first parameter and the bound action creators object as the second parameter to the children function.

#### Example

```js
// Assume our Redux store has a `count` value
// { count: 0 }

// A selector to get the `count` slice of state
const getCount = state => state.count;
// Action creator for changing the count state
const changeCount = value => ({ type: 'CHANGE_COUNT', value });

// A simple counter component
const Counter = ({ value, onChange }) => (
  <div>
    {value}{" "}
    <button onClick={() => onChange(value + 1)}>+</button>
    <button onClick={() => onChange(value - 1)}>-</button>
  </div>
);

// We can use Connect declaratively to get the state slice we need as well
// as our bound action creators; and pass them as props to any children that
// need them.
const App = () => (
  <Provider store={store}>
    <Connect selector={getCount} actions={{ changeCount }}>{
      ({ state, dispatch, actions }) => (
        <Counter value={state.count} onChange={actions.changeCount}>
      )}
    </Connect>
  </Provider>
);
```

The `selector` prop can also take an object mapping selectors for specific slices of the store's state. And `<Connect>` can be used multiple times within a `<Provider>`'s heirarchy as well.

```js
// Assume our Redux store has the following structure
// {
//    users: {
//      1: { id: 1,  name: 'chewie', email: 'chewbacca@falcon.com' },
//      2: { id: 2,  name: 'solo', email: 'han.solo@falcon.com' },
//    },
//    foodsByUser: {
//      1: [ 'porg', 'droid arms' ],
//      2: [ 'nerf stew' ]
//    },
//    friendsByUser: {
//      1: [ 'Han', 'Leia', 'Luke' ],
//      2: [ 'Credits', 'Lando', 'Chewie' ]
//    }
// }

// Some Redux selectors...
const getUsers = state => state.user;
const getUser = id => state => state.users[id];
const userFoods = id => state => state.foods[id];
const userFriends = id => state => state.friends[id];

const Profile = ({ user }) => (
  <div>
    <h1>{user.name}</h1>
    <b>Foods:</b> {state.foods.join(", ")}<br/>
    <b>Friends:</b> {state.friends.join(", ")}<br/>
  </div>
);

// Custom selector for our nested <Connect>
const profileSelector = id => ({
  foods: userFoods(id),
  friends: userFriends(id)
});

ReactDOM.render(
  <Provider store={store}>{
    <h1>Users</h1>
    <Connect selector={getUsers}>{
      ({ state }) => state.map(user, () => (
        <Connect selector={profileSelector(user.id)}>
        {({ state:{ friends, foods } }) =>
          <Profile user={user} friends={friends} foods={foods} />
        }
        </Connect>
      ))
    }
    </Connect>
  }
  </Provider>
)
```

## License

MIT

# timed-press

Keep an active timer of how long a DOM element has been pressed.

Fires a provided callback with the ongoing duration at a specified rate and fires start/stop events.

## usage

Initializes with a factory, taking two parameters, a `callback` method, fired at each interval and a `rate` integer, the frequency, in milliseconds, the intervals should be run at. Defaults to 10ms.

### initializing

```js
const callback = (evt, payload) => {
  //payload is an object with a single property: `duration`
  console.log(payload.duration);
};
const rate = 16;
const eventListener = timedPress({ callback, rate }); // Returns an event listener callback.

element.addEventlistener('mousedown', eventListener);
element.addEventlistener('mouseup', eventListener);
```

### helper event methods

The returned event listener has two functions bound as properties: `registerEvents` and `removeEvents`, managing the default events to make timedPress run.

```js
const callback = (evt, payload) => {};

const eventListener = timedPress({ callback });

// Sets the default event listeners.
eventListener.registerEvents(element);

// Removes the default event listeners.
eventListener.removeEvents(element);
```

### start/stop events

In addition to the callback firing, timedPress dispatches a start event `pressStart` and an end event `pressEnd`. `pressEnd` carries the total time as a `duration` property on the event.

```js
element.addEventListener('pressStart', (evt) => {});

element.addEventListener('pressEnd', (evt) => {
  const { duration } = evt; // Total time pressed.
  console.log(duration);
});
```

## license

[MIT](./LICENSE) © [Matthew Smith](http://www.niftinessafoot.com)

## made with ❤️ and ☕️ by

![Niftiness Afoot!](https://gist.githubusercontent.com/niftinessafoot/2dba588395cb557293d5f09aebcd2ab0/raw/770293c76bead4f0986ff959f3ea8880017d92c0/bot.svg?sanitize=true) [Matthew Smith](https://github.com/niftinessafoot)

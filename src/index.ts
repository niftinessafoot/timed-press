/**
 * Config object for {@link timedPress}
 */
export interface PressEventsConfig {
  callback?: (evt: unknown, data: unknown) => unknown | null;
  rate?: number;
}

/**
 * Extended MouseEvent to append `duration` property to callback.
 */
export type TimeEvent = MouseEvent & {
  duration?: number;
};

export type Timeout = ReturnType<typeof setTimeout>;

/**
 *  Function type for callback defined in {@link handleEvent}
 */
export type Callback =
  | ((evt: TimeEvent, args?: Record<string, string | number>) => unknown)
  | null;

const settings: PressEventsConfig = {
  callback: null,
  rate: 10,
};

const triggers = ['mousedown', 'touchstart'];
const events = ['mouseup', 'mouseout', ...triggers];
let timeStart = 0;
let timeout: Timeout;

/**
 * Manages the primary start/stop events.
 * @param evt - Inherited mouse event from {@link handleEvent}
 */
const handleTiming = (evt: MouseEvent) => {
  const { callback } = settings;
  const isTrigger = triggers.includes(evt.type);
  const eventName = isTrigger ? 'pressStart' : 'pressEnd';
  const timeEvent = new MouseEvent(eventName) as TimeEvent;

  if (isTrigger) {
    timeStart = performance.now();

    if (typeof callback === 'function') {
      callback(evt, { duration: 0 });
    }

    evt.target.dispatchEvent(timeEvent);
  } else {
    if (timeStart) {
      const duration = performance.now() - timeStart;

      timeEvent['duration'] = duration;
      evt.target.dispatchEvent(timeEvent);
      timeStart = 0;
    }
    clearTimeout(timeout);
  }
};

/**
 * Event handler for the variety of mouse events.
 * @param evt - The default MouseEvent invoking the listener.
 */
const handleEvent = (evt: MouseEvent) => {
  const { callback, rate } = settings;

  const timeoutAction = () => {
    let duration = 0;
    duration = performance.now() - timeStart;
    timeout = setTimeout(timeoutAction, rate);

    if (typeof callback === 'function') {
      callback(evt, { duration });
    }
  };

  if (!evt) {
    throw 'Event required';
  }

  clearTimeout(timeout);
  timeout = setTimeout(timeoutAction, rate);
  handleTiming(evt);
};

/**
 * Returns time spent, in ms, of active engagement with the event target.
 * @param config - Configures default settings Specified in {@link PressEventsConfig}
 *
 * @example
 * ```
 * const callback = (evt)=>{console.log(evt);}
 * const rate = 10;
 * const example = timedPress({callback, rate});
 * example.registerEvents([HTMLElement]);
 * ```
 */
export const timedPress = (config: PressEventsConfig) => {
  Object.assign(settings, config);

  return handleEvent;
};

/**
 * Sugar to register all the event listeners to effectively run.
 * @param target - HTMLElement for the event listener
 */
const registerEvents = (target: HTMLElement) => {
  events.forEach((evt) => {
    target.addEventListener(evt, handleEvent);
  });
};

/**
 * Sugar to remove all relevant event listeners.
 * @param target - HTMLElement getting the events removed
 */
const removeEvents = (target: HTMLElement) => {
  events.forEach((evt) => {
    target.removeEventListener(evt, handleEvent);
  });
};

handleEvent.registerEvents = registerEvents;
handleEvent.removeEvents = removeEvents;

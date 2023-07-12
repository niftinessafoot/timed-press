import { jest } from '@jest/globals';
import { _C } from '../constants';
import { timedPress } from '../src/index';
import '@testing-library/jest-dom';

jest.useFakeTimers();

describe('timedPress', () => {
  let btn;
  const dispatchMouseEvents = (time = 25) => {
    btn.dispatchEvent(new MouseEvent('mousedown'));
    jest.advanceTimersByTime(time);
    btn.dispatchEvent(new MouseEvent('mouseup'));
  };
  const addBaseListeners = (callback) => {
    btn.addEventListener('mousedown', callback);
    btn.addEventListener('mouseup', callback);
  };

  beforeEach(() => {
    btn = document.createElement('button');
    btn.id = 'button';
    btn.appendChild(document.createTextNode('Hello'));

    document.body.appendChild(btn);
  });

  it('should initialize', () => {
    const timed = timedPress({ callback: jest.fn() });

    expect(timed).toBeInstanceOf(Function);
  });

  it('should initialize without a callback', () => {
    const timed = timedPress();

    expect(timed).toBeInstanceOf(Function);
  });

  it('should ignore invalid callbacks', () => {
    const timed = timedPress({ callback: true });
    const callback = jest.fn();

    addBaseListeners(timed);
    btn.addEventListener('pressStart', callback);
    dispatchMouseEvents();

    expect(callback).toHaveBeenCalled();
  });

  it('should require an initial event', () => {
    const timed = timedPress();
    const called = () => {
      timed();
    };

    expect(called).toThrow(_C.ErrorNoEvent);
  });

  it('should broadcast a start event', () => {
    const timed = timedPress();
    const eventHandler = jest.fn();

    addBaseListeners(timed);
    btn.addEventListener('pressStart', eventHandler);
    dispatchMouseEvents();

    expect(eventHandler).toHaveBeenCalled();
  });

  it('should broadcast an end event', () => {
    const timed = timedPress();
    const eventHandler = jest.fn();
    const mockEvent = new MouseEvent('pressEnd');
    mockEvent.duration = 25;

    btn.addEventListener('mousedown', timed);
    btn.addEventListener('mouseup', timed);
    btn.addEventListener('pressEnd', eventHandler);
    dispatchMouseEvents();

    expect(eventHandler).toBeCalledWith(mockEvent);
  });

  it('should invoke the initialized callback', () => {
    const callback = jest.fn();
    const timed = timedPress({ callback });

    btn.addEventListener('mousedown', timed);
    btn.addEventListener('mouseup', timed);

    dispatchMouseEvents();

    expect(callback).toHaveBeenCalled();
  });

  it('should only run at the defined timeout rate', () => {
    const callback = jest.fn();
    const timed = timedPress({ callback, rate: 100 });

    btn.addEventListener('mousedown', timed);
    btn.addEventListener('mouseup', timed);
    dispatchMouseEvents(101);

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should only report data when a trigger is called', () => {
    const callback = jest.fn();
    const timed = timedPress({ callback });
    const mockEvent = new MouseEvent('mousedown');

    addBaseListeners(timed);
    btn.addEventListener('mouseout', timed);
    btn.dispatchEvent(new MouseEvent('mousedown'));
    jest.advanceTimersByTime(3);
    btn.dispatchEvent(new MouseEvent('mouseup'));
    jest.advanceTimersByTime(15);
    btn.dispatchEvent(new MouseEvent('mouseout'));

    expect(callback).toBeCalledTimes(1);
    expect(callback).toBeCalledWith(mockEvent, { duration: 0 });
  });

  describe('eventListener helpers', () => {
    describe('registerEvents()', () => {
      it('should register all the events in the listener array to the target', () => {
        const callback = jest.fn();
        const timed = timedPress({ callback });

        timed.registerEvents(btn);
        dispatchMouseEvents();

        expect(callback).toHaveBeenCalled();
      });
    });

    describe('removeEvents()', () => {
      it('should deregister all events', () => {
        const callback = jest.fn();
        const timed = timedPress({ callback });

        timed.registerEvents(btn);
        timed.removeEvents(btn);
        dispatchMouseEvents();

        expect(callback).not.toHaveBeenCalled();
      });
    });
  });
});

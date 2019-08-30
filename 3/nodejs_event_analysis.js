'use strict';

var spliceOne;


var errors;

function lazyErrors() {
  if (errors === undefined)
    errors = require('internal/errors').codes;
  return errors;
}


// Returns the longest sequence of `a` that fully appears in `b`,
// of length at least 3.
// This is a lazy approach but should work well enough, given that stack
// frames are usually unequal or otherwise appear in groups, and that
// we only run this code in case of an unhandled exception.
function longestSeqContainedIn(a, b) {
  for (var len = a.length; len >= 3; --len) {
    for (var i = 0; i < a.length - len; ++i) {
      // Attempt to find a[i:i+len] in b
      for (var j = 0; j < b.length - len; ++j) {
        let matches = true;
        for (var k = 0; k < len; ++k) {
          if (a[i + k] !== b[j + k]) {
            matches = false;
            break;
          }
        }
        if (matches)
          return [len, i, j];
      }
    }
  }

  return [0, 0, 0];
}

function enhanceStackTrace(err, own) {
  const sep = '\nEmitted \'error\' event at:\n';

  const errStack = err.stack.split('\n').slice(1);
  const ownStack = own.stack.split('\n').slice(1);

  const [len, off] = longestSeqContainedIn(ownStack, errStack);
  if (len > 0) {
    ownStack.splice(off + 1, len - 1,
      '    [... lines matching original stack trace ...]');
  }
  // Do this last, because it is the only operation with side effects.
  err.stack = err.stack + sep + ownStack.join('\n');
}


function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;


  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    // TODO:
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
        listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  return target;
}


function onceWrapper(...args) {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    Reflect.apply(this.listener, this.target, args);
  }
}

function _onceWrap(target, type, listener) {
  var state = {
    fired: false,
    wrapFn: undefined,
    target,
    type,
    listener
  };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function') {
    const errors = lazyErrors();
    throw new errors.ERR_INVALID_ARG_TYPE('listener', 'Function', listener);
  }
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
  function prependOnceListener(type, listener) {
    if (typeof listener !== 'function') {
      const errors = lazyErrors();
      throw new errors.ERR_INVALID_ARG_TYPE('listener', 'Function', listener);
    }
    this.prependListener(type, _onceWrap(this, type, listener));
    return this;
  };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
  function removeListener(type, listener) {
    var list, events, position, i, originalListener;

    if (typeof listener !== 'function') {
      const errors = lazyErrors();
      throw new errors.ERR_INVALID_ARG_TYPE('listener', 'Function', listener);
    }

    events = this._events;
    if (events === undefined)
      return this;

    list = events[type];
    if (list === undefined)
      return this;

    if (list === listener || list.listener === listener) {
      if (--this._eventsCount === 0)
        this._events = Object.create(null);
      else {
        delete events[type];
        if (events.removeListener)
          this.emit('removeListener', type, list.listener || listener);
      }
    } else if (typeof list !== 'function') {
      position = -1;

      for (i = list.length - 1; i >= 0; i--) {
        if (list[i] === listener || list[i].listener === listener) {
          originalListener = list[i].listener;
          position = i;
          break;
        }
      }

      if (position < 0)
        return this;

      if (position === 0)
        list.shift();
      else {
        if (spliceOne === undefined)
          spliceOne = require('internal/util').spliceOne;
        spliceOne(list, position);
      }

      if (list.length === 1)
        events[type] = list[0];

      if (events.removeListener !== undefined)
        this.emit('removeListener', type, originalListener || listener);
    }

    return this;
  };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
  function removeAllListeners(type) {
    var listeners, events, i;

    events = this._events;
    if (events === undefined)
      return this;

    // not listening for removeListener, no need to emit
    if (events.removeListener === undefined) {
      if (arguments.length === 0) {
        this._events = Object.create(null);
        this._eventsCount = 0;
      } else if (events[type] !== undefined) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else
          delete events[type];
      }
      return this;
    }

    // emit removeListener for all listeners on all events
    if (arguments.length === 0) {
      var keys = Object.keys(events);
      var key;
      for (i = 0; i < keys.length; ++i) {
        key = keys[i];
        if (key === 'removeListener') continue;
        this.removeAllListeners(key);
      }
      this.removeAllListeners('removeListener');
      this._events = Object.create(null);
      this._eventsCount = 0;
      return this;
    }

    listeners = events[type];

    if (typeof listeners === 'function') {
      this.removeListener(type, listeners);
    } else if (listeners !== undefined) {
      // LIFO order
      for (i = listeners.length - 1; i >= 0; i--) {
        this.removeListener(type, listeners[i]);
      }
    }

    return this;
  };


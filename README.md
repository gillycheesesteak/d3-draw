# d3-draw

## API Reference

This table describes how the draw behavior interprets native events:

| Event         | Listening Element | Draw Event | Default Prevented? |
| ------------- | ----------------- | ---------- | ------------------ |
| pointerdown   | selection         | start      | no                 |
| pointermove   | window            | move       | yes                |
| pointerup     | window            | up         | yes                |
| pointercancel | window            | up         | yes                |

The propagation of all consumed events is [immediately stopped](https://dom.spec.whatwg.org/#dom-event-stopimmediatepropagation). If you want to prevent some events from initiating a draw gesture, use [_draw_.filter](#draw_filter).

<a href="#draw" name="draw">#</a> d3.<b>draw</b>() · [Source](https://github.com/gillycheesesteak/d3-dra2/blob/master/src/draw.js)

Creates a new draw behavior. The returned behavior, [_draw_](#_draw), is both an object and a function, and is typically applied to selected elements via [_selection_.call](https://github.com/d3/d3-selection#selection_call).

<a href="#_draw" name="_draw">#</a> <i>draw</i>(<i>selection</i>) · [Source](https://github.com/gillycheesesteak/d3-draw/blob/master/src/draw.js)

Applies this draw behavior to the specified [_selection_](https://github.com/d3/d3-selection). This function is typically not invoked directly, and is instead invoked via [_selection_.call](https://github.com/d3/d3-selection#selection_call). For example, to instantiate a draw behavior and apply it to a selection:

```js
d3.selectAll(".node").call(d3.draw().on("start", started));
```

Internally, the draw behavior uses [_selection_.on](https://github.com/d3/d3-selection#selection_on) to bind the necessary event listeners for dragging. The listeners use the name `.draw`, so you can subsequently unbind the drag behavior as follows:

```js
selection.on(".draw", null);
```

Applying the draw behavior also sets the [-webkit-tap-highlight-color](https://developer.apple.com/library/mac/documentation/AppleApplications/Reference/SafariWebContent/AdjustingtheTextSize/AdjustingtheTextSize.html#//apple_ref/doc/uid/TP40006510-SW5) style to transparent, disabling the tap highlight on iOS. If you want a different tap highlight color, remove or re-apply this style after applying the draw behavior.

<a href="#draw_container" name="draw_container">#</a> <i>draw</i>.<b>container</b>([<i>container</i>]) · [Source](https://github.com/d3/d3-drag/blob/master/src/drag.js)

If _container_ is specified, sets the container accessor to the specified object or function and returns the drag behavior. If _container_ is not specified, returns the current container accessor, which defaults to:

```js
function container() {
  return this.parentNode;
}
```

The _container_ of a draw gesture determines the coordinate system of subsequent [draw events](#draw-events), affecting _event_.x and _event_.y. The element returned by the container accessor is subsequently passed to [d3.pointer](https://github.com/d3/d3-selection#pointer) to determine the local coordinates of the pointer.

The default container accessor returns the element in the originating selection (see [_draw_](#_draw)) that received the initiating input event.

```js
function container() {
  return this;
}
```

Alternatively, the container may be specified as the element directly, such as `drag.container(canvas)`.

<a href="#drag_filter" name="drag_filter">#</a> <i>drag</i>.<b>filter</b>([<i>filter</i>]) · [Source](https://github.com/gillycheesesteak/d3-draw/blob/master/src/draw.js)

If _filter_ is specified, sets the event filter to the specified function and returns the draw behavior. If _filter_ is not specified, returns the current filter, which defaults to:

```js
function filter(event) {
  return event.pointerType === "pen";
}
```

If the filter returns falsey, the initiating event is ignored and no draw gestures are started. Thus, the filter determines which input events are ignored; the default filter ignores events from mouse and touch inputs.

<a href="#draw_touchable" name="draw_touchable">#</a> <i>draw</i>.<b>touchable</b>([<i>touchable</i>]) · [Source](https://github.com/gillycheesesteak/d3-draw/blob/master/src/draw.js)

If _touchable_ is specified, sets the touch support detector to the specified function and returns the draw behavior. If _touchable_ is not specified, returns the current touch support detector, which defaults to:

```js
function touchable() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
```

Touch event listeners are only registered if the detector returns truthy for the corresponding element when the draw behavior is [applied](#_draw). The default detector works well for most browsers that are capable of touch input, but not all; Chrome’s mobile device emulator, for example, fails detection.

<a href="#draw_on" name="draw_on">#</a> <i>draw</i>.<b>on</b>(<i>typenames</i>, [<i>listener</i>]) · [Source](https://github.com/gillycheesesteak/d3-draw/blob/master/src/draw.js)

If _listener_ is specified, sets the event _listener_ for the specified _typenames_ and returns the draw behavior. If an event listener was already registered for the same type and name, the existing listener is removed before the new listener is added. If _listener_ is null, removes the current event listeners for the specified _typenames_, if any. If _listener_ is not specified, returns the first currently-assigned listener matching the specified _typenames_, if any. When a specified event is dispatched, each _listener_ will be invoked with the same context and arguments as [_selection_.on](https://github.com/d3/d3-selection#selection_on) listeners: the current event (`event`) and datum `d`, with the `this` context as the current DOM element.

The _typenames_ is a string containing one or more _typename_ separated by whitespace. Each _typename_ is a _type_, optionally followed by a period (`.`) and a _name_, such as `draw.foo` and `draw.bar`; the name allows multiple listeners to be registered for the same _type_. The _type_ must be one of the following:

- `start` - after a new pointer becomes active.
- `move` - after an active pointer moves.
- `up` - after an active pointer is lifted, but before the gesture as ended, allowing multiple segments to be drawn.
- `end` - after some time has passed since the last pointer was lifted.

See [_dispatch_.on](https://github.com/d3/d3-dispatch#dispatch_on) for more.

Changes to registered listeners via _draw_.on during a drag gesture _do not affect_ the current draw gesture. Instead, you must use [_event_.on](#event_on), which also allows you to register temporary event listeners for the current drag gesture. **Separate events are dispatched for each active pointer** during a draw gesture. For example, if simultaneously drawing multiple strokes, a start event is dispatched for each. If a pointer is lifted during a gesture, the next pointer to become active is considered part of the same gesture. See [Drag Events](#drag-events) for more.

### Draw Events

When a [draw event listener](#draw_on) is invoked, it receives the current draw event as its first argument. The _event_ object exposes several fields:

- `target` - the associated [draw behavior](#draw).
- `type` - the string “start”, “move”, “up”, or “end”; see [_draw_.on](#draw_on).
- `x` - the new _x_-coordinate of the subject; see [_draw_.container](#draw_container).
- `y` - the new _y_-coordinate of the subject; see [_draw_.container](#draw_container).
- `dx` - the change in _x_-coordinate since the previous draw event.
- `dy` - the change in _y_-coordinate since the previous draw event.
- `identifier` - the string “mouse”, or a numeric [touch identifier](https://www.w3.org/TR/touch-events/#widl-Touch-identifier).
- `active` - the number of currently active draw gestures (on start and end, not including this one).
- `sourceEvent` - the underlying input event, such as mousemove or touchmove.
- `stroke` - the active stroke, as a sequence of `DrawEvent`s
- `simplifiedStroke` - on the `end` event, a simplified version of the entire drawn shape, separated into an array of independent strokes, and simplified using the [Ramer-Douglas-Peucker algorithm](https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm)

The _event_.active field is useful for detecting the first start event and the last end event in a sequence of concurrent draw gestures: it is zero when the first draw gesture starts, and zero when the last draw gesture ends.

Inspired by and modified from [d3-drag](https://github.com/d3/d3-drag)

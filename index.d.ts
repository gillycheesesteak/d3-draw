import { Selection, ValueFn } from "d3-selection";

/**
 * Container element type usable for mouse/touch functions
 */
export type DrawContainerElement = HTMLElement | SVGSVGElement | SVGGElement; // HTMLElement includes HTMLCanvasElement

export interface Point {
  x: number;
  y: number;
}

export type Stroke = Point[];

/**
 * A Draw Behavior
 */
export interface DrawBehavior<GElement extends Element, Datum>
  extends Function {
  /**
   * Applies the draw behavior to the selected elements.
   * This function is typically not invoked directly, and is instead invoked via selection.call.
   *
   * @param selection A D3 selection of elements.
   * @param args Optional arguments to be passed in.
   */
  (selection: Selection<GElement, Datum, any, any>, ...args: any[]): void;

  /**
   * Returns the current container accessor function.
   */
  container(): ValueFn<GElement, Datum, DrawContainerElement>;
  /**
   * Sets the container accessor to the specified function and returns the draw behavior.
   *
   * The container of a draw gesture determines the coordinate system of subsequent draw events, affecting event.x and event.y.
   * The element returned by the container accessor is subsequently passed to d3.pointer to determine the local coordinates of the pointer.
   *
   * @param accessor A container accessor function which is evaluated for each selected element,
   * in order, being passed the current datum (d), the current index (i), and the current group (nodes),
   * with this as the current DOM element. The function returns the container element.
   */
  container(accessor: ValueFn<GElement, Datum, DrawContainerElement>): this;
  /**
   * Sets the container accessor to the specified object and returns the draw behavior.
   *
   * The container of a draw gesture determines the coordinate system of subsequent draw events, affecting event.x and event.y.
   * The element returned by the container accessor is subsequently passed to d3.pointer to determine the local coordinates of the pointer.
   *
   * @param container Container element for the draw gesture.
   */
  container(container: DrawContainerElement): this;

  /**
   * Returns the current filter function.
   */
  filter(): (this: GElement, event: any, d: Datum) => boolean;
  /**
   * Sets the event filter to the specified filter function and returns the draw behavior.
   *
   * If the filter returns falsey, the initiating event is ignored and no draw gesture is started.
   * Thus, the filter determines which input events are ignored. The default filter ignores events
   * from pointers that are not of type "pen"
   *
   * @param filterFn A filter function which is evaluated for each selected element,
   * in order, being passed the current event (event) and datum d, with the this context as the current DOM element.
   * The function returns a boolean value.
   */
  filter(filterFn: (this: GElement, event: any, d: Datum) => boolean): this;

  /**
   * Returns the current touch support detector, which defaults to a function returning true,
   * if the "ontouchstart" event is supported on the current element.
   */
  touchable(): ValueFn<GElement, Datum, boolean>;
  /**
   * Sets the touch support detector to the specified boolean value and returns the draw behavior.
   *
   * Touch event listeners are only registered if the detector returns truthy for the corresponding element when the draw behavior is applied.
   * The default detector works well for most browsers that are capable of touch input, but not all; Chrome’s mobile device emulator, for example,
   * fails detection.
   *
   * @param touchable A boolean value. true when touch event listeners should be applied to the corresponding element, otherwise false.
   */
  touchable(touchable: boolean): this;
  /**
   * Sets the touch support detector to the specified function and returns the draw behavior.
   *
   * Touch event listeners are only registered if the detector returns truthy for the corresponding element when the draw behavior is applied.
   * The default detector works well for most browsers that are capable of touch input, but not all; Chrome’s mobile device emulator, for example,
   * fails detection.
   *
   * @param touchable A touch support detector function, which returns true when touch event listeners should be applied to the corresponding element.
   * The function is evaluated for each selected element to which the draw behavior was applied, in order, being passed the current datum (d),
   * the current index (i), and the current group (nodes), with this as the current DOM element. The function returns a boolean value.
   */
  touchable(touchable: ValueFn<GElement, Datum, boolean>): this;

  /**
   * Return the first currently-assigned listener matching the specified typenames, if any.
   *
   * @param typenames The typenames is a string containing one or more typename separated by whitespace.
   * Each typename is a type, optionally followed by a period (.) and a name, such as "draw.foo"" and "draw.bar";
   * the name allows multiple listeners to be registered for the same type. The type must be one of the following:
   * start (after a new pointer becomes active), move (after an active pointer moves), up (after an active pointer becomes inactive) or
   * end (after a small time period after the last active pointer becomes inactive)
   */
  on(
    typenames: string
  ): ((this: GElement, event: any, d: Datum) => void) | undefined;
  /**
   * Remove the current event listeners for the specified typenames, if any, return the draw behavior.
   *
   * @param typenames The typenames is a string containing one or more typename separated by whitespace.
   * Each typename is a type, optionally followed by a period (.) and a name, such as "draw.foo"" and "draw.bar";
   * the name allows multiple listeners to be registered for the same type. The type must be one of the following:
   * start (after a new pointer becomes active), move (after an active pointer moves), up (after an active pointer becomes inactive) or
   * end (after a small time period after the last active pointer becomes inactive)
   * @param listener Use null to remove the listener.
   */
  on(typenames: string, listener: null): this;
  /**
   * Set the event listener for the specified typenames and return the draw behavior.
   * If an event listener was already registered for the same type and name,
   * the existing listener is removed before the new listener is added.
   * When a specified event is dispatched, each listener will be invoked with the same context and arguments as selection.on listeners.
   *
   * Changes to registered listeners via draw.on during a draw gesture do not affect the current draw gesture.
   * Instead, you must use event.on, which also allows you to register temporary event listeners for the current draw gesture.
   * Separate events are dispatched for each active pointer during a draw gesture.
   *
   * @param typenames The typenames is a string containing one or more typename separated by whitespace.
   * Each typename is a type, optionally followed by a period (.) and a name, such as "draw.foo"" and "draw.bar";
   * the name allows multiple listeners to be registered for the same type. The type must be one of the following:
   * start (after a new pointer becomes active), move (after an active pointer moves), up (after an active pointer becomes inactive) or
   * end (after a small time period after the last active pointer becomes inactive)
   * @param listener An event listener function which is evaluated for each selected element,
   * in order, being passed the current event (event) and datum d, with the this context as the current DOM element.
   */
  on(
    typenames: string,
    listener: (this: GElement, event: any, d: Datum) => void
  ): this;
}

/**
 * Creates a new draw behavior. The returned behavior, draw, is both an object and a function, and is
 * typically applied to selected elements via selection.call.
 */
export function draw<GElement extends Element, Datum>(): DrawBehavior<
  GElement,
  Datum
>;

/**
 * Draw event
 */
export interface DrawEvent<GElement extends Element, Datum> {
  /**
   * The DrawBehavior associated with the event
   */
  target: DrawBehavior<GElement, Datum>;
  /**
   * The event type for the DragEvent
   */
  type: "start" | "move" | "up" | "end" | string; // Leave failsafe string type for cases like 'draw.foo'
  /**
   * The new x-coordinate of the event, relative to the container
   */
  x: number;
  /**
   * The new y-coordinate of the event, relative to the container
   */
  y: number;
  /**
   * The change in x-coordinate since the previous draw event.
   */
  dx: number;
  /**
   * The change in y-coordinate since the previous draw event.
   */
  dy: number;
  /**
   * The string “mouse”, or a numeric touch identifier.
   */
  identifier: "mouse" | number;
  /**
   * The number of currently active draw gestures (on start and up, not including this one).
   *
   * The event.active field is useful for detecting the first start event and the last end event
   * in a sequence of concurrent draw gestures: it is zero when the first draw gesture starts,
   * and zero when the last draw gesture ends.
   */
  active: number;
  /**
   * The underlying pointer event, such as pointerdown or pointermove.
   */
  sourceEvent: any;
  /**
   * The sequence of prior DrawEvents related to this Draw gesture
   */
  stroke: DrawEvent[];
  /**
   * On the end event only, a list of strokes, each of which is a list of Point objects giving a subset of coordinates
   * which maintain the important detail of the gesture, determined by the Ramer-Douglas-Peucker algorithm
   *
   * (see: {@link https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm})
   */
  simplifiedStroke?: Stroke[];
  /**
   * The pointerType of the pointer event
   *
   * (see: {@link https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerType})
   */
  pointerType: "pen" | "touch" | "mouse";
  /**
   * The timestamp of the pointer event, given as number of milliseconds since page load, similar to Performance.now()
   */
  timestamp: number;
}

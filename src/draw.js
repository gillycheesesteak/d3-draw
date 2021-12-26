import { dispatch } from "d3-dispatch";
import { select, pointer } from "d3-selection";
import simplifyStroke, { distance } from "./simplify.js";
import debounce from "./debounce.js";
import noevent, { nonpassivecapture } from "./noevent.js";
import constant from "./constant.js";
import DrawEvent from "./event.js";

// Ignore right-click, since that should open the context menu.
function defaultFilter(event) {
  return event.pointerType === "pen";
}

function defaultContainer() {
  return this;
}

function defaultTouchable() {
  return navigator.maxTouchPoints > 0 || "ontouchstart" in this;
}

export default function drawBehavior() {
  let filter = defaultFilter;
  let container = defaultContainer;
  let touchable = defaultTouchable;
  const gestures = {};
  const listeners = dispatch("start", "move", "up", "end");
  let active = 0;
  let framerate = 60;
  let timestamp = Date.now();
  let nextPointerDown;

  function draw(selection) {
    selection
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      .on("pointerdown.draw", pointerDown, nonpassivecapture)
      .filter(touchable)
      .style("touch-action", "none")
      .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }

  function pointerMove(event) {
    // Polling rate on some devices means our calculation of dx/dy will always result in 0 unless we wait long enough between updates
    if (Date.now() - timestamp < 1000 / framerate) return;
    timestamp = Date.now();

    gestures[event.pointerId]("move", event);
  }

  function pointerUp(event) {
    select(event.view).on(
      "pointermove.draw pointerup.draw pointercancel.draw touchmove.draw",
      null
    );
    nextPointerDown = event.pointerId;
    gestures[event.pointerId]("up", event);
  }

  function startGesture(that, node, startEvent, d, identifier) {
    if (nextPointerDown) {
      const prevGesture = gestures[nextPointerDown];
      delete gestures[nextPointerDown];
      nextPointerDown = null;
      gestures[identifier] = prevGesture;
      return prevGesture;
    }

    const gestureDispatch = listeners.copy();
    const { pointerType, x: pointerDownX, y: pointerDownY } = startEvent;
    let p = pointer(startEvent, node);
    const activeStroke = [];

    function endGesture() {
      delete gestures[identifier];
      nextPointerDown = null;
      active -= 1; // falls through
    }

    const resetStroke = debounce((event) => {
      endGesture();

      if (event.stroke.length > 2) {
        // eslint-disable-next-line no-param-reassign
        event.simplifiedStroke = simplifyStroke(event.stroke);
        gestureDispatch.call("end", that, event, d);
      }
    }, 600);

    return function gesture(type, event) {
      const p0 = p;
      p = pointer(event, node);

      const drawEvent = new DrawEvent(type, {
        sourceEvent: event,
        stroke: activeStroke,
        target: draw,
        identifier,
        pointerType,
        active,
        x: p[0],
        y: p[1],
        dx: p[0] - p0[0],
        dy: p[1] - p0[1],
        timestamp: event.timeStamp,
      });

      activeStroke.push(drawEvent);

      switch (type) {
        case "start":
          gestures[identifier] = gesture;
          active += 1;
          break;
        case "up":
          nextPointerDown = event.pointerId;
          resetStroke(drawEvent);
          break;
        case "move":
          if (distance({ x: pointerDownX, y: pointerDownY }, event) > 10) {
            select(event.view).on("touchmove.draw", noevent, nonpassivecapture);
          } // falls through
        default:
          resetStroke(drawEvent);
          break;
      }

      gestureDispatch.call(type, that, drawEvent, d);
    };
  }

  function pointerDown(event, d) {
    requestAnimationFrame((t1) => {
      requestAnimationFrame((t2) => {
        framerate = 1000 / (t2 - t1);
      });
    });

    if (!filter.call(this, event, d)) return;

    const gesture = startGesture(
      this,
      container.call(this, event, d),
      event,
      d,
      event.pointerId
    );
    if (!gesture) return;

    select(event.view)
      .on("pointermove.draw", pointerMove, nonpassivecapture)
      .on("pointerup.draw pointercancel.draw", pointerUp, nonpassivecapture);

    gesture("start", event);
  }

  draw.filter = (_) => {
    if (typeof _ === "undefined") {
      return filter;
    }

    filter = typeof _ === "function" ? _ : constant(!!_);
    return draw;
  };

  draw.container = (_) => {
    if (typeof _ === "undefined") {
      return container;
    }

    container = typeof _ === "function" ? _ : constant(_);
    return draw;
  };

  draw.touchable = (_) => {
    if (typeof _ === "undefined") {
      return touchable;
    }

    touchable = typeof _ === "function" ? _ : constant(!!_);
    return draw;
  };

  draw.on = (types, handler) => {
    const value = listeners.on(types, handler);
    return value === listeners ? draw : value;
  };

  return draw;
}

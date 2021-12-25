export default function DrawEvent(
  type,
  {
    sourceEvent,
    target,
    stroke,
    identifier,
    pointerType,
    active,
    x,
    y,
    dx,
    dy,
    timestamp,
  }
) {
  Object.defineProperties(this, {
    type: { value: type, enumerable: true, configurable: true },
    sourceEvent: { value: sourceEvent, enumerable: true, configurable: true },
    target: { value: target, enumerable: true, configurable: true },
    stroke: { value: stroke, enumerable: true, configurable: true },
    identifier: { value: identifier, enumerable: true, configurable: true },
    pointerType: { value: pointerType, enumerable: true, configurable: true },
    active: { value: active, enumerable: true, configurable: true },
    x: { value: x, enumerable: true, configurable: true },
    y: { value: y, enumerable: true, configurable: true },
    dx: { value: dx, enumerable: true, configurable: true },
    dy: { value: dy, enumerable: true, configurable: true },
    timestamp: { value: timestamp, enumerable: true, configurable: true },
  });
}

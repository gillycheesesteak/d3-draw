export function distance(pt1, pt2) {
  const a = pt1.x - pt2.x;
  const b = pt1.y - pt2.y;

  return Math.sqrt(a * a + b * b);
}

function distanceFromLine(pt, a, b) {
  const dist = distance(a, b);

  const area = Math.abs(
    (b.y - a.y) * pt.x - (b.x - a.x) * pt.y + b.x * a.y - b.y * a.x
  );

  return area / dist;
}

function simplifySegment(segment) {
  if (segment.length < 3) return segment;

  const [startPoint, ...rest] = segment;
  const endPoint = rest.pop();

  let found = 0;
  let dmax = 0;
  const epsilon = Math.max(5, distance(startPoint, endPoint) / 7);

  rest.forEach((point, index) => {
    const dist = distanceFromLine(point, startPoint, endPoint);

    if (dist > dmax) {
      dmax = dist;
      // Add one because we want the index in the original segment
      found = index + 1;
    }
  });

  if (dmax > epsilon) {
    const firstHalf = simplifySegment(segment.slice(0, found + 1));
    const secondHalf = simplifySegment(segment.slice(found));

    return [...firstHalf, ...secondHalf.slice(1)];
  }

  return [startPoint, endPoint];
}

export default function simplifyStroke(stroke) {
  const simplified = stroke.reduce((accumulator, event) => {
    if (event.type === "start") {
      accumulator.push([]);
      return accumulator;
    }

    const strokePartIdx = accumulator.length - 1;
    const strokePart = accumulator[strokePartIdx];
    const point = {
      x: event.x,
      y: event.y,
    };
    strokePart.push(point);

    return accumulator;
  }, []);

  return simplified
    .filter((item) => item.length !== 0)
    .map((item) => simplifySegment(item));
}

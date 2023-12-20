export class Transition {
  constructor(ys) {
    this.stack = [
      {
        time: 0,
        polyline: [
          { x: -100, y: 0 },
          { x: 0, y: 0 }
        ]
      }
    ];
    this.increaseOnStart = ys[0] > 0;
    ys.forEach((y) => {
      const last = this.stack[this.stack.length - 1];
      const t0 = last.time;
      const y0 = last.polyline[0].y;
      this.stack.push({
        time: t0 + Math.abs(y - y0),
        polyline: movePoints({ x: -100, y: y }, last.polyline)
      });
    });
  }

  upperBound(t) {
    let lower = 0;
    let upper = this.stack.length;
    let mid;
    while (upper - lower >= 2) {
      mid = Math.floor((lower + upper) / 2);
      if (this.stack[mid].time > t) {
        upper = mid;
      } else {
        lower = mid;
      }
    }
    return lower;
  }

  lowerBound(t) {
    let lower = 0;
    let upper = this.stack.length;
    let mid;
    while (upper - lower >= 2) {
      mid = Math.floor((lower + upper) / 2);
      if (this.stack[mid].time < t) {
        lower = mid;
      } else {
        upper = mid;
      }
    }
    return lower;
  }

  calcPoints(t) {
    const index = this.upperBound(t);
    const start = this.stack[index];
    if (t === start.time) return start.polyline;
    const isEven = index % 2 == 0;
    const handleY =
      start.polyline[0].y +
      ((this.increaseOnStart && isEven) || (!this.increaseOnStart && !isEven) ? 1 : -1) *
        (t - start.time);
    return movePoints({ x: -100, y: handleY }, start.polyline);
  }
}

export function generatePath(points, xScale, yScale) {
  let path = `M ${xScale(points[0].x)} ${yScale(points[0].y)} L`;
  for (let i = 1; i < points.length; i++) {
    path += ` ${xScale(points[i].x)} ${yScale(points[i].y)}`;
  }
  return path;
}

export function movePoints(handle, points) {
  let newPoints = [handle];
  const slope = handle.y > points[0].y ? -1 : 1;
  let crossingFound = false;
  for (let i = 1; i < points.length; i++) {
    if (crossingFound) {
      newPoints.push(points[i]);
      continue;
    }
    const cross = findCross(handle.y, slope, points[i - 1], points[i]);
    if (cross !== null) {
      crossingFound = true;
      if (cross.x < points[i].x) i--;
      newPoints.push(cross);
    }
  }
  if (!crossingFound) {
    newPoints.push({ x: 0, y: handle.y + slope * 100 });
  }
  return newPoints;
}

function findCross(handleY, slope0, p1, p2) {
  const y0 = handleY + slope0 * 100;
  const slope12 = (p2.y - p1.y) / (p2.x - p1.x);
  const y12 = p1.y - slope12 * p1.x;
  if (slope0 === slope12) {
    if (y0 === y12) return p2;
    return null;
  }
  const x = (y12 - y0) / (slope0 - slope12);
  if (x < p1.x || p2.x < x) return null;
  return { x: x, y: slope0 * x + y0 };
}

export function pullHe(points) {
  return [{ x: -120, y: points[0].y }].concat(points);
}

export function flipHorizontally(points) {
  let newPoints = [...points];
  for (let i = points.length - 2; i >= 0; i--) {
    newPoints.push({ x: -points[i].x, y: points[i].y });
  }
  return newPoints;
}

export function differentiate(points) {
  let newPoints = [{ x: points[0].x, y: 0 }];
  for (let i = 0; i < points.length - 1; i++) {
    let yy = (points[i + 1].y - points[i].y) / (points[i + 1].x - points[i].x);
    newPoints.push({ x: points[i].x, y: yy });
    newPoints.push({ x: points[i + 1].x, y: yy });
  }
  newPoints.push({ x: points[points.length - 1].x, y: 0 });
  return newPoints;
}

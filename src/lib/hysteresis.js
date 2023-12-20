export class Hysteresis {
  constructor(tran, maxt) {
    this.tran = tran;
    this.points = [];

    for (let t = 0; t <= maxt; t++) {
      const points = tran.calcPoints(t);
      let hs = 0;
      for (let i = 1; i < points.length; i++) {
        hs += (points[i - 1].y + points[i].y) * (points[i].x - points[i - 1].x);
      }
      hs = hs / 100 / 2;
      const he = points[0].y;
      this.points.push({ x: he, y: he - hs });
    }
  }

  calcArrows() {
    const arrows = [];
    for (let i = 0; i < this.tran.stack.length - 1; i++) {
      const midt = Math.floor((this.tran.stack[i].time + this.tran.stack[i + 1].time) / 2);
      const midx = this.points[midt].x;
      const midy = this.points[midt].y;
      arrows.push({
        x: midx,
        y: midy,
        deg:
          (Math.atan2(
            this.points[midt + 1].y - this.points[midt - 1].y,
            this.points[midt + 1].x - this.points[midt - 1].x
          ) *
            180) /
          Math.PI
      });
    }
    return arrows;
  }
}

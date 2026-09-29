/** Uniform flow past a round section. Stream function is not drawn; this is the velocity. */
export function velocity(x: number, y: number, radius = 0.42): [number, number] {
  const r2 = x * x + y * y;
  const limit = radius * radius;
  if (r2 < limit * 1.04) return [0, 0];
  const r4 = r2 * r2;
  const u = 1 + (limit * (y * y - x * x)) / r4;
  const v = (-2 * limit * x * y) / r4;
  return [u, v];
}

/** Simply supported beam, even load, moment scaled so midspan is 1. M = x (L − x) / 2. */
export function moment(x: number, length = 1): number {
  const peak = (length * length) / 8;
  return (x * (length - x)) / 2 / peak;
}

function trace(
  ctx: CanvasRenderingContext2D,
  seed: number,
  project: (x: number, y: number) => [number, number],
) {
  let x = -1.85;
  let y = seed;
  ctx.beginPath();
  const start = project(x, y);
  ctx.moveTo(start[0], start[1]);
  const step = 0.035;
  for (let i = 0; i < 160; i += 1) {
    const [u, v] = velocity(x, y);
    const speed = Math.hypot(u, v);
    if (speed < 0.04) break;
    x += (u / speed) * step;
    y += (v / speed) * step;
    if (x > 1.9 || Math.abs(y) > 1.35) break;
    const point = project(x, y);
    ctx.lineTo(point[0], point[1]);
  }
  ctx.stroke();
}

function drawFlow(ctx: CanvasRenderingContext2D, left: number, top: number, width: number, height: number) {
  const project = (x: number, y: number): [number, number] => [
    left + ((x + 1.9) / 3.8) * width,
    top + ((1.2 - y) / 2.4) * height,
  ];
  ctx.save();
  ctx.beginPath();
  ctx.rect(left, top, width, height);
  ctx.clip();
  ctx.strokeStyle = 'rgba(213, 221, 232, 0.85)';
  ctx.lineWidth = 1;
  for (const seed of [-1.02, -0.72, -0.44, -0.18, 0.18, 0.44, 0.72, 1.02]) trace(ctx, seed, project);
  const [cx, cy] = project(0, 0);
  const [edge] = project(0.42, 0);
  ctx.beginPath();
  ctx.arc(cx, cy, Math.abs(edge - cx), 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(18, 48, 110, 0.35)';
  ctx.fill();
  ctx.strokeStyle = '#7eb0ff';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();
}

function drawMoment(ctx: CanvasRenderingContext2D, left: number, top: number, width: number, height: number) {
  const x0 = left + width * 0.12;
  const x1 = left + width * 0.9;
  const beam = top + height * 0.34;
  ctx.save();
  ctx.strokeStyle = 'rgba(213, 221, 232, 0.9)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x0, beam);
  ctx.lineTo(x1, beam);
  ctx.stroke();
  ctx.lineWidth = 1;
  for (let i = 0; i <= 10; i += 1) {
    const x = x0 + ((x1 - x0) * i) / 10;
    ctx.beginPath();
    ctx.moveTo(x, beam - 14);
    ctx.lineTo(x, beam - 4);
    ctx.stroke();
  }
  ctx.strokeStyle = '#7eb0ff';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (let i = 0; i <= 40; i += 1) {
    const t = i / 40;
    const y = beam + 18 + moment(t) * height * 0.38;
    const x = x0 + t * (x1 - x0);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

export function drawStudy(canvas: HTMLCanvasElement) {
  const width = canvas.clientWidth || 840;
  const height = Math.round(width * (280 / 840));
  const ratio = Math.min(globalThis.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const flowWidth = width * 0.58;
  drawFlow(ctx, 0, 0, flowWidth, height);
  drawMoment(ctx, flowWidth, 0, width - flowWidth, height);
}

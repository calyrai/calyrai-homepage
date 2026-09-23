import assert from 'node:assert/strict';
import { model, geometry } from '../web/public/research/aorta/playground.js';
assert.equal(model({}).relativeSpeed, 1);
assert.equal(model({ narrowing: 50 }).relativeSpeed, 4);
assert.equal(model({ inflow: 150 }).relativeSpeed, 1.5);
assert.ok(model({ diameter: 140 }).relativeSpeed < 1);
for (const diameter of [70, 100, 140]) for (const narrowing of [0, 30, 60]) for (const arch of [70, 100, 130]) {
  const m = model({ diameter, narrowing, arch }), g = geometry(m);
  assert.ok(g.volume > 0);
  for (let i = 0; i < g.points.length; i++) {
    const p = g.points[i];
    assert.ok(Object.values(p).every(Number.isFinite));
    assert.ok(p.radius > 0);
    assert.ok(p.y - p.radius > -2);
    if (i) assert.ok(p.volume > g.points[i - 1].volume);
  }
  assert.ok(Math.abs(m.relativeSpeed - 1 / Math.min(...g.points.map(p => p.area))) < 1e-10);
}
console.log('Continuity and 27 geometry combinations passed.');

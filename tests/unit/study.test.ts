import { describe, expect, it } from 'vitest';
import { moment, velocity } from '../../src/scripts/study';

describe('study', () => {
  it('peaks the moment at midspan and rests it at the supports', () => {
    expect(moment(0)).toBeCloseTo(0);
    expect(moment(1)).toBeCloseTo(0);
    expect(moment(0.5)).toBeCloseTo(1);
    expect(moment(0.25)).toBeLessThan(1);
  });

  it('slows the flow on the centreline as it meets the section', () => {
    const [ahead] = velocity(-0.7, 0);
    const [far] = velocity(-3, 0);
    expect(ahead).toBeLessThan(far);
    expect(far).toBeGreaterThan(0.9);
    expect(velocity(0, 0)).toEqual([0, 0]);
  });
});

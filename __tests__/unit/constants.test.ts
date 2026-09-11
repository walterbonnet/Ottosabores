import { getGrandmaTip, DEFAULT_GRANDMA_TIP, GRANDMA_TIPS_MAP } from '../../src/config/constants';

describe('getGrandmaTip Unit Tests', () => {
  it('returns the exact mapped tip for a known recipe ID', () => {
    const tip = getGrandmaTip('r1');
    expect(tip).toBe(GRANDMA_TIPS_MAP['r1']);
  });

  it('returns the same tip deterministically when called multiple times with the same ID', () => {
    const call1 = getGrandmaTip('r2');
    const call2 = getGrandmaTip('r2');
    expect(call1).toBe(call2);
    expect(call1).toBe(GRANDMA_TIPS_MAP['r2']);
  });

  it('returns DEFAULT_GRANDMA_TIP for non-existent recipe ID', () => {
    const tip = getGrandmaTip('r999_non_existent');
    expect(tip).toBe(DEFAULT_GRANDMA_TIP);
  });

  it('returns DEFAULT_GRANDMA_TIP for empty string ID', () => {
    const tip = getGrandmaTip('');
    expect(tip).toBe(DEFAULT_GRANDMA_TIP);
  });

  it('handles special characters and long IDs gracefully', () => {
    const tip = getGrandmaTip('r1-!@#$%^&*()_<>/\\');
    expect(tip).toBe(DEFAULT_GRANDMA_TIP);
    expect(tip).toBeDefined();
    expect(typeof tip).toBe('string');
  });

  it('never returns undefined or null for any input', () => {
    expect(getGrandmaTip('r3')).not.toBeNull();
    expect(getGrandmaTip('unknown')).not.toBeUndefined();
  });
});

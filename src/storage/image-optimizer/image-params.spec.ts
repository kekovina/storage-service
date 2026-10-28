import { normalizeImageParams } from './image-params';

const limits = { minSize: 16, maxSize: 2048 };
const normalize = (query: Record<string, unknown>) => normalizeImageParams(query, limits);

describe('normalizeImageParams', () => {
  it('returns null without params', () => {
    expect(normalize({})).toBeNull();
  });

  it('returns null when width and height are both set', () => {
    expect(normalize({ width: '100', height: '100' })).toBeNull();
  });

  it('uses only width, default quality', () => {
    expect(normalize({ width: '300' })).toEqual({ width: 320, height: undefined, quality: 80 });
  });

  it('uses only height', () => {
    expect(normalize({ height: '300', quality: '50' })).toEqual({
      width: undefined,
      height: 320,
      quality: 50,
    });
  });

  it('clamps size and quality', () => {
    expect(normalize({ width: '5000', quality: '500' })).toMatchObject({
      width: 2048,
      quality: 100,
    });
    expect(normalize({ height: '1' })).toMatchObject({ height: 32 });
  });

  it('allows quality only', () => {
    expect(normalize({ quality: '60' })).toEqual({
      width: undefined,
      height: undefined,
      quality: 60,
    });
  });

  it('snaps size up and quality to the nearest step', () => {
    expect(normalize({ width: '33', quality: '63' })).toMatchObject({ width: 64, quality: 60 });
    expect(normalize({ width: '64', quality: '2' })).toMatchObject({ width: 64, quality: 10 });
    expect(normalize({ width: '2047' })).toMatchObject({ width: 2048 });
  });

  it('never exceeds max when it is not a multiple of the step', () => {
    expect(normalizeImageParams({ width: '1490' }, { minSize: 16, maxSize: 1500 })).toMatchObject({
      width: 1500,
    });
  });

  it('ignores invalid values', () => {
    expect(normalize({ width: 'abc', quality: '0' })).toBeNull();
    expect(normalize({ width: '-5', height: '1.5' })).toBeNull();
    expect(normalize({ width: ['1', '2'] })).toBeNull();
    expect(normalize({ width: 'abc', height: '200' })).toMatchObject({ height: 224 });
  });

  it('keeps the valid dimension when the other one is garbage', () => {
    expect(normalize({ width: '100', height: 'x' })).toMatchObject({ width: 128 });
  });
});

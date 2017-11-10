import { arrayToIndex, findLongestStringInArrayOfArrays } from '../../app/utils/js';

test('Index an array of objects according to a property', () => {
  const o1 = { p0: 0, p1: 1, p2: 2 };
  const o2 = { p0: 3, p1: 4, p2: 5 };
  const o3 = { p0: 6, p1: 7, p2: 8 };
  const a = [o1, o2, o3];
  expect(arrayToIndex(a, 'p1')).toEqual({
    1: o1,
    4: o2,
    7: o3
  });
});

test('Find the longest value for a column in an array of array', () => {
  const data = [['..', '....'], ['...', '....'], ['.', '....']];
  expect(findLongestStringInArrayOfArrays(data, 0)).toBe(3);
});

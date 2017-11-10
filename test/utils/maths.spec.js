const { getCartesianDistanceInMm, getTopLeftAndBottomRightPointsFromTwoClicks } = require('../../app/utils/maths');

test('Distance between (0, 0) and (-10, -10) at 300 DPI should be 25.4 * Math.sqrt(200) / 300', () => {
  expect(getCartesianDistanceInMm(0, 0, -10, -10, 300, 300)).toBe(25.4 * Math.sqrt(200) / 300);
});

test('getTopLeftAndBottomRightPointsFromTwoClicks', () => {
  let x1, y1, x2, y2;

  (x1 = 100), (y1 = 100), (x2 = 200), (y2 = 200);
  expect(getTopLeftAndBottomRightPointsFromTwoClicks(x1, y1, x2, y2)).toEqual([x1, y1, x2, y2]);

  (x1 = 200), (y1 = 200), (x2 = 100), (y2 = 100);
  expect(getTopLeftAndBottomRightPointsFromTwoClicks(x1, y1, x2, y2)).toEqual([x2, y2, x1, y1]);

  (x1 = 100), (y1 = 200), (x2 = 200), (y2 = 100);
  expect(getTopLeftAndBottomRightPointsFromTwoClicks(x1, y1, x2, y2)).toEqual([100, 100, 200, 200]);

  (x1 = 200), (y1 = 100), (x2 = 100), (y2 = 200);
  expect(getTopLeftAndBottomRightPointsFromTwoClicks(x1, y1, x2, y2)).toEqual([100, 100, 200, 200]);
});

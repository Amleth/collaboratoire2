export const pixelsToMm = (d, dpi) => 25.4 * d / dpi;

export const getCartesianDistanceInMm = (x1, y1, x2, y2, dpix, dpiy) => {
  return Math.sqrt(Math.pow(25.4 * (x2 - x1) / dpix, 2) + Math.pow(25.4 * (y2 - y1) / dpiy, 2));
};

export const standardDeviation = values => {
  if (!values) return 0;
  if (values.length === 0) return 0;

  var avg = average(values);

  var squareDiffs = values.map(value => {
    var diff = value - avg;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });

  var avgSquareDiff = average(squareDiffs);

  var stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
};

export const average = data => {
  if (!data) return 0;
  if (data.length === 0) return 0;

  var sum = data.reduce((sum, value) => {
    return sum + value;
  }, 0);

  var avg = sum / data.length;
  return avg;
};

// It is assumed that the user has first clicked on (x1, y1) and then on (x2, y2)
// This forms a rectangle. We want to know its top left & bottom right points.
export const getTopLeftAndBottomRightPointsFromTwoClicks = (x1, y1, x2, y2) => [
  Math.min(x1, x2),
  Math.min(y1, y2),
  Math.max(x1, x2),
  Math.max(y1, y2)
];

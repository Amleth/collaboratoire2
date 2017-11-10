import moment from 'moment';

export const arrayToIndex = (a, p) => {
  const res = {};
  for (const item of a) {
    res[item[p]] = item;
  }
  return res;
};

export const formatDate = date => {
  return moment(date).format('YYYY.MM.DD HH[h]mm[m]ss[s]SSS[ms]');
};

export const findLongestStringInArrayOfArrays = (data, propertyIndex) => {
  let res = 0;

  for (let datum of data) {
    let s = datum[propertyIndex];
    if (s) {
      if (typeof s !== 'string') {
        s = s.toString();
      }
      if (s.length > res) {
        res = s.length;
      }
    }
  }

  return res;
};

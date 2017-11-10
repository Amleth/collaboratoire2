import Chance from 'chance';
import lodash from 'lodash';

import { findPictures } from '../../app/business_logic/tags';
import { TAGS_SELECTION_MODE_AND, TAGS_SELECTION_MODE_OR } from '../../app/data/constants';

const chance = new Chance();

const picturesId = [
  chance.guid(),
  chance.guid(),
  chance.guid(),
  chance.guid(),
  chance.guid(),
  chance.guid(),
  chance.guid(),
  chance.guid(),
  chance.guid(),
  chance.guid()
];

const tags = [
  chance.word(),
  chance.word(),
  chance.word(),
  chance.word(),
  chance.word(),
  chance.word(),
  chance.word(),
  chance.word(),
  chance.word(),
  chance.word()
];

const tagsByPicture = {
  [picturesId[0]]: [tags[0], tags[1]],
  [picturesId[1]]: [tags[0]],
  [picturesId[2]]: [tags[1]]
};

const pictureByTags = {
  [tags[0]]: [picturesId[0], picturesId[1]],
  [tags[1]]: [picturesId[0], picturesId[2]]
};

const selectedTags = [tags[0], tags[1]];

test('An empty tags selection should return nothing', () => {
  {
    const found = findPictures(tagsByPicture, pictureByTags, [], TAGS_SELECTION_MODE_AND);
    expect(found.sort()).toEqual([]);
  }
  {
    const found = findPictures(tagsByPicture, pictureByTags, [], TAGS_SELECTION_MODE_OR);
    expect(found.sort()).toEqual([]);
  }
});

test('AND', () => {
  expect(findPictures(tagsByPicture, pictureByTags, selectedTags, TAGS_SELECTION_MODE_AND).sort()).toEqual(
    [picturesId[0]].sort()
  );

  expect(findPictures(tagsByPicture, pictureByTags, tags, TAGS_SELECTION_MODE_AND)).toEqual([]);
});

test('OR', () => {
  const found = findPictures(tagsByPicture, pictureByTags, selectedTags, TAGS_SELECTION_MODE_OR);
  const expected = [picturesId[0], picturesId[1], picturesId[2]];
  expect(found.sort()).toEqual(expected.sort());
});

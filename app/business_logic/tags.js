import lodash from 'lodash';

import { TAGS_SELECTION_MODE_AND, TAGS_SELECTION_MODE_OR } from '../data/constants';

export const findPictures = (tagsByPicture, picturesByTags, selectedTags, tagsSelectionMode) => {
  if (selectedTags.length === 0) return [];

  let foundPicturesId = [];

  switch (tagsSelectionMode) {
    case TAGS_SELECTION_MODE_AND:
      for (const p in tagsByPicture) {
        if (lodash.difference(selectedTags, tagsByPicture[p]).length === 0) foundPicturesId.push(p);
      }
      break;
    case TAGS_SELECTION_MODE_OR:
      for (const t of selectedTags) {
        foundPicturesId = foundPicturesId.concat(picturesByTags[t]);
      }
      break;
  }

  return lodash.uniq(foundPicturesId).filter(_ => undefined !== _);
};

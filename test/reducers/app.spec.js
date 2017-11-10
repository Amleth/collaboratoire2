import Chance from 'chance';
import lodash from 'lodash';

import r, { createInitialState } from '../../app/reducers/app';
import {
  CREATE_ANNOTATION_MEASURE_LINEAR,
  DELETE_ANNOTATION_MEASURE_LINEAR,
  EDIT_ANNOTATION,
  TAG_PICTURE
} from '../../app/actions/app';
import { ANNOTATION_MEASURE_LINEAR } from '../../app/data/constants';

const chance = new Chance();
const initialState = createInitialState().app;

describe('reducers', () => {
  it('should tag a picture', () => {
    const pictureId = chance.guid();
    const tagName = chance.string();

    const newState = r(initialState, {
      type: TAG_PICTURE,
      pictureId: pictureId,
      tagName: tagName
    });

    expect(newState.tags_by_picture).toEqual({ [pictureId]: [tagName] });
    expect(newState.pictures_by_tag).toEqual({ [tagName]: [pictureId] });
  });

  it('should create two linear annotations and the delete the first one', () => {
    const pictureId = chance.guid();

    let annotations;

    let newState = r(initialState, {
      type: CREATE_ANNOTATION_MEASURE_LINEAR,
      pictureId,
      points: [1, 2, 3, 4],
      value_in_mm: 111
    });

    annotations = newState.annotations_measures_linear[pictureId];
    expect(annotations.length).toBe(1);
    expect(annotations[0].annotationType).toBe(ANNOTATION_MEASURE_LINEAR);
    expect(annotations[0].pictureId).toBe(pictureId);
    expect(annotations[0].points).toEqual([1, 2, 3, 4]);
    expect(annotations[0].value_in_mm).toBe(111);
    const first_annotation_id = newState.annotations_measures_linear[pictureId][0].id;

    newState = r(newState, {
      type: CREATE_ANNOTATION_MEASURE_LINEAR,
      pictureId,
      points: [5, 6, 7, 8],
      value_in_mm: 222
    });

    annotations = lodash.sortBy(newState.annotations_measures_linear[pictureId], 'creationTimestamp');
    expect(annotations.length).toBe(2);
    expect(annotations[1].annotationType).toBe(ANNOTATION_MEASURE_LINEAR);
    expect(annotations[1].pictureId).toBe(pictureId);
    expect(annotations[1].points).toEqual([5, 6, 7, 8]);
    expect(annotations[1].value_in_mm).toBe(222);

    newState = r(newState, { type: DELETE_ANNOTATION_MEASURE_LINEAR, pictureId, annotationId: first_annotation_id });

    annotations = newState.annotations_measures_linear[pictureId];
    expect(annotations.length).toBe(1);
    expect(annotations[0].id).not.toBe(first_annotation_id);
  });

  it('Should edit an existing annotation', () => {
    const pictureId = chance.guid();
    let newState = r(initialState, {
      type: CREATE_ANNOTATION_MEASURE_LINEAR,
      pictureId,
      points: [1, 2, 3, 4],
      value_in_mm: 111
    });
    let annotationId = newState.annotations_measures_linear[pictureId][0].id;

    const someRandomText = chance.paragraph();
    newState = r(newState, {
      type: EDIT_ANNOTATION,
      annotationId,
      annotationType: ANNOTATION_MEASURE_LINEAR,
      pictureId,
      targetType: 'Feuille',
      text: someRandomText,
      title: 'Annotation #1'
    });
    let annotation = newState.annotations_measures_linear[pictureId][0];

    expect(annotation.targetType).toBe('Feuille');
  });
});

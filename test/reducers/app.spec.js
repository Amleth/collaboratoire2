import Chance from 'chance';
import lodash from 'lodash';

import r, { createInitialState } from '../../app/reducers/app';
import {
  CREATE_ANNOTATION_MEASURE_LINEAR,
  DELETE_ANNOTATION_MEASURE_LINEAR,
  DELETE_TAG,
  EDIT_ANNOTATION,
  FIRST_PICTURE_IN_SELECTION,
  LAST_PICTURE_IN_SELECTION,
  MOVE_PICTURE_IN_PICTURES_SELECTION,
  NEXT_PICTURE_IN_SELECTION,
  NEXT_TEN_PICTURE_IN_SELECTION,
  PREVIOUS_PICTURE_IN_SELECTION,
  PREVIOUS_TEN_PICTURE_IN_SELECTION,
  SELECT_TAG,
  TAG_PICTURE,
  UNTAG_PICTURE,
  CREATE_TAG
} from '../../app/actions/app';
import { ANNOTATION_MEASURE_LINEAR } from '../../app/data/constants';

const chance = new Chance();

//
// PICTURES NAVIGATION
//

test('I should navigate in pictures selection', () => {
  // Init a pictures selection
  let state = createInitialState().app;
  state.pictures_selection = [];
  for (let i = 0; i < 69; i++) state.pictures_selection.push(chance.guid());

  // +1

  state.current_picture_index_in_selection = 42;
  state = r(state, {
    type: NEXT_PICTURE_IN_SELECTION
  });
  expect(state.current_picture_index_in_selection).toBe(43);

  state.current_picture_index_in_selection = 68;
  state = r(state, {
    type: NEXT_PICTURE_IN_SELECTION
  });
  expect(state.current_picture_index_in_selection).toBe(0);

  // +10

  state.current_picture_index_in_selection = 42;
  state = r(state, {
    type: NEXT_TEN_PICTURE_IN_SELECTION
  });
  expect(state.current_picture_index_in_selection).toBe(52);

  state.current_picture_index_in_selection = 65;
  state = r(state, {
    type: NEXT_TEN_PICTURE_IN_SELECTION
  });
  expect(state.current_picture_index_in_selection).toBe(6);

  // last

  state.current_picture_index_in_selection = 42;
  state = r(state, {
    type: LAST_PICTURE_IN_SELECTION
  });
  expect(state.current_picture_index_in_selection).toBe(68);

  // -1

  state.current_picture_index_in_selection = 42;
  state = r(state, {
    type: PREVIOUS_PICTURE_IN_SELECTION
  });
  expect(state.current_picture_index_in_selection).toBe(41);

  state.current_picture_index_in_selection = 0;
  state = r(state, {
    type: PREVIOUS_PICTURE_IN_SELECTION
  });
  expect(state.current_picture_index_in_selection).toBe(68);

  // -10

  state.current_picture_index_in_selection = 42;
  state = r(state, {
    type: PREVIOUS_TEN_PICTURE_IN_SELECTION
  });
  expect(state.current_picture_index_in_selection).toBe(32);

  state.current_picture_index_in_selection = 3;
  state = r(state, {
    type: PREVIOUS_TEN_PICTURE_IN_SELECTION
  });
  expect(state.current_picture_index_in_selection).toBe(62);

  // first

  state.current_picture_index_in_selection = 42;
  state = r(state, {
    type: FIRST_PICTURE_IN_SELECTION
  });
  expect(state.current_picture_index_in_selection).toBe(0);
});

test('It should move a picture in pictures selection', () => {
  // Init a pictures selection
  let state = createInitialState().app;
  state.pictures_selection = [];
  for (let i = 0; i < 5; i++) state.pictures_selection.push(chance.guid());
  const copy = JSON.parse(JSON.stringify(state.pictures_selection));

  state = r(state, { type: MOVE_PICTURE_IN_PICTURES_SELECTION, indexFrom: 4, indexTo: 2 });
  expect(state.pictures_selection[0]).toBe(copy[0]);
  expect(state.pictures_selection[1]).toBe(copy[1]);
  expect(state.pictures_selection[2]).toBe(copy[4]);
  expect(state.pictures_selection[3]).toBe(copy[2]);
  expect(state.pictures_selection[4]).toBe(copy[3]);
});

//
// TAGS (ON PICTURES)
//

test('It should tag then untag a picture', () => {
  const pictureId = chance.guid();
  const tagName = chance.string();

  let state = createInitialState().app;
  state = r(state, { type: TAG_PICTURE, pictureId: pictureId, tagName: tagName });
  expect(state.tags_by_picture).toEqual({ [pictureId]: [tagName] });
  expect(state.pictures_by_tag).toEqual({ [tagName]: [pictureId] });

  state = r(state, { type: UNTAG_PICTURE, pictureId: pictureId, tagName: tagName });
  expect(state.tags_by_picture).toEqual({ [pictureId]: [] });
  expect(state.pictures_by_tag).toEqual({ [tagName]: [] });
});

test('It should delete a tag', () => {
  const initialState = createInitialState().app;
  const pictureId = chance.guid();
  const tag1Name = chance.string();
  const tag2Name = chance.string();

  let state = initialState;
  state = r(state, { type: CREATE_TAG, name: tag1Name });
  state = r(state, { type: TAG_PICTURE, pictureId: pictureId, tagName: tag1Name });
  state = r(state, { type: SELECT_TAG, name: tag1Name });
  state = r(state, { type: CREATE_TAG, name: tag2Name });
  state = r(state, { type: TAG_PICTURE, pictureId: pictureId, tagName: tag2Name });
  state = r(state, { type: SELECT_TAG, name: tag2Name });
  state = r(state, { type: DELETE_TAG, name: tag1Name });

  expect(state.selected_tags).toEqual([tag2Name]);
  expect(state.tags.length).toEqual(1);
  expect(state.tags.filter(_ => _.name === tag2Name).length).toEqual(1);
  expect(state.tags_by_picture).toEqual({ [pictureId]: [tag2Name] });
  expect(state.pictures_by_tag).toEqual({ [tag2Name]: [pictureId] });
});

//
// ANNOTATIONS
//

test('It should create two linear annotations and the delete the first one', () => {
  const initialState = createInitialState().app;
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

test('It should edit an existing annotation', () => {
  const initialState = createInitialState().app;
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

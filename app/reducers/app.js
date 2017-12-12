import Chance from 'chance';
import lodash from 'lodash';

import {
  CREATE_ANNOTATION_MEASURE_LINEAR,
  CREATE_ANNOTATION_POINT_OF_INTEREST,
  CREATE_ANNOTATION_RECTANGULAR,
  CREATE_TAG,
  DELETE_ANNOTATION_MEASURE_LINEAR,
  DELETE_ANNOTATION_POINT_OF_INTEREST,
  DELETE_ANNOTATION_RECTANGULAR,
  DELETE_TAG,
  EDIT_ANNOTATION,
  FIRST_PICTURE_IN_SELECTION,
  FOCUS_ANNOTATION,
  LAST_PICTURE_IN_SELECTION,
  MOVE_PICTURE_IN_PICTURES_SELECTION,
  NEXT_PICTURE_IN_SELECTION,
  NEXT_TEN_PICTURE_IN_SELECTION,
  PREVIOUS_PICTURE_IN_SELECTION,
  PREVIOUS_TEN_PICTURE_IN_SELECTION,
  SELECT_TAG,
  SET_PICTURE_IN_SELECTION,
  SET_PICTURES_SELECTION,
  SET_TAGS_SELECTION_MODE,
  TAG_ANNOTATION,
  TAG_PICTURE,
  UNSELECT_TAG,
  UNTAG_ANNOTATION,
  UNTAG_PICTURE
} from '../actions/app';

import {
  ANNOTATION_MEASURE_LINEAR,
  ANNOTATION_POINT_OF_INTEREST,
  ANNOTATION_RECTANGULAR,
  TAGS_SELECTION_MODE_AND,
  TAGS_SELECTION_MODE_OR
} from '../data/constants';

const chance = new Chance();

export const createInitialState = () => ({
  app: {
    annotations_measures_linear: {},
    annotations_points_of_interest: {},
    annotations_rectangular: {},
    counter: 0,
    current_picture_index_in_selection: 0,
    focused_annotation: null,
    pictures: {},
    pictures_by_tag: {},
    pictures_selection: [],
    selected_tags: [],
    standard_deviation: null,
    tags_by_picture: {},
    tags: [],
    tags_selection_mode: TAGS_SELECTION_MODE_OR
  }
});

export const userDataBranches = () => ({
  annotations_measures_linear: null,
  annotations_points_of_interest: null,
  annotations_rectangular: null,
  pictures_by_tag: null,
  tags_by_picture: null,
  tags: null
});

export default (state = {}, action) => {
  const NOW_DATE = new Date();
  const NOW_TIMESTAMP = NOW_DATE.getTime();

  switch (action.type) {
    case CREATE_ANNOTATION_MEASURE_LINEAR:
      {
        const counter = state.counter + 1;
        const { type, ...payload } = action;
        return {
          ...state,
          counter,
          annotations_measures_linear: {
            ...state.annotations_measures_linear,
            [payload.pictureId]: [
              {
                ...payload,
                annotationType: ANNOTATION_MEASURE_LINEAR,
                creationDate: NOW_DATE,
                creationTimestamp: NOW_TIMESTAMP,
                id: chance.guid(),
                title: `LIN-${counter}`
              },
              ...(state.annotations_measures_linear[payload.pictureId] || [])
            ]
          }
        };
      }
      break;
    case CREATE_ANNOTATION_POINT_OF_INTEREST:
      {
        const counter = state.counter + 1;
        const { type, ...payload } = action;
        return {
          ...state,
          counter,
          annotations_points_of_interest: {
            ...state.annotations_points_of_interest,
            [payload.pictureId]: [
              {
                ...payload,
                annotationType: ANNOTATION_POINT_OF_INTEREST,
                creationDate: NOW_DATE,
                creationTimestamp: NOW_TIMESTAMP,
                id: chance.guid(),
                title: `POI-${counter}`
              },
              ...(state.annotations_points_of_interest[payload.pictureId] || [])
            ]
          }
        };
      }
      break;
    case CREATE_ANNOTATION_RECTANGULAR:
      if (action.width <= 0 || action.height <= 0) return state;
      {
        const counter = state.counter + 1;
        const { type, ...payload } = action;
        return {
          ...state,
          counter,
          annotations_rectangular: {
            ...state.annotations_rectangular,
            [payload.pictureId]: [
              {
                ...payload,
                annotationType: ANNOTATION_RECTANGULAR,
                creationDate: NOW_DATE,
                creationTimestamp: NOW_TIMESTAMP,
                id: chance.guid(),
                title: `REC-${counter}`
              },
              ...(state.annotations_rectangular[payload.pictureId] || [])
            ]
          }
        };
      }
      break;
    case CREATE_TAG:
      if (!action.name) return state;

      const alreadyExists = state.tags.filter(_ => _.name === action.name).length !== 0;
      if (alreadyExists) return state;
      return {
        ...state,
        tags: [{ name: action.name, creationDate: NOW_DATE, creationTimestamp: NOW_TIMESTAMP }, ...state.tags]
      };
      break;
    case DELETE_ANNOTATION_MEASURE_LINEAR:
      return {
        ...state,
        annotations_measures_linear: {
          ...state.annotations_measures_linear,
          [action.pictureId]: state.annotations_measures_linear[action.pictureId].filter(
            _ => _.id !== action.annotationId
          )
        }
      };
      break;
    case DELETE_ANNOTATION_POINT_OF_INTEREST:
      return {
        ...state,
        annotations_points_of_interest: {
          ...state.annotations_points_of_interest,
          [action.pictureId]: state.annotations_points_of_interest[action.pictureId].filter(
            _ => _.id !== action.annotationId
          )
        }
      };
      break;
    case DELETE_ANNOTATION_RECTANGULAR:
      return {
        ...state,
        annotations_rectangular: {
          ...state.annotations_rectangular,
          [action.pictureId]: state.annotations_rectangular[action.pictureId].filter(_ => _.id !== action.annotationId)
        }
      };
      break;
    case DELETE_TAG:
      {
        const new_tags_by_picture = {};
        for (const p in state.tags_by_picture) {
          const index = state.tags_by_picture[p].indexOf(action.name);
          if (index === -1) {
            new_tags_by_picture[p] = state.tags_by_picture[p];
          } else {
            if (state.tags_by_picture[p.length === 1]) {
            } else {
              new_tags_by_picture[p] = [
                ...state.tags_by_picture[p].slice(0, index),
                ...state.tags_by_picture[p].slice(index + 1)
              ];
            }
          }
        }
        const index_in_selected_tags = state.selected_tags.indexOf(action.name);
        return {
          ...state,
          pictures_by_tag: lodash.omit(state.pictures_by_tag, action.name),
          selected_tags: [
            ...state.selected_tags.slice(0, index_in_selected_tags),
            ...state.selected_tags.slice(index_in_selected_tags + 1)
          ],
          tags: state.tags.filter(_ => _.name !== action.name),
          tags_by_picture: new_tags_by_picture
        };
      }
      break;
    case EDIT_ANNOTATION:
      let branch;
      switch (action.annotationType) {
        case ANNOTATION_MEASURE_LINEAR:
          branch = 'annotations_measures_linear';
          break;
        case ANNOTATION_POINT_OF_INTEREST:
          branch = 'annotations_points_of_interest';
          break;
        case ANNOTATION_RECTANGULAR:
          branch = 'annotations_rectangular';
          break;
        default:
          return state;
      }

      const annotation = state[branch][action.pictureId].filter(_ => _.id === action.annotationId).pop();
      annotation.targetType = action.targetType;
      annotation.text = action.text;
      annotation.title = action.title;

      return {
        ...state,
        [branch]: {
          ...state[branch],
          [action.pictureId]: [...state[branch][action.pictureId].filter(_ => _.id !== action.annotationId), annotation]
        }
      };
      break;
    case FIRST_PICTURE_IN_SELECTION:
      return { ...state, current_picture_index_in_selection: 0 };
      break;
    case FOCUS_ANNOTATION:
      return {
        ...state,
        focused_annotation: {
          annotationId: action.annotationId,
          annotationType: action.annotationType,
          pictureId: action.pictureId
        }
      };
      break;
    case LAST_PICTURE_IN_SELECTION:
      return { ...state, current_picture_index_in_selection: state.pictures_selection.length - 1 };
      break;
    case MOVE_PICTURE_IN_PICTURES_SELECTION:
      {
        if (action.indexFrom === action.indexTo) return state;
        if (action.indexFrom < 0) return state;
        if (action.indexTo < 0) return state;
        if (action.indexFrom >= state.pictures_selection.length) return state;
        if (action.indexTo >= state.pictures_selection.length) return state;

        const pictures_selection = state.pictures_selection;
        const element = pictures_selection[action.indexFrom];
        pictures_selection.splice(action.indexFrom, 1);
        pictures_selection.splice(action.indexTo, 0, element);

        return { ...state, pictures_selection };
      }
      break;
    case NEXT_PICTURE_IN_SELECTION:
      {
        let current_picture_index_in_selection = state.current_picture_index_in_selection;
        if (state.current_picture_index_in_selection === state.pictures_selection.length - 1)
          current_picture_index_in_selection = 0;
        else current_picture_index_in_selection++;
        return { ...state, current_picture_index_in_selection };
      }
      break;
    case NEXT_TEN_PICTURE_IN_SELECTION:
      return {
        ...state,
        current_picture_index_in_selection:
          (state.current_picture_index_in_selection + 10) % state.pictures_selection.length
      };
      break;
    case PREVIOUS_PICTURE_IN_SELECTION:
      {
        let current_picture_index_in_selection = state.current_picture_index_in_selection;
        if (state.current_picture_index_in_selection === 0)
          current_picture_index_in_selection = state.pictures_selection.length - 1;
        else current_picture_index_in_selection--;
        return { ...state, current_picture_index_in_selection };
      }
      break;
    case PREVIOUS_TEN_PICTURE_IN_SELECTION:
      {
        let _ = state.current_picture_index_in_selection - 10;
        if (_ < 0) _ += state.pictures_selection.length;
        return { ...state, current_picture_index_in_selection: _ };
      }
      break;
    case SELECT_TAG:
      if (state.selected_tags.indexOf(action.name) !== -1) return state;
      return { ...state, selected_tags: [action.name, ...state.selected_tags] };
      break;
    case SET_PICTURE_IN_SELECTION:
      const index = state.pictures_selection.indexOf(action.pictureId);
      return { ...state, current_picture_index_in_selection: index };
      break;
    case SET_PICTURES_SELECTION:
      return { ...state, pictures_selection: action.pictures_selection, current_picture_index_in_selection: 0 };
      break;
    case SET_TAGS_SELECTION_MODE:
      return { ...state, tags_selection_mode: action.mode };
      break;
    case TAG_PICTURE:
      // Is the tag already present?
      if (
        state.tags_by_picture.hasOwnProperty(action.pictureId) &&
        state.tags_by_picture[action.pictureId].indexOf(action.tagName) !== -1
      )
        return state;

      const new_state = { ...state };

      // tags_by_picture
      if (!new_state.tags_by_picture.hasOwnProperty(action.pictureId)) new_state.tags_by_picture[action.pictureId] = [];
      new_state.tags_by_picture[action.pictureId] = [action.tagName, ...new_state.tags_by_picture[action.pictureId]];

      // pictures_by_tag
      if (!new_state.pictures_by_tag.hasOwnProperty(action.tagName)) new_state.pictures_by_tag[action.tagName] = [];
      new_state.pictures_by_tag[action.tagName] = [action.pictureId, ...new_state.pictures_by_tag[action.tagName]];

      return new_state;
      break;
    case UNSELECT_TAG:
      const tag_to_remove_index = state.selected_tags.indexOf(action.name);
      if (tag_to_remove_index === -1) return state;

      return {
        ...state,
        selected_tags: [
          ...state.selected_tags.slice(0, tag_to_remove_index),
          ...state.selected_tags.slice(tag_to_remove_index + 1)
        ]
      };
      break;
    case UNTAG_PICTURE:
      {
        const i = state.tags_by_picture[action.pictureId].indexOf(action.tagName);
        const j = state.pictures_by_tag[action.tagName].indexOf(action.pictureId);

        return {
          ...state,
          tags_by_picture: {
            ...state.tags_by_picture,
            [action.pictureId]: [
              ...state.tags_by_picture[action.pictureId].slice(0, i),
              ...state.tags_by_picture[action.pictureId].slice(i + 1)
            ]
          },
          pictures_by_tag: {
            ...state.pictures_by_tag,
            [action.tagName]: [
              ...state.pictures_by_tag[action.tagName].slice(0, j),
              ...state.pictures_by_tag[action.tagName].slice(j + 1)
            ]
          }
        };
      }
      break;
    default:
      return state;
  }
};

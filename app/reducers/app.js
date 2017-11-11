import Chance from 'chance';

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
  FOCUS_ANNOTATION,
  NEXT_PICTURE_IN_SELECTION,
  PREVIOUS_PICTURE_IN_SELECTION,
  SELECT_TAG,
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
        tags: [
          {
            name: action.name,
            creationDate: NOW_DATE,
            creationTimestamp: NOW_TIMESTAMP
          },
          ...state.tags
        ]
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
        annotations_measures_linear: {
          ...state.annotations_measures_linear,
          [action.pictureId]: [
            ...state.annotations_measures_linear[action.pictureId].filter(_ => _.id !== action.annotationId),
            annotation
          ]
        }
      };
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
    case NEXT_PICTURE_IN_SELECTION:
      {
        let current_picture_index_in_selection = state.current_picture_index_in_selection;
        if (state.current_picture_index_in_selection === state.pictures_selection.length - 1)
          current_picture_index_in_selection = 0;
        else current_picture_index_in_selection++;
        return { ...state, current_picture_index_in_selection };
      }
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
    case SELECT_TAG:
      if (state.selected_tags.indexOf(action.name) !== -1) return state;
      return { ...state, selected_tags: [action.name, ...state.selected_tags] };
      break;
    case SET_PICTURES_SELECTION:
      return { ...state, pictures_selection: action.pictures_selection };
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
    default:
      return state;
  }
};

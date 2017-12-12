/*
pictureId refers to a picture SHA1
*/

export const CREATE_ANNOTATION_MEASURE_LINEAR = 'CREATE_ANNOTATION_MEASURE_LINEAR';
export const CREATE_ANNOTATION_POINT_OF_INTEREST = 'CREATE_ANNOTATION_POINT_OF_INTEREST';
export const CREATE_ANNOTATION_RECTANGULAR = 'CREATE_ANNOTATION_RECTANGULAR';
export const CREATE_TAG = 'CREATE_TAG';
export const DELETE_ANNOTATION_MEASURE_LINEAR = 'DELETE_ANNOTATION_MEASURE_LINEAR';
export const DELETE_ANNOTATION_POINT_OF_INTEREST = 'DELETE_ANNOTATION_POINT_OF_INTEREST';
export const DELETE_ANNOTATION_RECTANGULAR = 'DELETE_ANNOTATION_RECTANGULAR';
export const DELETE_TAG = 'DELETE_TAG';
export const EDIT_ANNOTATION = 'EDIT_ANNOTATION';
export const FIRST_PICTURE_IN_SELECTION = 'FIRST_PICTURE_IN_SELECTION';
export const FOCUS_ANNOTATION = 'FOCUS_ANNOTATION';
export const LAST_PICTURE_IN_SELECTION = 'LAST_PICTURE_IN_SELECTION';
export const MOVE_PICTURE_IN_PICTURES_SELECTION = 'MOVE_PICTURE_IN_PICTURES_SELECTION';
export const NEXT_PICTURE_IN_SELECTION = 'NEXT_PICTURE_IN_SELECTION';
export const NEXT_TEN_PICTURE_IN_SELECTION = 'NEXT_TEN_PICTURE_IN_SELECTION';
export const PREVIOUS_PICTURE_IN_SELECTION = 'PREVIOUS_PICTURE_IN_SELECTION';
export const PREVIOUS_TEN_PICTURE_IN_SELECTION = 'PREVIOUS_TEN_PICTURE_IN_SELECTION';
export const SELECT_TAG = 'SELECT_TAG';
export const SET_PICTURE_IN_SELECTION = 'SET_PICTURE_IN_SELECTION';
export const SET_PICTURES_SELECTION = 'SET_PICTURES_SELECTION';
export const SET_TAGS_SELECTION_MODE = 'SET_TAGS_SELECTION_MODE';
export const TAG_ANNOTATION = 'TAG_ANNOTATION';
export const TAG_PICTURE = 'TAG_PICTURE';
export const UNSELECT_TAG = 'UNSELECT_TAG';
export const UNTAG_ANNOTATION = 'UNTAG_ANNOTATION';
export const UNTAG_PICTURE = 'UNTAG_PICTURE';

export const createAnnotationMeasureLinear = (pictureId, x1, y1, x2, y2, value_in_mm) => {
  return {
    type: CREATE_ANNOTATION_MEASURE_LINEAR,
    pictureId,
    x1,
    y1,
    x2,
    y2,
    value_in_mm
  };
};

export const createAnnotationPointOfInterest = (pictureId, x, y) => {
  return {
    type: CREATE_ANNOTATION_POINT_OF_INTEREST,
    pictureId,
    x,
    y
  };
};

export const createAnnotationRectangular = (pictureId, x, y, width, height) => {
  return {
    type: CREATE_ANNOTATION_RECTANGULAR,
    pictureId,
    x,
    y,
    width,
    height
  };
};

export const createTag = name => ({
  type: CREATE_TAG,
  name
});

export const deleteAnnotationMeasureLinear = (pictureId, annotationId) => ({
  type: DELETE_ANNOTATION_MEASURE_LINEAR,
  pictureId,
  annotationId
});

export const deleteAnnotationPointOfInterest = (pictureId, annotationId) => ({
  type: DELETE_ANNOTATION_POINT_OF_INTEREST,
  pictureId,
  annotationId
});

export const deleteAnnotationRectangular = (pictureId, annotationId) => ({
  type: DELETE_ANNOTATION_RECTANGULAR,
  pictureId,
  annotationId
});

export const deleteTag = name => ({
  type: DELETE_TAG,
  name
});

export const editAnnotation = (pictureId, annotationType, annotationId, title, targetType, text) => ({
  type: EDIT_ANNOTATION,
  annotationId,
  annotationType,
  pictureId,
  targetType,
  text,
  title
});

export const firstPictureInSelection = () => ({
  type: FIRST_PICTURE_IN_SELECTION
});

export const focusAnnotation = (annotationId, annotationType, pictureId) => ({
  type: FOCUS_ANNOTATION,
  annotationId,
  annotationType,
  pictureId
});

export const lastPictureInSelection = () => ({
  type: LAST_PICTURE_IN_SELECTION
});

export const movePictureInPicturesSelection = (indexFrom, indexTo) => ({
  type: MOVE_PICTURE_IN_PICTURES_SELECTION,
  indexFrom,
  indexTo
});

export const nextPictureInSelection = () => ({
  type: NEXT_PICTURE_IN_SELECTION
});

export const nextTenPictureInSelection = () => ({
  type: NEXT_TEN_PICTURE_IN_SELECTION
});

export const previousPictureInSelection = () => ({
  type: PREVIOUS_PICTURE_IN_SELECTION
});

export const previousTenPictureInSelection = () => ({
  type: PREVIOUS_TEN_PICTURE_IN_SELECTION
});

export const selectTag = name => ({
  type: SELECT_TAG,
  name
});

export const setPictureInSelection = pictureId => ({
  type: SET_PICTURE_IN_SELECTION,
  pictureId
});

export const setPicturesSelection = pictures_selection => ({
  type: SET_PICTURES_SELECTION,
  pictures_selection
});

export const setTagsSelectionMode = mode => ({
  type: SET_TAGS_SELECTION_MODE,
  mode
});

export const tagAnnotation = (annotationId, tagName) => ({
  type: TAG_ANNOTATION,
  annotationId,
  tagName
});

export const tagPicture = (pictureId, tagName) => ({
  type: TAG_PICTURE,
  pictureId,
  tagName
});

export const unselectTag = name => ({
  type: UNSELECT_TAG,
  name
});

export const untagAnnotation = (annotationId, tagName) => ({
  type: UNTAG_ANNOTATION,
  annotationId,
  tagName
});

export const untagPicture = (pictureId, tagName) => ({
  type: UNTAG_PICTURE,
  pictureId,
  tagName
});

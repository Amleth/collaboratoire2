import { connect } from 'react-redux';
import Component from '../components/Image';
import {
  createAnnotationMeasureLinear,
  createAnnotationPointOfInterest,
  createAnnotationRectangular,
  deleteAnnotationMeasureLinear,
  deleteAnnotationPointOfInterest,
  deleteAnnotationRectangular,
  nextPictureInSelection,
  previousPictureInSelection
} from '../actions/app';

const mapStateToProps = state => {
  return {
    annotationsMeasuresLinear: state.app.annotations_measures_linear,
    annotationsRectangular: state.app.annotations_rectangular,
    annotationsPointsOfInterest: state.app.annotations_points_of_interest,
    currentPictureIndexInSelection: state.app.current_picture_index_in_selection,
    focusedAnnotation: state.app.focused_annotation,
    pictures: state.app.pictures,
    picturesSelection: state.app.pictures_selection,
    tagsByPicture: state.app.tags_by_picture
  };
};

const mapDispatchToProps = dispatch => {
  return {
    createAnnotationMeasureLinear: (pictureId, x1, y1, x2, y2, value_in_mm) => {
      dispatch(createAnnotationMeasureLinear(pictureId, x1, y1, x2, y2, value_in_mm));
    },
    createAnnotationPointOfInterest: (pictureId, x, y) => {
      dispatch(createAnnotationPointOfInterest(pictureId, x, y));
    },
    createAnnotationRectangular: (pictureId, x, y, width, height) => {
      dispatch(createAnnotationRectangular(pictureId, x, y, width, height));
    },
    deleteAnnotationMeasureLinear: (pictureId, annotationId) => {
      dispatch(deleteAnnotationMeasureLinear(pictureId, annotationId));
    },
    deleteAnnotationPointOfInterest: (pictureId, annotationId) => {
      dispatch(deleteAnnotationPointOfInterest(pictureId, annotationId));
    },
    deleteAnnotationRectangular: (pictureId, annotationId) => {
      dispatch(deleteAnnotationRectangular(pictureId, annotationId));
    },
    nextPictureInSelection: () => dispatch(nextPictureInSelection()),
    previousPictureInSelection: () => dispatch(previousPictureInSelection())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);

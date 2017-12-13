import { connect } from 'react-redux';
import Component from '../components/Inspector';
import { editAnnotation, focusAnnotation, tagAnnotation, untagAnnotation, untagPicture } from '../actions/app';

const mapStateToProps = (state, ownProps) => {
  return {
    allTags: state.app.tags,
    tagsByAnnotation: state.app.tags_by_annotation
  };
};

const mapDispatchToProps = dispatch => {
  return {
    editAnnotation: (pictureId, annotationType, annotationId, title, targetType, text) => {
      dispatch(editAnnotation(pictureId, annotationType, annotationId, title, targetType, text));
    },
    focusAnnotation: (annotationId, annotationType, pictureId) => {
      dispatch(focusAnnotation(annotationId, annotationType, pictureId));
    },
    tagAnnotation: (annotationId, tagName) => {
      dispatch(tagAnnotation(annotationId, tagName));
    },
    untagAnnotation: (annotationId, tagName) => {
      dispatch(untagAnnotation(annotationId, tagName));
    },
    untagPicture: (pictureId, tagName) => {
      dispatch(untagPicture(pictureId, tagName));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);

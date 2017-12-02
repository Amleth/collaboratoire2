import { connect } from 'react-redux';
import Component from '../components/Inspector';
import { editAnnotation, focusAnnotation, untagAnnotation, untagPicture } from '../actions/app';

const mapStateToProps = (state, ownProps) => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {
    editAnnotation: (pictureId, annotationType, annotationId, title, targetType, text) => {
      dispatch(editAnnotation(pictureId, annotationType, annotationId, title, targetType, text));
    },
    focusAnnotation: (annotationId, annotationType, pictureId) => {
      dispatch(focusAnnotation(annotationId, annotationType, pictureId));
    },
    untagPicture: (pictureId, tagName) => {
      dispatch(untagPicture(pictureId, tagName));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);

import { connect } from 'react-redux';
import Component from '../components/Inspector';
import { editAnnotation, focusAnnotation } from '../actions/app';

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
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);

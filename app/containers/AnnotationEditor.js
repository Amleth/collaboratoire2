import { connect } from 'react-redux';
import Component from '../components/AnnotationEditor';
import { editAnnotation, focusAnnotation, tagAnnotation, untagAnnotation } from '../actions/app';

const mapStateToProps = (state, ownProps) => {
  return {
    allTags: state.app.tags,
    tagsByAnnotation: state.app.tags_by_annotation
  };
};

const mapDispatchToProps = dispatch => {
  return {
    tagAnnotation: (annotationId, tagName) => dispatch(tagAnnotation(annotationId, tagName)),
    untagAnnotation: (annotationId, tagName) => dispatch(untagAnnotation(annotationId, tagName))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);

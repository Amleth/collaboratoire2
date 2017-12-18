import { connect } from 'react-redux';
import Component from '../components/AnnotationEditor';
import { editAnnotation, focusAnnotation, tagAnnotation, untagAnnotation } from '../actions/app';

const mapStateToProps = (state, ownProps) => {
  return {
    allTags: state.app.tags,
    tags: state.app.tags_by_annotation[ownProps.annotation.id]
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    tagAnnotation: tagName => dispatch(tagAnnotation(ownProps.annotation.id, tagName)),
    untagAnnotation: tagName => dispatch(untagAnnotation(ownProps.annotation.id, tagName))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);

import { connect } from 'react-redux';
import Component from '../components/AnnotationEditor';
import { editAnnotation, focusAnnotation } from '../actions/app';

const mapStateToProps = (state, ownProps) => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);

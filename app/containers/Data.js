import { connect } from 'react-redux';
import lodash from 'lodash';

import Component from '../components/Data';

const mapStateToProps = state => {
  return {
    annotationsMeasuresLinear: lodash.flatten(Object.values(state.app.annotations_measures_linear)),
    pictures: state.app.pictures
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);

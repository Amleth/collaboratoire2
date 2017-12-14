import { connect } from 'react-redux';

import Component from '../components/App';

const mapStateToProps = state => {
  return { appState: state.app };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);

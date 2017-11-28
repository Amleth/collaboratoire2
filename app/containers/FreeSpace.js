import { connect } from 'react-redux';
import Component from '../components/FreeSpace';

const mapStateToProps = state => {
  return {
    annotationsMeasuresLinear: state.app.annotations_measures_linear,
    annotationsRectangular: state.app.annotations_rectangular,
    annotationsPointsOfInterest: state.app.annotations_points_of_interest,
    focusedAnnotation: state.app.focused_annotation,
    pictures: state.app.pictures,
    picturesSelection: state.app.pictures_selection,
    tagsByPicture: state.app.tags_by_picture
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);

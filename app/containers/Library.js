import { createTag, selectTag, setTagsSelectionMode, tagPicture, unselectTag, untagPicture } from '../actions/app';
import { connect } from 'react-redux';
import Component from '../components/Library';
import { arrayToIndex } from '../utils/js';

const mapStateToProps = state => {
  return {
    annotationsMeasuresLinear: state.app.annotations_measures_linear,
    annotationsRectangular: state.app.annotations_rectangular,
    annotationsPointsOfInterest: state.app.annotations_points_of_interest,
    pictures: state.app.pictures,
    tags: state.app.tags,
    selectedTags: state.app.selected_tags,
    tagsByPicture: state.app.tags_by_picture,
    picturesByTag: state.app.pictures_by_tag,
    tagsSelectionMode: state.app.tags_selection_mode
  };
};

const mapDispatchToProps = dispatch => {
  return {
    createTag: name => {
      dispatch(createTag(name));
    },
    selectTag: name => {
      dispatch(selectTag(name));
    },
    setTagsSelectionMode: mode => {
      dispatch(setTagsSelectionMode(mode));
    },
    tagPicture: (pictureId, tagName) => {
      dispatch(tagPicture(pictureId, tagName));
    },
    unselectTag: name => {
      dispatch(unselectTag(name));
    },
    untagPicture: (pictureId, tagName) => {
      dispatch(untagPicture(pictureId, tagName));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);

import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import {
  createTag,
  deleteTag,
  selectTag,
  setPictureInSelection,
  setPicturesSelection,
  setTagsSelectionMode,
  tagPicture,
  unselectTag,
  untagPicture
} from '../actions/app';
import Component from '../components/Library';
import { arrayToIndex } from '../utils/js';

const mapStateToProps = state => {
  return {
    annotationsMeasuresLinear: state.app.annotations_measures_linear,
    annotationsRectangular: state.app.annotations_rectangular,
    annotationsPointsOfInterest: state.app.annotations_points_of_interest,
    allPictures: state.app.pictures,
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
    deleteTag: name => {
      dispatch(deleteTag(name));
    },
    selectTag: name => {
      dispatch(selectTag(name));
    },
    setPictureInSelection: pictureId => {
      dispatch(setPictureInSelection(pictureId));
    },
    setPicturesSelection: pictureSelection => {
      dispatch(setPicturesSelection(pictureSelection));
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
    },
    goToImage: () => {
      dispatch(push('/image'));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);

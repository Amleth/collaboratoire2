import { shell } from 'electron';
import lodash from 'lodash';
import path from 'path';
import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { AutoSizer, Column, SortDirection, SortIndicator, Table } from 'react-virtualized';
import styled, { css } from 'styled-components';

import {
  TAG_HEIGHT,
  NAV_SIZE,
  SECTION_BG,
  SECTION_FG,
  LIBRARY_TAGS_BG,
  SECTION_BG2,
  SECTION_BG2_OVER,
  TABLE_DATA_BG_OVER,
  TABLE_DATA_FG_OVER,
  TAG_BG,
  TAG_BG_OVER,
  TAG_FG,
  TAG_FG_OVER
} from './constants';
import { MARGIN as INSPECTOR_MARGIN, WIDTH as INSPECTOR_WIDTH } from './Inspector';
import { findPictures } from '../business_logic/tags';
import { TAGS_SELECTION_MODE_AND, TAGS_SELECTION_MODE_OR } from '../data/constants';
import Inspector from '../Containers/Inspector';
import Nothing from './Nothing';

//
// CONSTANTS
//

const THUMBNAIL_SIZE = 150;

//
// STYLE
//

const HEADER_MARGIN = 10;
const HEADER_BORDER_COLOUR = '#555555';
const TAGS_HEADER_HEIGHT = 35;
const TAGS_DISPLAYED_LINES = 4;
const TAG_MARGIN = 2;

const _Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

const _Header = styled.div`
  width: 100%;
`;

// TAGS

const _Tags = styled.div`
  height: ${TAGS_HEADER_HEIGHT + TAGS_DISPLAYED_LINES * (TAG_HEIGHT + 2 * TAG_MARGIN)};
  width: 100%;
`;

const _TagsHeader = styled.div`
  background-color: ${SECTION_BG};
  color: ${SECTION_FG};
  display: inline-box;
  height: ${TAGS_HEADER_HEIGHT}px;
  line-height: ${TAGS_HEADER_HEIGHT}px;
  margin: 0;
  width: 100%;
`;

const _TagsTitle = styled.div`
  display: inline;
  font-size: 1.5em;
  margin-right: 30px;
`;

const _TagsSelectionMode = styled.span`
  color: ${SECTION_FG};
  text-decoration: underline;

  &:hover {
    color: ${SECTION_FG};
  }
`;

const _NewTagForm = styled.form``;

const _TagCreationSubmit = styled.input`
  background-color: ${SECTION_BG2};
  border: none;
  color: ${SECTION_FG};

  &:hover {
    background-color: ${SECTION_BG2_OVER};
  }
`;

const _AllTags = styled.div`
  background-color: #555;
  display: flex;
  flex-wrap: wrap;
  height: ${TAGS_DISPLAYED_LINES * (TAG_HEIGHT + 2 * TAG_MARGIN) + 0.5 * TAG_HEIGHT + TAG_MARGIN}px;
  overflow: auto;
  padding: 3px;
`;

const _Tag = styled.div`
  background: ${TAG_BG};
  border-radius: 2px;
  color: ${TAG_FG};
  height: ${TAG_HEIGHT}px;
  margin: 2px;
  padding: 2px;

  ${props =>
    props.selected &&
    css`
      background-color: ${TAG_BG_OVER};
      color: ${TAG_FG_OVER};
    `};

  &:hover {
    background-color: ${TAG_BG_OVER};
    color: ${TAG_FG_OVER};
  }
`;

// PICTURES

const _PicturesHeader = styled.div`
  background-color: ${SECTION_BG};
  color: ${SECTION_FG};
  font-size: 1.5em;
  height: ${TAGS_HEADER_HEIGHT}px;
  line-height: ${TAGS_HEADER_HEIGHT}px;
  width: 100%;
`;

const _Pictures = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
`;

// TABLE

const _FileIcon = styled.i`
  &:hover {
    opacity: 0.5;
  }
`;

const _FileName = styled.span`
  padding: 0 5px;

  &:hover {
    background-color: ${TABLE_DATA_BG_OVER};
    border-radius: 5px;
    color: ${TABLE_DATA_FG_OVER};
  }

  ${props =>
    props.selected &&
    css`
      background-color: ${TABLE_DATA_BG_OVER};
      border-radius: 5px;
      color: ${TABLE_DATA_FG_OVER};
    `};
`;

// COLUMN

const _Panel = styled.div`
  background-color: black;
  width: ${NAV_SIZE};

  img {
    margin: ${INSPECTOR_MARGIN}px;
  }
`;

//
// COMPONENT
//

export default class extends PureComponent {
  // LIFECYCLE

  constructor(props) {
    super(props);

    const allPictures = Object.values(props.allPictures);
    const sortBy = 'sha1';
    const sortDirection = SortDirection.ASC;
    const sortedPicturesList = this._sortList({ sortBy, sortDirection });

    this.state = {
      currentPicture: sortedPicturesList[0],
      newTagName: '',
      allPictures,
      rowCount: allPictures.length,
      sortBy,
      sortDirection,
      sortedPicturesList,
      windowScrollerEnabled: false
    };

    this.handleNewTagNameChange = this.handleNewTagNameChange.bind(this);
    this.handleCreateNewTagSubmit = this.handleCreateNewTagSubmit.bind(this);
    this.handleClickOnTag = this.handleClickOnTag.bind(this);
    this._rowClassName = this._rowClassName.bind(this);
    this._sort = this._sort.bind(this);
    this.click_tagsSelectionMode = this.click_tagsSelectionMode.bind(this);
  }

  render() {
    if (Object.values(this.props.allPictures).length === 0)
      return <Nothing message={'Declare at least one folder containing pictures'} />;

    //TODO This is UGLY!
    const pictures =
      this.props.selectedTags.length === 0
        ? this.state.sortedPicturesList
        : findPictures(
            this.props.tagsByPicture,
            this.props.picturesByTag,
            this.props.selectedTags,
            this.props.tagsSelectionMode
          ).map(_ => this.props.allPictures[_]);
    this.props.setPicturesSelection(pictures.map(_ => _.sha1));

    let key = 0;

    return (
      <_Root>
        <_Header>
          <_Tags>
            <_TagsHeader>
              <_TagsTitle>
                &nbsp;TAGS ({this.props.tags.length}, {this.props.selectedTags.length} selected in{' '}
                <_TagsSelectionMode onClick={this.click_tagsSelectionMode}>
                  {this.props.tagsSelectionMode}
                </_TagsSelectionMode>{' '}
                mode)
              </_TagsTitle>
              <_NewTagForm onSubmit={this.handleCreateNewTagSubmit}>
                <input
                  type="text"
                  name="name"
                  value={this.state.value}
                  onChange={this.handleNewTagNameChange}
                  ref={_ => {
                    this.newTagNameInput = _;
                  }}
                />
                &nbsp;
                <_TagCreationSubmit type="submit" value="Create new tag" />
              </_NewTagForm>
            </_TagsHeader>
            <_AllTags>
              {this.props.tags.map(_ => {
                const selected = this.props.selectedTags.indexOf(_.name) !== -1;
                return (
                  <_Tag
                    selected={selected}
                    key={`tag_${_.name}`}
                    onClick={this.handleClickOnTag}
                    draggable="true"
                    onDragStart={e => e.dataTransfer.setData('tagName', _.name)}
                  >
                    {_.name}
                  </_Tag>
                );
              })}
            </_AllTags>
          </_Tags>
          <_PicturesHeader>&nbsp;PICTURES ({pictures.length})</_PicturesHeader>
        </_Header>
        <_Pictures>
          <div style={{ flex: '1 1 auto' }}>
            <AutoSizer onResize={this.onResize}>
              {({ height, width }) => (
                <Table
                  headerClassName="headerColumn"
                  headerHeight={30}
                  height={height}
                  overscanRowCount={10}
                  rowClassName={this._rowClassName}
                  rowCount={pictures.length}
                  rowGetter={({ index }) => pictures[index % pictures.length]}
                  rowHeight={20}
                  sort={this._sort}
                  sortBy={this.state.sortBy}
                  sortDirection={this.state.sortDirection}
                  width={width}
                >
                  <Column
                    dataKey="file_basename"
                    label="File"
                    width={0.6 * width}
                    cellRenderer={({ cellData, rowData }) => {
                      const selected = this.state.currentPicture.sha1 === rowData.sha1;
                      return (
                        <span>
                          <_FileIcon
                            className="fa fa-folder-open"
                            aria-hidden="true"
                            onClick={e => shell.showItemInFolder(rowData.file)}
                          />
                          &nbsp;
                          <_FileName
                            selected={selected}
                            onDragOver={e => {
                              e.preventDefault();
                              this.setState({ currentPicture: rowData });
                            }}
                            onDrop={e => {
                              e.preventDefault();
                              this.props.tagPicture(rowData.sha1, e.dataTransfer.getData('tagName'));
                            }}
                            onMouseOver={e => this.setState({ currentPicture: rowData })}
                            onDoubleClick={e => {
                              this.props.setPictureInSelection(rowData.sha1);
                              this.props.goToImage();
                            }}
                          >
                            {rowData.file_basename}
                          </_FileName>
                        </span>
                      );
                    }}
                    key={key++}
                  />
                  <Column
                    dataKey="erecolnatMetadata"
                    disableSort={true}
                    label="Catalog N°"
                    width={0.1 * width}
                    key={key++}
                    cellRenderer={({ cellData, rowData }) => {
                      if (rowData.erecolnatMetadata) return rowData.erecolnatMetadata.catalognumber;
                      else return '';
                    }}
                  />
                  <Column dataKey="width" label="Width" width={0.1 * width} key={key++} />
                  <Column dataKey="height" label="Height" width={0.1 * width} key={key++} />
                  <Column dataKey="dpix" label="DPI" width={0.1 * width} key={key++} />
                  <Column
                    dataKey="sha1"
                    disableSort={true}
                    label="Tags"
                    width={0.1 * width}
                    key={key++}
                    cellRenderer={({ cellData }) =>
                      this.props.tagsByPicture.hasOwnProperty(cellData) ? this.props.tagsByPicture[cellData].length : 0
                    }
                  />
                </Table>
              )}
            </AutoSizer>
          </div>
          <_Panel
            onDragOver={e => {
              e.preventDefault();
            }}
            onDrop={e => {
              e.preventDefault();
              this.props.tagPicture(this.state.currentPicture.sha1, e.dataTransfer.getData('tagName'));
            }}
          >
            <img
              src={this.state.currentPicture && this.state.currentPicture.thumbnail}
              width={INSPECTOR_WIDTH - 2 * INSPECTOR_MARGIN}
            />
            <Inspector
              annotationsMeasuresLinear={this.props.annotationsMeasuresLinear[this.state.currentPicture.sha1]}
              annotationsRectangular={this.props.annotationsRectangular[this.state.currentPicture.sha1]}
              annotationsPointsOfInterest={this.props.annotationsPointsOfInterest[this.state.currentPicture.sha1]}
              picture={this.state.currentPicture}
              tags={this.props.tagsByPicture[this.state.currentPicture.sha1]}
            />
          </_Panel>
        </_Pictures>
      </_Root>
    );
  }

  // TAGS

  handleNewTagNameChange(event) {
    this.setState({ newTagName: event.target.value });
  }

  handleCreateNewTagSubmit(event) {
    event.preventDefault();
    const _ = this.state.newTagName;
    // this.setState({ newTagName: '' }); // Why doesn't it work?
    this.newTagNameInput.value = '';
    this.props.createTag(_);
  }

  handleClickOnTag(event) {
    const tagName = event.target.textContent;
    const selected = this.props.selectedTags.indexOf(tagName) !== -1;
    selected ? this.props.unselectTag(tagName) : this.props.selectTag(tagName);
  }

  click_tagsSelectionMode(event) {
    this.props.setTagsSelectionMode(
      this.props.tagsSelectionMode === TAGS_SELECTION_MODE_AND ? TAGS_SELECTION_MODE_OR : TAGS_SELECTION_MODE_AND
    );
  }

  // TABLE HELPERS

  _rowClassName({ index }) {
    if (index < 0) {
      return 'headerRow';
    } else {
      return index % 2 === 0 ? 'evenRow' : 'oddRow';
    }
  }

  _sort({ sortBy, sortDirection }) {
    const sortedPicturesList = this._sortList({ sortBy, sortDirection });
    this.setState({ sortBy, sortDirection, sortedPicturesList });
  }

  _sortList({ sortBy, sortDirection }) {
    const sorted = lodash.sortBy(
      this.props.allPictures,
      _ => (typeof _[sortBy] === 'string' ? _[sortBy].toLowerCase() : _[sortBy])
    );

    return sortDirection === SortDirection.DESC ? lodash.reverse(sorted) : sorted;
  }
}

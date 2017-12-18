import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import styled, { css } from 'styled-components';

import {
  INSPECTOR_ANNOTATION_TEXT1,
  INSPECTOR_ANNOTATION_TEXT2,
  INSPECTOR_BG,
  INSPECTOR_BORDER1,
  INSPECTOR_BORDER2,
  INSPECTOR_BUTTON_BG,
  INSPECTOR_INPUT_BG,
  INSPECTOR_SECTION_TITLE_BUTTON,
  INSPECTOR_SECTION_TITLE_BUTTON_OVER,
  INSPECTOR_TAB_BG,
  INSPECTOR_TAB_FG,
  INSPECTOR_TAB_FG_OVER,
  INSPECTOR_TEXT,
  TAG_BG,
  TAG_BG_OVER,
  TAG_FG,
  TAG_FG_OVER,
  TAG_HEIGHT,
  TAG_ICON_FG,
  TAG_ICON_FG_OVER
} from './constants';
import { ANNOTATION_MEASURE_LINEAR, ANNOTATION_POINT_OF_INTEREST, ANNOTATION_RECTANGULAR } from '../data/constants';

const MARGIN = 10;
const WIDTH = 250;
const INPUT_HEIGHT = 25;
const VIEW_ANNOTATION_EDITOR = 'VIEW_ANNOTATION_EDITOR';
const VIEW_PICK_A_TAG = 'VIEW_PICK_A_TAG';

// STYLED COMPONENTS

const _Root = styled.div`
  background-color: ${INSPECTOR_TAB_BG};
  height: 100%;
  overflow: scroll;
  width: ${WIDTH}px;
`;

const _SectionTitle = styled.div`
  color: ${INSPECTOR_TEXT};
  font-size: 150%;
  margin: ${MARGIN}px 0;
  text-align: center;
  width: 100%;
`;

const _Button = styled.button`
  background-color: ${INSPECTOR_BG};
  border: none;
  color: ${INSPECTOR_ANNOTATION_TEXT1};
  font-size: 1em;
  margin: ${MARGIN / 2}px;
  text-align: center;
  width: 100px;

  &:hover {
    background-color: ${INSPECTOR_BUTTON_BG};
  }
`;

const _Value = styled.div`
  color: ${INSPECTOR_TEXT};
  text-align: center;
  width: 100%;
`;

const _Form = styled.div`
  height: ${INPUT_HEIGHT}px;
  margin: 0;
  padding: ${MARGIN}px;
`;

const _InputTitle = styled.div`
  color: ${INSPECTOR_TEXT};
`;

const _Input = styled.input`
  background-color: ${INSPECTOR_INPUT_BG};
  border: none;
  box-sizing: border-box;
  color: ${INSPECTOR_ANNOTATION_TEXT1};
  height: ${INPUT_HEIGHT}px;
  display: block;
  font-size: 1em;
  margin: 0 0 ${MARGIN}px 0;
  padding: 5px;
  width: 100%;
`;

const _Textarea = styled.textarea`
  background-color: ${INSPECTOR_INPUT_BG};
  border: none;
  box-sizing: border-box;
  color: ${INSPECTOR_ANNOTATION_TEXT1};
  font-size: 1em;
  height: ${15 * INPUT_HEIGHT}px;
  margin: 0;
  padding: 5px;
  resize: none;
  width: 100%;
`;

const _TagButton = styled.i`
  color: ${INSPECTOR_SECTION_TITLE_BUTTON};
  font-style: normal;

  &:hover {
    color: ${INSPECTOR_SECTION_TITLE_BUTTON_OVER};
  }
`;

const _Header = styled.div`
  color: ${INSPECTOR_TEXT};
  display: flex;
  height: 40px;
  justify-content: space-between;
  padding: 0 10px;
  width: 100%;

  > span {
    display: block;
    font-size: 1.25em;
    margin: auto 0;
    text-transform: uppercase;
  }

  > i {
    display: block;
    font-size: 150%;
    margin: auto 0;
  }
`;

const _PickATag = styled.div`
  height: 100%;
  overflow: scroll;
  width: 100%;
`;

const _Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
  padding: 3px;
`;

const _Tag = styled.div`
  background: ${TAG_BG};
  border-radius: 2px;
  color: ${TAG_FG};
  height: ${TAG_HEIGHT}px;
  margin: 2px;

  > div {
    border-radius: 2px;
    display: inline-block;
    height: ${TAG_HEIGHT}px;
    padding: 2px;
  }

  > div.available:hover {
    background-color: ${TAG_BG_OVER};
    color: ${TAG_FG_OVER};
  }

  > i {
    color: ${TAG_ICON_FG};
    padding: 0 5px;

    &:hover {
      color: ${TAG_ICON_FG_OVER};
    }
  }
`;

// THE COMPONENT

export default class extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedTag: null,
      title: this.props.annotation.title,
      targetType: this.props.annotation.targetType || '',
      text: this.props.annotation.text,
      view: VIEW_ANNOTATION_EDITOR
    };
  }

  backToAnnotationEditor = () => {
    this.setState({ view: VIEW_ANNOTATION_EDITOR });
  };

  handleClickOnTag = e => {
    this.props.tagAnnotation(e.target.getAttribute('tagname'));
    this.setState({ view: VIEW_ANNOTATION_EDITOR });
  };

  cancel = e => {
    this.props.cancel();
  };

  handleUnTagAnnotation = e => {
    this.props.untagAnnotation(e.target.getAttribute('tagname'));
  };

  render() {
    switch (this.state.view) {
      case VIEW_PICK_A_TAG:
        return (
          <_Root>
            <_PickATag>
              <_Header>
                <span>Pick a tag</span>
                <_TagButton className="fa fa-times" aria-hidden="true" onClick={this.backToAnnotationEditor} />
              </_Header>
              <_Tags>
                {this.props.allTags.map(_ => {
                  return (
                    <_Tag key={`tag_${_.name}`}>
                      <div className="available" tagname={_.name} onClick={this.handleClickOnTag}>
                        {_.name}
                      </div>
                    </_Tag>
                  );
                })}
              </_Tags>
            </_PickATag>
          </_Root>
        );
      default:
        return (
          <_Root>
            <_Header>
              <span />
              <_TagButton className="fa fa-times" aria-hidden="true" onClick={this.cancel} />
            </_Header>
            <_SectionTitle>
              TAGS&nbsp;&nbsp;<_TagButton
                onClick={e => {
                  this.setState({ view: VIEW_PICK_A_TAG });
                }}
              >
                +TAG
              </_TagButton>
            </_SectionTitle>
            <_Tags>
              {this.props.tags &&
                this.props.tags.map(_ => {
                  return (
                    <_Tag key={`tag_${_}`}>
                      <div>{_}</div>
                      <i
                        className="fa fa-trash fa"
                        aria-hidden="true"
                        tagname={_}
                        onClick={this.handleUnTagAnnotation}
                      />
                    </_Tag>
                  );
                })}
            </_Tags>
            <_SectionTitle>
              METADATA&nbsp;&nbsp;<_TagButton
                onClick={e => {
                  this.props.save(this.state.title, this.state.targetType, this.state.text);
                }}
              >
                SAVE
              </_TagButton>
            </_SectionTitle>
            {ANNOTATION_MEASURE_LINEAR === this.props.annotation.annotationType && (
              <_Value>{this.props.annotation.value_in_mm.toFixed(2)}mm</_Value>
            )}
            <_Form>
              <_InputTitle>TITLE</_InputTitle>
              <_Input
                type="text"
                value={this.state.title}
                onChange={e =>
                  this.setState({
                    title: e.target.value
                  })
                }
              />

              <_InputTitle>TARGET TYPE</_InputTitle>
              <_Input
                type="text"
                value={this.state.targetType}
                onChange={e =>
                  this.setState({
                    targetType: e.target.value
                  })
                }
              />

              <_InputTitle>TEXT</_InputTitle>
              <_Textarea onChange={e => this.setState({ text: e.target.value })} value={this.state.text} />
            </_Form>
          </_Root>
        );
    }
  }
}

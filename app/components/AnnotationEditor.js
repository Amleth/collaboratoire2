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
  INSPECTOR_TAB_BG,
  INSPECTOR_TAB_FG,
  INSPECTOR_TEXT
} from './constants';
import { ANNOTATION_MEASURE_LINEAR, ANNOTATION_POINT_OF_INTEREST, ANNOTATION_RECTANGULAR } from '../data/constants';

const MARGIN = 10;
const WIDTH = 250;
const INPUT_HEIGHT = 25;

// STYLED COMPONENTS

const _Root = styled.div`
  background-color: ${INSPECTOR_TAB_BG};
  color: purple;
  height: 100%;
  overflow: scroll;
  width: ${WIDTH}px;
`;

const _Buttons = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: ${MARGIN}px;
  width: ${WIDTH}px;
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

const _InputTitle = styled.div`color: ${INSPECTOR_TEXT};`;

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

// THE COMPONENT

export default class extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: this.props.annotation.title,
      targetType: this.props.annotation.targetType || '',
      text: this.props.annotation.text
    };
  }

  render() {
    return (
      <_Root>
        <_Buttons>
          <_Button type="button" onClick={e => this.props.cancel()}>
            CANCEL
          </_Button>
          <_Button
            type="button"
            onClick={e => {
              this.props.save(this.state.title, this.state.targetType, this.state.text);
            }}
          >
            SAVE
          </_Button>
        </_Buttons>
        {ANNOTATION_MEASURE_LINEAR === this.props.annotation.annotationType && (
          <_Value>{this.props.annotation.value_in_mm.toFixed(2)}mm</_Value>
        )}
        <_Form>
          <_InputTitle>TITLE</_InputTitle>
          <_Input type="text" value={this.state.title} onChange={e => this.setState({ title: e.target.value })} />

          <_InputTitle>TARGET TYPE</_InputTitle>
          <_Input
            type="text"
            value={this.state.targetType}
            onChange={e => this.setState({ targetType: e.target.value })}
          />

          <_InputTitle>TEXT</_InputTitle>
          <_Textarea onChange={e => this.setState({ text: e.target.value })} value={this.state.text} />
        </_Form>
      </_Root>
    );
  }
}

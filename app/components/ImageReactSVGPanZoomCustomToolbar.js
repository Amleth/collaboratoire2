import React, { Component } from 'react';
import Toolbar from 'react-svg-pan-zoom/build-commonjs/ui-toolbar/toolbar';
import styled from 'styled-components';

let resetZoomLevel;
export const setResetZoomLevel = _ => (resetZoomLevel = _);

const _Root = styled.div``;

const _ToolButton = styled.button`
  background-color: rgba(19, 20, 22, 0.9);
  border: none;
  border-radius: 2px;
  color: rgb(238, 248, 255);
  height: 28px;
  position: absolute;
  right: 5px;
  top: 144px;
  transition: color 200ms ease;
  width: 30px;

  &:hover {
    color: rgb(28, 166, 252);
  }
`;

export default class extends Component {
  render() {
    const { tool, value, onChangeValue, onChangeTool, position } = this.props;

    return (
      <_Root>
        <_ToolButton
          onClick={e => {
            resetZoomLevel();
          }}
        >
          1:1
        </_ToolButton>
        <Toolbar
          tool={tool}
          value={value}
          onChangeValue={onChangeValue}
          onChangeTool={onChangeTool}
          position={position}
        />
      </_Root>
    );
  }
}

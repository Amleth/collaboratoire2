import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { ReactSVGPanZoom } from 'react-svg-pan-zoom';
import { AutoSizer } from 'react-virtualized';
import styled, { css } from 'styled-components';

// CONSTANTS

const PICTURES_NUMBER_LIMIT = 200;

// STYLED COMPONENTS

const _Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  svg > g > rect {
    fill: black !important;
  }
`;

const _Message = styled.div`
  font-size: 200%;
  height: 100%;
  padding: 100px;
  text-align: center;
  width: 100%;
`;

// THE COMPONENT

const HW = 10;

export default class extends Component {
  constructor(props) {
    super(props);

    this.Viewer = null;
    this.positions = {};
    this.isDragging = false;
    this.selectedElement = null;
    this.props.picturesSelection.map(p => (this.positions[p] = { x: Math.random() * 9000, y: Math.random() * 9000 }));

    this.state = { draggedElementX: null, draggedElementY: null };

    setTimeout(() => this.Viewer.fitToViewer(), 1000);
  }

  render() {
    if (process.env.NODE_ENV !== 'development' && this.props.picturesSelection.length > PICTURES_NUMBER_LIMIT)
      return <_Message>No more than {PICTURES_NUMBER_LIMIT} pictures may be displayed</_Message>;

    return (
      <_Root>
        <div style={{ flex: '1 1 auto' }}>
          <AutoSizer>
            {({ width, height }) => (
              <ReactSVGPanZoom
                background={'white'}
                ref={_ => (this.Viewer = _)}
                width={width}
                height={height}
                onMouseMove={this.handleMouseMove}
              >
                <svg height={10000} width={10000}>
                  {this.props.picturesSelection.map(p => {
                    return (
                      <image
                        onMouseDown={e => this.handleMouseDownOnElement(e, p)}
                        onMouseUp={e => this.handleMouseUpOnElement(e, p)}
                        height={256}
                        href={
                          p === this.selectedElement ? this.props.pictures[p].file : this.props.pictures[p].thumbnail
                        }
                        key={`freespaceelement_${p}`}
                        x={
                          p === this.selectedElement && this.state.draggedElementX
                            ? this.state.draggedElementX - 25
                            : this.positions[p].x
                        }
                        y={
                          p === this.selectedElement && this.state.draggedElementY
                            ? this.state.draggedElementY - 25
                            : this.positions[p].y
                        }
                      />
                    );
                  })}
                </svg>
              </ReactSVGPanZoom>
            )}
          </AutoSizer>
        </div>
      </_Root>
    );
  }

  handleMouseMove = e => {
    if (!this.isDragging) return;
    this.setState({ draggedElementX: e.x, draggedElementY: e.y });
    this.print();
  };

  handleMouseDownOnElement = (e, picture) => {
    this.selectedElement = picture;
    this.isDragging = true;
    this.print();
  };

  handleMouseUpOnElement = (e, picture) => {
    this.isDragging = false;
    if (this.state.draggedElementX) this.positions[picture].x = this.state.draggedElementX - 25;
    if (this.state.draggedElementY) this.positions[picture].y = this.state.draggedElementY - 25;
    this.setState({ draggedElementX: null, draggedElementY: null });
    this.print();
  };

  print = () => {
    console.log(this.state, this.isDragging);
  };
}

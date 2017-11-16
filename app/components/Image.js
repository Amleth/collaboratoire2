import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { ReactSVGPanZoom } from 'react-svg-pan-zoom';
import { AutoSizer } from 'react-virtualized';
import styled, { css } from 'styled-components';

import { NAV_SIZE, SECTION_BG, SECTION_BG2, SECTION_BG2_OVER, SECTION_FG, SELECTED, SVGPANZOOM_BG } from './constants';
import { ANNOTATION_MEASURE_LINEAR, ANNOTATION_POINT_OF_INTEREST, ANNOTATION_RECTANGULAR } from '../data/constants';
import { getCartesianDistanceInMm, getTopLeftAndBottomRightPointsFromTwoClicks, pixelsToMm } from '../utils/maths';
import Inspector from '../Containers/Inspector';

//
// STYLE
//

const HEADER_HEIGHT = 35;
const ANNOTATION_TEXT_HEIGHT = 55;

const ANNOTATION_MEASURE_LINEAR_COLOUR = 'rgb(255,0,255)';
const ANNOTATION_POINT_OF_INTEREST_COLOUR = 'rgb(255,0,127)';
const ANNOTATION_RECTANGLE_COLOUR = 'rgb(0,255,255)';

const _Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

const _PictureWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
`;

const _Header = styled.div`
  background-color: ${SECTION_BG};
  color: ${SECTION_FG};
  display: flex;
  font-size: 150%;
  height: ${HEADER_HEIGHT}px;
  justify-content: space-between;
  width: 100%;
`;

const _PicturesBrowsingWrapper = styled.div`display: flex;`;

const _ImageBrowsingButton = styled.span`
  background-color: ${SECTION_BG2};
  color: ${SECTION_FG};
  padding: 0 20px;
  transition: background-color 500ms ease;

  &:hover {
    background-color: ${SECTION_BG2_OVER};
    transition: background-color 250ms ease;
  }
`;

const _CurrentPicture = styled.span`margin: 0 10px;`;

const _SelectedAnnotationTool = styled.span`color: ${SELECTED};`;

const _AnnotationButtons = styled.div`
  display: flex;
  height: ${HEADER_HEIGHT}px;
  line-height: ${HEADER_HEIGHT}px;
`;

const _AnnotationToolButton = styled.div`
  border-radius: 2px;
  color: white;
  height: ${HEADER_HEIGHT - 6}px;
  line-height: ${HEADER_HEIGHT - 6}px;
  margin: 3px;
  text-align: center;
  transition: background-color 500ms ease;
  width: ${HEADER_HEIGHT - 6}px;

  &:hover {
    background-color: ${SELECTED};
    transition: background-color 250ms ease;
  }

  ${props => props.selected && css`background-color: ${SELECTED};`};
`;

const _LeftColumn = styled.div`width: ${NAV_SIZE};`;

const _Hud = styled.div`
  color: black;
  font-family: monospace;
  padding: 5px;
  text-align: center;
  width: 100%;
`;

const STYLE_pending_linear_measure = {
  stroke: ANNOTATION_MEASURE_LINEAR_COLOUR,
  strokeOpacity: 0.5,
  strokeWidth: 3
};

const STYLE_linear_measure = {
  stroke: ANNOTATION_MEASURE_LINEAR_COLOUR,
  strokeOpacity: 0.5,
  strokeWidth: 3
};

const STYLE_linear_measure_focused = {
  stroke: ANNOTATION_MEASURE_LINEAR_COLOUR,
  strokeOpacity: 0.5,
  strokeWidth: 30
};

const STYLE_annotation_point_of_interest = {
  fill: ANNOTATION_POINT_OF_INTEREST_COLOUR,
  fillOpacity: 0.5,
  r: 10
};

const STYLE_annotation_point_of_interest_focused = {
  ...STYLE_annotation_point_of_interest,
  fillOpacity: 0.5,
  r: 50
};

const STYLE_annotation_point_of_interest_text = {
  fill: ANNOTATION_POINT_OF_INTEREST_COLOUR
};

const STYLE_pending_annotation_rectangle = {
  fill: 'transparent',
  stroke: ANNOTATION_RECTANGLE_COLOUR,
  strokeWidth: 5,
  strokeOpacity: 0.8
};

const STYLE_annotation_rectangle = {
  fill: 'transparent',
  stroke: ANNOTATION_RECTANGLE_COLOUR,
  strokeWidth: 5,
  strokeOpacity: 0.8
};

const STYLE_annotation_rectangle_focused = {
  fill: ANNOTATION_RECTANGLE_COLOUR,
  fillOpacity: 0.2,
  stroke: ANNOTATION_RECTANGLE_COLOUR,
  strokeWidth: 5,
  strokeOpacity: 0.8
};

const STYLE_annotation_rectangle_text = {
  fill: ANNOTATION_RECTANGLE_COLOUR
};

//
// GENERAL STATE
//

let annotationMeasureLinearFirstClickedPoint = null;
let annotationRectangleFirstClickedPoint = null;

//
// COMPONENT
//

class Image extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.Viewer = null;
    this.pendingAnnotationMeasureLinear = null;
    this.pendingAnnotationRectangle = null;
    this.svgImage = null;

    this.state = {
      currentAnnotationTool: null,
      currentPicture: this.props.pictures[this.props.picturesSelection[this.props.currentPictureIndexInSelection]],
      hudContent: null,
      pendingAnnotationMeasureLinearX1: 0,
      pendingAnnotationMeasureLinearY1: 0,
      pendingAnnotationMeasureLinearX2: 0,
      pendingAnnotationMeasureLinearY2: 0,
      pendingAnnotationRectangleX: 0,
      pendingAnnotationRectangleY: 0,
      pendingAnnotationRectangleHeight: 0,
      pendingAnnotationRectangleWidth: 0
    };

    this.click_reactsvgpanzoom = this.click_reactsvgpanzoom.bind(this);
    this.mouseMove_reactsvgpanzoom = this.mouseMove_reactsvgpanzoom.bind(this);
    this.click_annotation = this.click_annotation.bind(this);

    this.mouseMove_reactsvgpanzoom = this.mouseMove_reactsvgpanzoom.bind(this);
    this.completeAnnotationMeasureLinear = this.completeAnnotationMeasureLinear.bind(this);
    this.makeAnnotationPointOfInterest = this.makeAnnotationPointOfInterest.bind(this);
    this.completeAnnotationRectangular = this.completeAnnotationRectangular.bind(this);
  }

  componentDidMount() {
    if (this.svgImage) this.svgImage.addEventListener('load', e => this.Viewer.fitToViewer());
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      currentPicture: nextProps.pictures[nextProps.picturesSelection[nextProps.currentPictureIndexInSelection]]
    });
  }

  render() {
    if (!this.state.currentPicture) return null;

    return (
      <_Root>
        <_Header>
          <_PicturesBrowsingWrapper>
            <_ImageBrowsingButton onClick={e => this.props.previousPictureInSelection()}>
              <i className="fa fa-caret-left fa" aria-hidden="true" />
            </_ImageBrowsingButton>
            <_CurrentPicture>
              {`Picture n° ${this.props.currentPictureIndexInSelection + 1}/${this.props.picturesSelection
                .length} in current selection`}
            </_CurrentPicture>
            <_ImageBrowsingButton onClick={e => this.props.nextPictureInSelection()}>
              <i className="fa fa-caret-right fa" aria-hidden="true" />
            </_ImageBrowsingButton>
          </_PicturesBrowsingWrapper>
          <_SelectedAnnotationTool>
            {this.state.currentAnnotationTool
              ? `Selected annotation tool: ${this.state.currentAnnotationTool.toUpperCase()}`
              : 'No annotation tool selected'}
          </_SelectedAnnotationTool>
          <_AnnotationButtons>
            <_AnnotationToolButton
              selected={ANNOTATION_MEASURE_LINEAR === this.state.currentAnnotationTool}
              onClick={e => this.setAnnotationTool(ANNOTATION_MEASURE_LINEAR)}
            >
              📏
            </_AnnotationToolButton>
            <_AnnotationToolButton
              selected={ANNOTATION_POINT_OF_INTEREST === this.state.currentAnnotationTool}
              onClick={e => this.setAnnotationTool(ANNOTATION_POINT_OF_INTEREST)}
            >
              ★
            </_AnnotationToolButton>
            <_AnnotationToolButton
              selected={ANNOTATION_RECTANGULAR === this.state.currentAnnotationTool}
              onClick={e => this.setAnnotationTool(ANNOTATION_RECTANGULAR)}
            >
              🄰
            </_AnnotationToolButton>
          </_AnnotationButtons>
        </_Header>
        <_PictureWrapper>
          <_LeftColumn>
            {this.state.hudContent && <_Hud>{this.state.hudContent}</_Hud>}
            <Inspector
              annotationsMeasuresLinear={this.props.annotationsMeasuresLinear[this.state.currentPicture.id]}
              annotationsPointsOfInterest={this.props.annotationsPointsOfInterest[this.state.currentPicture.id]}
              annotationsRectangular={this.props.annotationsRectangular[this.state.currentPicture.id]}
              deleteAnnotationMeasureLinear={this.props.deleteAnnotationMeasureLinear}
              deleteAnnotationPointOfInterest={this.props.deleteAnnotationPointOfInterest}
              deleteAnnotationRectangular={this.props.deleteAnnotationRectangular}
              picture={this.state.currentPicture}
              tags={this.props.tagsByPicture[this.state.currentPicture.id]}
            />
          </_LeftColumn>
          <div style={{ flex: '1 1 auto' }}>
            <AutoSizer>
              {({ width, height }) => (
                <ReactSVGPanZoom
                  background={SVGPANZOOM_BG}
                  ref={_ => (this.Viewer = _)}
                  width={width}
                  height={height}
                  onClick={this.click_reactsvgpanzoom}
                  onMouseMove={this.mouseMove_reactsvgpanzoom}
                >
                  <svg width={this.state.currentPicture.width} height={this.state.currentPicture.height}>
                    <g>
                      <image ref={_ => (this.svgImage = _)} href={this.state.currentPicture.file} />
                      <line
                        ref={_ => (this.pendingAnnotationMeasureLinear = _)}
                        style={STYLE_pending_linear_measure}
                        x1={this.state.pendingAnnotationMeasureLinearX1}
                        y1={this.state.pendingAnnotationMeasureLinearY1}
                        x2={this.state.pendingAnnotationMeasureLinearX2}
                        y2={this.state.pendingAnnotationMeasureLinearY2}
                      />
                      <rect
                        ref={_ => (this.pendingAnnotationRectangle = _)}
                        style={STYLE_pending_annotation_rectangle}
                        x={this.state.pendingAnnotationRectangleX}
                        y={this.state.pendingAnnotationRectangleY}
                        height={this.state.pendingAnnotationRectangleHeight}
                        width={this.state.pendingAnnotationRectangleWidth}
                      />
                      {this.props.annotationsMeasuresLinear[this.state.currentPicture.id] &&
                        this.props.annotationsMeasuresLinear[this.state.currentPicture.id].map(_ => {
                          const FOCUSED =
                            this.props.focusedAnnotation && this.props.focusedAnnotation.annotationId === _.id;
                          return (
                            <line
                              key={_.id}
                              x1={_.x1}
                              y1={_.y1}
                              x2={_.x2}
                              y2={_.y2}
                              style={FOCUSED ? STYLE_linear_measure_focused : STYLE_linear_measure}
                              onClick={e => this.click_annotation()}
                            />
                          );
                        })}
                      {this.props.annotationsPointsOfInterest[this.state.currentPicture.id] &&
                        this.props.annotationsPointsOfInterest[this.state.currentPicture.id].map(_ => {
                          const FOCUSED =
                            this.props.focusedAnnotation && this.props.focusedAnnotation.annotationId === _.id;
                          return (
                            <g key={`${_.id}_g`}>
                              <text
                                key={`${_.id}_title`}
                                x={_.x}
                                y={_.y - ANNOTATION_TEXT_HEIGHT * 0.3}
                                fontSize={ANNOTATION_TEXT_HEIGHT}
                                textAnchor="middle"
                                style={STYLE_annotation_point_of_interest_text}
                              >
                                {_.title}
                              </text>
                              <circle
                                key={_.id}
                                style={
                                  FOCUSED
                                    ? STYLE_annotation_point_of_interest_focused
                                    : STYLE_annotation_point_of_interest
                                }
                                cx={_.x}
                                cy={_.y}
                              />
                            </g>
                          );
                        })}
                      {this.props.annotationsRectangular[this.state.currentPicture.id] &&
                        this.props.annotationsRectangular[this.state.currentPicture.id].map(_ => {
                          const FOCUSED =
                            this.props.focusedAnnotation && this.props.focusedAnnotation.annotationId === _.id;
                          return (
                            <g key={`${_.id}_g`}>
                              <text
                                key={`${_.id}_title`}
                                x={_.x + ANNOTATION_TEXT_HEIGHT * 0.2}
                                y={_.y + ANNOTATION_TEXT_HEIGHT}
                                fontSize={ANNOTATION_TEXT_HEIGHT}
                                style={STYLE_annotation_rectangle_text}
                              >
                                {_.title}
                              </text>
                              <rect
                                key={_.id}
                                style={FOCUSED ? STYLE_annotation_rectangle_focused : STYLE_annotation_rectangle}
                                x={_.x}
                                y={_.y}
                                height={_.height}
                                width={_.width}
                              />
                            </g>
                          );
                        })}
                    </g>
                  </svg>
                </ReactSVGPanZoom>
              )}
            </AutoSizer>
          </div>
        </_PictureWrapper>
      </_Root>
    );
  }

  // GESTURE HANDLERS

  click_reactsvgpanzoom(evt) {
    const { x, y } = evt;

    switch (this.state.currentAnnotationTool) {
      case ANNOTATION_MEASURE_LINEAR:
        if (annotationMeasureLinearFirstClickedPoint === null) {
          annotationMeasureLinearFirstClickedPoint = { x, y };
          this.setState({
            pendingAnnotationMeasureLinearX1: x,
            pendingAnnotationMeasureLinearY1: y,
            pendingAnnotationMeasureLinearX2: x,
            pendingAnnotationMeasureLinearY2: y
          });
        } else {
          this.completeAnnotationMeasureLinear(x, y);
        }
        break;
      case ANNOTATION_POINT_OF_INTEREST:
        this.makeAnnotationPointOfInterest(x, y);
        break;
      case ANNOTATION_RECTANGULAR:
        if (annotationRectangleFirstClickedPoint === null) {
          annotationRectangleFirstClickedPoint = { x, y };
          this.setState({
            pendingAnnotationRectangleX: x,
            pendingAnnotationRectangleY: y,
            pendingAnnotationRectangleHeight: 1,
            pendingAnnotationRectangleWidth: 1
          });
        } else {
          this.completeAnnotationRectangular(x, y);
        }
        break;
    }
  }

  mouseMove_reactsvgpanzoom(evt) {
    const { x, y } = evt;

    switch (this.state.currentAnnotationTool) {
      case ANNOTATION_MEASURE_LINEAR:
        if (annotationMeasureLinearFirstClickedPoint !== null) {
          this.setState({
            pendingAnnotationMeasureLinearX2: x,
            pendingAnnotationMeasureLinearY2: y
          });
          const mm = getCartesianDistanceInMm(
            annotationMeasureLinearFirstClickedPoint.x,
            annotationMeasureLinearFirstClickedPoint.y,
            x,
            y,
            this.state.currentPicture.dpix,
            this.state.currentPicture.dpiy
          ).toFixed(2);
          this.setState({
            hudContent: `${mm}mm @(${this.state.currentPicture.dpix},${this.state.currentPicture.dpiy})DPI`
          });
        }
        break;
      case ANNOTATION_RECTANGULAR:
        if (annotationRectangleFirstClickedPoint !== null) {
          const width = x - annotationRectangleFirstClickedPoint.x;
          const height = y - annotationRectangleFirstClickedPoint.y;
          this.setState({
            pendingAnnotationRectangleHeight: height,
            pendingAnnotationRectangleWidth: width
          });
          this.setState({
            hudContent: `${pixelsToMm(width, this.state.currentPicture.dpix).toFixed(2)}mm 
            x
            ${pixelsToMm(height, this.state.currentPicture.dpiy).toFixed(2)}mm 
            @(${this.state.currentPicture.dpix},${this.state.currentPicture.dpiy})DPI`
          });
        }
        break;
    }
  }

  click_annotation() {}

  setAnnotationTool(tool) {
    const newTool = tool === this.state.currentAnnotationTool ? null : tool;
    const resetHudContent = !newTool || tool !== this.state.currentAnnotationTool;
    this.setState({
      currentAnnotationTool: newTool
    });
    if (resetHudContent) this.setState({ hudContent: null });

    annotationMeasureLinearFirstClickedPoint = null;
    annotationRectangleFirstClickedPoint = null;

    this.setState({
      pendingAnnotationMeasureLinearX1: 0,
      pendingAnnotationMeasureLinearY1: 0,
      pendingAnnotationMeasureLinearX2: 0,
      pendingAnnotationMeasureLinearY2: 0,
      pendingAnnotationRectangleX: 0,
      pendingAnnotationRectangleY: 0,
      pendingAnnotationRectangleHeight: 0,
      pendingAnnotationRectangleWidth: 0
    });
  }

  // BUSINESS LOGIC

  completeAnnotationMeasureLinear(secondClickedPointX, secondClickedPointY) {
    const x1 = annotationMeasureLinearFirstClickedPoint.x;
    const y1 = annotationMeasureLinearFirstClickedPoint.y;
    annotationMeasureLinearFirstClickedPoint = null;
    const mm = getCartesianDistanceInMm(
      x1,
      y1,
      secondClickedPointX,
      secondClickedPointY,
      this.state.currentPicture.dpix,
      this.state.currentPicture.dpiy
    );
    this.props.createAnnotationMeasureLinear(
      this.state.currentPicture.id,
      x1,
      y1,
      secondClickedPointX,
      secondClickedPointY,
      mm
    );
  }

  makeAnnotationPointOfInterest(x, y) {
    this.props.createAnnotationPointOfInterest(this.state.currentPicture.id, x, y);
  }

  completeAnnotationRectangular(secondClickedPointX, secondClickedPointY) {
    const { x, y } = annotationRectangleFirstClickedPoint;
    const width = secondClickedPointX - x;
    const height = secondClickedPointY - y;
    annotationRectangleFirstClickedPoint = null;
    this.props.createAnnotationRectangular(this.state.currentPicture.id, x, y, width, height);
  }
}

export default Image;

import { remote, shell } from 'electron';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import styled, { css } from 'styled-components';

import { average, standardDeviation } from '../utils/maths';

import {
  TAG_HEIGHT,
  INSPECTOR_ANNOTATION_TEXT1,
  INSPECTOR_ANNOTATION_TEXT2,
  INSPECTOR_BG,
  INSPECTOR_BORDER1,
  INSPECTOR_BORDER2,
  INSPECTOR_METADATA_TITLE,
  INSPECTOR_TAB_BG,
  INSPECTOR_TAB_BG_SELECTED,
  INSPECTOR_TAB_BG_OVER,
  INSPECTOR_TAB_FG,
  INSPECTOR_TAB_FG_SELECTED,
  INSPECTOR_TAB_FG_OVER,
  INSPECTOR_TEXT,
  TAG_BG,
  TAG_BG_OVER,
  TAG_FG,
  TAG_FG_OVER
} from './constants';
import AnnotationEditor from '../containers/AnnotationEditor';
import { ANNOTATION_MEASURE_LINEAR, ANNOTATION_POINT_OF_INTEREST, ANNOTATION_RECTANGULAR } from '../data/constants';
import { METADATA_TITLES, METADATA_DETERMINATIONS_TITLES } from '../system/erecolnat-metadata';

// STATE CONSTANTS

const TAB_METADATA = 0;
const TAB_ANNOTATIONS = 1;

// STYLE CONSTANTS

export const WIDTH = 250;
export const MARGIN = 10;
const TAB_HEIGHT = 45;
const SUB_TAB_HEIGHT = 30;

// STYLED COMPONENTS

const _Root = styled.div`
  background-color: ${INSPECTOR_BG};
  height: 100%;
  overflow: scroll;
  width: ${WIDTH}px;
`;
const _Tabs = styled.div`
  display: flex;
  flex-direction: row;
  min-height: ${TAB_HEIGHT}px;
  width: 100%;
`;
const _Tab = styled.div`
  background-color: ${INSPECTOR_TAB_BG};
  color: ${INSPECTOR_TAB_FG};
  height: ${TAB_HEIGHT}px;
  padding: 10px 5px 5px 5px;
  text-align: center;
  width: 100%;

  &:hover {
    color: ${INSPECTOR_TAB_FG_OVER};
  }

  ${props =>
    props.selected &&
    css`
      background-color: ${INSPECTOR_TAB_BG_SELECTED};
      color: ${INSPECTOR_TAB_FG_SELECTED};
      &:hover {
        backtround-color: color: ${INSPECTOR_TAB_BG_SELECTED};
      }
    `};
`;
const _MetadataSubpanel = styled.div`
  width: 100%;
`;

const _MetadataList = styled.div`
  padding: ${MARGIN}px;
`;
const _Metadata = styled.div``;
const _MetadataTitle = styled.div`
  color: ${INSPECTOR_METADATA_TITLE};
`;
const _MedatataValue = styled.div`
  color: ${INSPECTOR_TEXT};
  width: 100%;
  word-break: break-all;
`;
const _MetadataDeterminationsList = styled.ul`
  list-style-type: circle;
  margin: 0 0 0 20px;
  padding: 0;
`;
const _MetadataDetermination = styled.li``;

const _LinksList = styled.div`
  border-bottom: 1px solid ${INSPECTOR_METADATA_TITLE};
  border-top: 1px solid ${INSPECTOR_METADATA_TITLE};
  color: ${INSPECTOR_METADATA_TITLE};
  margin: 15px 0;
  padding: 5px 0;
`;
const _LinkValue = styled.div`
  a:hover {
    color: ${INSPECTOR_TEXT};
  }
`;

const _SectionTitle = styled.div`
  color: ${INSPECTOR_TEXT};
  font-size: 150%;
  margin: ${MARGIN}px 0;
  text-align: center;
  width: 100%;
`;
const _Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  padding: 5px;
  width: 100%;
`;
const _Tag = styled.div`
  background: ${TAG_BG};
  border-radius: 2px;
  color: ${TAG_FG};
  height: ${TAG_HEIGHT}px;
  margin: 0 2px 2px 0;
  padding: 2px;
`;
const _TagIcon = styled.i`
  color: ${INSPECTOR_ANNOTATION_TEXT2};
  &:hover {
    color: ${INSPECTOR_ANNOTATION_TEXT1};
  }
`;

const _AnnotationsSubPanel = styled.div`
  width: 100%;
`;
const _AnnotationsTypeTabs = styled.div`
  display: flex;
  margin-top: ${MARGIN}px;
  min-height: ${SUB_TAB_HEIGHT}px;
  width: 100%;
`;
const _AnnotationsTypeTab = styled.div`
  background-color: ${INSPECTOR_BG};
  border: 1px solid ${INSPECTOR_BORDER1};
  border-radius: 2px;
  color: ${INSPECTOR_TAB_FG_SELECTED};
  height: ${SUB_TAB_HEIGHT}px;
  margin: 5px 25px;
  padding: 3px 5px 5px 5px;
  text-align: center;
  width: 100%;

  &:hover {
    background-color: 1px solid ${INSPECTOR_TAB_BG_OVER};
  }

  ${props =>
    props.selected &&
    css`
      background-color: ${INSPECTOR_TAB_BG};
    `};
`;
const _AnnotationsList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;
const _Annotation = styled.li`
  border-bottom: 1px dashed ${INSPECTOR_BORDER2};
  margin: 0;
  overflow: hidden;
  padding: 2px 5px;
  transition: background-color 250ms ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transition: background-color 1ms ease;
  }
`;
const _AnnotationProperty = styled.div`
  color: ${INSPECTOR_ANNOTATION_TEXT1};
`;
const _AnnotationDate = styled.div`
  color: ${INSPECTOR_ANNOTATION_TEXT2};
  text-align: right;
`;
const _Annotations = styled.div`
  margin-top: ${MARGIN}px;
`;
const _AnnotationsListStats = styled.div`
  border-bottom: 1px solid ${INSPECTOR_BORDER1};
  border-top: 1px solid ${INSPECTOR_TAB_BG};
  color: ${INSPECTOR_TEXT};
  font-size: 120%;
  text-align: center;
`;
const _AnnotationButton = styled.i`
  color: ${INSPECTOR_ANNOTATION_TEXT2};
  font-style: normal;

  &:hover {
    color: ${INSPECTOR_TAB_FG_OVER};
  }
`;

// THE COMPONENT

export default class extends Component {
  // LIFECYCLE

  constructor(props, context) {
    super(props, context);

    const annotations_measures_linear_values_in_mm = this.props.annotationsMeasuresLinear
      ? this.props.annotationsMeasuresLinear.map(_ => _.value_in_mm)
      : [];

    this.state = {
      annotationsMeasuresLinearAverage: average(annotations_measures_linear_values_in_mm),
      annotationsMeasuresLinearStandardDeviation: standardDeviation(annotations_measures_linear_values_in_mm),
      editedAnnotation: null,
      selectedTab: TAB_METADATA,
      selectedAnnotationType: ANNOTATION_MEASURE_LINEAR
    };

    this.selectAnnotationType = this.selectAnnotationType.bind(this);
    this.selectTab = this.selectTab.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // L'idée est ici de recalculer la moyenne et l'écart-type des mesures
    // linéaires suite à chaque nouvelle mesure faite. L'état est mis à
    // jour en amont de la phase de rendu.

    // Dans le cas où le composant n'a reçu aucune annotation (ancienne ou
    // nouvelle), on ne fait rien.
    if (!nextProps.annotationsMeasuresLinear) return;

    // Si le composant a reçu une nouvelle annotation, on recalcule les stats.
    if (
      !this.props.annotationsMeasuresLinear ||
      nextProps.annotationsMeasuresLinear.length > this.props.annotationsMeasuresLinear.length
    ) {
      const annotations_measures_linear_values_in_mm = nextProps.annotationsMeasuresLinear.map(_ => _.value_in_mm);

      this.setState({
        annotationsMeasuresLinearAverage: average(annotations_measures_linear_values_in_mm),
        annotationsMeasuresLinearStandardDeviation: standardDeviation(annotations_measures_linear_values_in_mm)
      });
    }
  }

  render() {
    let key = 0;

    return this.state.editedAnnotation ? (
      <AnnotationEditor
        annotation={this.state.editedAnnotation}
        cancel={() => this.setState({ editedAnnotation: null })}
        save={(title, targetType, text) => {
          this.props.editAnnotation(
            this.props.picture.sha1,
            this.state.editedAnnotation.annotationType,
            this.state.editedAnnotation.id,
            title,
            targetType,
            text
          );
          this.setState({ editedAnnotation: null });
        }}
      />
    ) : (
      <_Root>
        <_Tabs>
          <_Tab selected={this.state.selectedTab === TAB_METADATA} onClick={e => this.selectTab(TAB_METADATA)}>
            METADATA
          </_Tab>
          <_Tab selected={this.state.selectedTab === TAB_ANNOTATIONS} onClick={e => this.selectTab(TAB_ANNOTATIONS)}>
            ANNOTATIONS
          </_Tab>
        </_Tabs>
        {this.state.selectedTab === TAB_METADATA && (
          <_MetadataSubpanel>
            <_SectionTitle>TAGS</_SectionTitle>
            <_Tags>
              {this.props.tags &&
                this.props.tags.map(_ => (
                  <_Tag key={this.props.picture.sha1 + ':' + _}>
                    {_}&nbsp;<_TagIcon
                      className="fa fa-trash fa"
                      aria-hidden="true"
                      onClick={e => {
                        this.props.untagPicture(this.props.picture.sha1, _);
                      }}
                    />
                  </_Tag>
                ))}
            </_Tags>
            <_SectionTitle>METADATA</_SectionTitle>
            <_MetadataList>
              <_Metadata>
                <_MetadataTitle>File name</_MetadataTitle>
                <_MedatataValue>{this.props.picture.file_basename}</_MedatataValue>
              </_Metadata>
              {this.props.picture.erecolnatMetadata && (
                <_LinksList>
                  <_LinkValue>
                    <a
                      onClick={e =>
                        shell.openExternal(
                          `https://explore.recolnat.org/search/botanique/type=advanced&catalognumber=${
                            this.props.picture.erecolnatMetadata.catalognumber
                          }`
                        )
                      }
                    >
                      <i className="fa fa-link fa" aria-hidden="true" /> explore.recolnat.org
                    </a>
                  </_LinkValue>
                  <_LinkValue>
                    <a
                      onClick={e =>
                        shell.openExternal(
                          `http://lesherbonautes.mnhn.fr/specimens/${
                            this.props.picture.erecolnatMetadata.institutioncode
                          }/${this.props.picture.erecolnatMetadata.collectioncode}/${
                            this.props.picture.erecolnatMetadata.catalognumber
                          }`
                        )
                      }
                    >
                      <i className="fa fa-link fa" aria-hidden="true" /> Les Herbonautes
                    </a>
                  </_LinkValue>
                </_LinksList>
              )}
              {this.props.picture.erecolnatMetadata &&
                Object.keys(METADATA_TITLES).map(_ => {
                  if (_ === 'determinations') {
                  } else {
                    return (
                      <_Metadata key={'erecolnat_metadata' + _}>
                        <_MetadataTitle>{METADATA_TITLES[_]}</_MetadataTitle>
                        <_MedatataValue>{this.props.picture.erecolnatMetadata[_]}</_MedatataValue>
                      </_Metadata>
                    );
                  }
                })}
              {this.props.picture.erecolnatMetadata &&
                this.props.picture.erecolnatMetadata.determinations &&
                this.props.picture.erecolnatMetadata.determinations.length > 0 && (
                  <_Metadata key={'erecolnat_metadata_determinations'}>
                    <div>&nbsp;</div>
                    <_MetadataTitle>{`${METADATA_TITLES.determinations} (${
                      this.props.picture.erecolnatMetadata.determinations.length
                    })`}</_MetadataTitle>
                    <_MetadataDeterminationsList>
                      {this.props.picture.erecolnatMetadata.determinations.map(determination => {
                        return (
                          <_MetadataDetermination key={Math.random()}>
                            {Object.keys(METADATA_DETERMINATIONS_TITLES).map(_ => {
                              return (
                                <_Metadata key={'erecolnat_metadata_determination_' + _}>
                                  <_MetadataTitle>{METADATA_DETERMINATIONS_TITLES[_]}</_MetadataTitle>
                                  <_MedatataValue>{determination[_]}</_MedatataValue>
                                </_Metadata>
                              );
                            })}
                          </_MetadataDetermination>
                        );
                      })}
                    </_MetadataDeterminationsList>
                  </_Metadata>
                )}
            </_MetadataList>
          </_MetadataSubpanel>
        )}
        {this.state.selectedTab === TAB_ANNOTATIONS && (
          <_AnnotationsSubPanel>
            <_AnnotationsTypeTabs>
              <_AnnotationsTypeTab
                selected={ANNOTATION_MEASURE_LINEAR === this.state.selectedAnnotationType}
                onClick={e => this.selectAnnotationType(ANNOTATION_MEASURE_LINEAR)}
              >
                📏
              </_AnnotationsTypeTab>
              <_AnnotationsTypeTab
                selected={ANNOTATION_POINT_OF_INTEREST === this.state.selectedAnnotationType}
                onClick={e => this.selectAnnotationType(ANNOTATION_POINT_OF_INTEREST)}
              >
                ★
              </_AnnotationsTypeTab>
              <_AnnotationsTypeTab
                selected={ANNOTATION_RECTANGULAR === this.state.selectedAnnotationType}
                onClick={e => this.selectAnnotationType(ANNOTATION_RECTANGULAR)}
              >
                🄰
              </_AnnotationsTypeTab>
            </_AnnotationsTypeTabs>
            {ANNOTATION_MEASURE_LINEAR === this.state.selectedAnnotationType && (
              <_Annotations>
                <_AnnotationsListStats>
                  <div>{`${
                    this.props.annotationsMeasuresLinear ? this.props.annotationsMeasuresLinear.length : 0
                  } annotations`}</div>
                  {this.props.annotationsMeasuresLinear && this.props.annotationsMeasuresLinear.length !== 0 ? (
                    <div>{`M=${this.state.annotationsMeasuresLinearAverage.toFixed(2)}mm`}</div>
                  ) : (
                    ''
                  )}
                  {this.props.annotationsMeasuresLinear && this.props.annotationsMeasuresLinear.length !== 0 ? (
                    <div>{`SD=${this.state.annotationsMeasuresLinearStandardDeviation.toFixed(2)}mm`}</div>
                  ) : (
                    ''
                  )}
                </_AnnotationsListStats>
                <_AnnotationsList>
                  {this.props.annotationsMeasuresLinear &&
                    this.props.annotationsMeasuresLinear.map(_ =>
                      this.makeAnnotation(_, key++, this.props.deleteAnnotationMeasureLinear)
                    )}
                </_AnnotationsList>
              </_Annotations>
            )}
            {ANNOTATION_RECTANGULAR === this.state.selectedAnnotationType && (
              <_Annotations>
                <_AnnotationsListStats>
                  <div>{`${
                    this.props.annotationsRectangular ? this.props.annotationsRectangular.length : 0
                  } annotations`}</div>
                </_AnnotationsListStats>
                <_AnnotationsList>
                  {this.props.annotationsRectangular &&
                    this.props.annotationsRectangular.map(_ =>
                      this.makeAnnotation(_, key++, this.props.deleteAnnotationRectangular)
                    )}
                </_AnnotationsList>
              </_Annotations>
            )}
            {ANNOTATION_POINT_OF_INTEREST === this.state.selectedAnnotationType && (
              <_Annotations>
                <_AnnotationsListStats>
                  <div>{`${
                    this.props.annotationsPointsOfInterest ? this.props.annotationsPointsOfInterest.length : 0
                  } annotations`}</div>
                </_AnnotationsListStats>
                <_AnnotationsList>
                  {this.props.annotationsPointsOfInterest &&
                    this.props.annotationsPointsOfInterest.map(_ =>
                      this.makeAnnotation(_, key++, this.props.deleteAnnotationPointOfInterest)
                    )}
                </_AnnotationsList>
              </_Annotations>
            )}
          </_AnnotationsSubPanel>
        )}
      </_Root>
    );
  }

  // RENDERING HELPERS

  makeAnnotation(annotation, key, deleteCallback) {
    return (
      <_Annotation
        key={key}
        onMouseOver={e => this.props.focusAnnotation(annotation.id, annotation.type, this.props.picture.sha1)}
      >
        <_AnnotationProperty>
          {this.props.editAnnotation && (
            <_AnnotationButton
              className="fa fa-pencil "
              aria-hidden="true"
              onClick={e => this.setState({ editedAnnotation: annotation })}
            />
          )}
          &nbsp;
          {annotation.title}
          {annotation.annotationType === ANNOTATION_MEASURE_LINEAR && ` • ${annotation.value_in_mm.toFixed(2)}mm`}
        </_AnnotationProperty>
        <_AnnotationDate>
          {annotation.creationDate.toLocaleString()}
          &nbsp;&nbsp;
          {deleteCallback && (
            <_AnnotationButton
              className="fa fa-trash-o "
              aria-hidden="true"
              onClick={e => deleteCallback(this.props.picture.sha1, annotation.id)}
            />
          )}
        </_AnnotationDate>
      </_Annotation>
    );
  }

  // LOGIC

  selectAnnotationType(type) {
    if (type !== this.state.selectedAnnotationType) this.setState({ selectedAnnotationType: type });
  }

  selectTab(tab) {
    if (tab !== this.state.selectedTab) this.setState({ selectedTab: tab });
  }
}

// HELPERS

const formatTwoPoints = points => {
  points = points.map(_ => _.toFixed(2));
  return `(${points[0]}, ${points[1]}) ➛ (${points[2]}, ${points[3]})`;
};

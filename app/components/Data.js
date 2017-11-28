import fs from 'fs';
import lodash from 'lodash';
import path from 'path';
import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { AutoSizer, Grid } from 'react-virtualized';
import styled from 'styled-components';
import XLSX from 'xlsx';

import { findLongestStringInArrayOfArrays, formatDate } from '../utils/js';
import { pixelsToMm } from '../utils/maths';
import { USER_DATA_DIR } from '../index';
import { NAV_SIZE, SECTION_BG, SECTION_FG, SECTION_FG_OVER } from '../components/constants';
import { average, standardDeviation } from '../utils/maths';

//
// STYLING
//

const _Data = styled.div`
  background-color: ${SECTION_BG};
  box-sizing: border-box;
  color: ${SECTION_FG};
  font-size: 150%;
  height: 30px;
  line-height: 30px;
  padding-left: 9px;
  padding-right: ${NAV_SIZE}px;
  width: 100%;
`;

const _ExportIcon = styled.i`
  color: #207245;
  text-align: center;
  transition: color 500ms ease;

  &:hover {
    color: ${SECTION_FG_OVER};
    transition: color 250ms ease;
  }
`;

const _Nothing = styled.div`
  font-size: 200%;
  height: 100%;
  padding: 100px;
  text-align: center;
  width: 100%;
`;

const _GridCell = styled.div``;

const CELL_CHARACTER_WIDTH = 9;

//
// COMPONENT
//

// Columns titles are stored in a const because we want them to be the same in
// the React Table & in the exported CSV or XLS(X) files.
const COLUMN_FILE_NAME = 'File name';
const COLUMN_TARGET_TYPE = 'Target type';
const COLUMN_TITLE = 'Title';
const COLUMN_LENGTH_IN_MM = 'Length (in mm)';
const COLUMN_POSITION_IN_CM = 'Position (in cm)';
const COLUMN_FILE_PATH = 'File path';

const COLUMNS = [
  COLUMN_FILE_NAME,
  COLUMN_TARGET_TYPE,
  COLUMN_TITLE,
  COLUMN_LENGTH_IN_MM,
  COLUMN_POSITION_IN_CM,
  COLUMN_FILE_PATH
];

/**
 * This is mainly a datagrid of annotations, but some columns reflect pictures properties.
 */
class Data extends PureComponent {
  constructor(props) {
    super(props);

    if (props.annotationsMeasuresLinear.length === 0) return;

    this.gridCellRenderer = this.gridCellRenderer.bind(this);
    this.formatPosition_AnnotationMeasureLinear = this.formatPosition_AnnotationMeasureLinear.bind(this);
    this.exportXlsx = this.exportXlsx.bind(this);
    this.makeGridData_annotationsMeasuresLinear = this.makeGridData_annotationsMeasuresLinear.bind(this);

    const mv_l = props.annotationsMeasuresLinear.map(_ => _.value_in_mm);
    this.state = {
      annotationsMeasuresLinear: this.props.annotationsMeasuresLinear,
      averageForLinearMeasures: average(mv_l),
      gridData: this.makeGridData_annotationsMeasuresLinear(),
      standardDeviationForLinearMeasures: standardDeviation(mv_l)
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      gridData: this.makeGridData_annotationsMeasuresLinear()
    });
  }

  render() {
    if (this.props.annotationsMeasuresLinear.length === 0)
      return (
        <_Nothing>Make at least 1 linear measure on a picture of the current selection to see something here</_Nothing>
      );

    let key = 0;

    return (
      <div style={{ width: '100%', height: '100%' }} className="data">
        <_Data>
          {`LINEAR MEASURES: arithmetic mean = ${this.state.averageForLinearMeasures.toFixed(
            2
          )}mm, standard deviation = ${this.state.standardDeviationForLinearMeasures.toFixed(2)}mm`}
          &nbsp;&nbsp;<_ExportIcon className="fa fa-file-excel-o" aria-hidden="true" onClick={e => this.exportXlsx()} />
        </_Data>
        <AutoSizer style={{ display: 'none !important' }}>
          {({ height, width }) => (
            <Grid
              cellRenderer={this.gridCellRenderer}
              columnCount={COLUMNS.length}
              columnWidth={({ index }) => {
                return CELL_CHARACTER_WIDTH * findLongestStringInArrayOfArrays(this.state.gridData, index);
              }}
              height={height}
              rowCount={this.state.annotationsMeasuresLinear.length}
              rowHeight={25}
              style={{ fontFamily: 'monospace' }}
              width={width}
            />
          )}
        </AutoSizer>
      </div>
    );
  }

  // GRID HELPERS

  gridCellRenderer({ columnIndex, key, rowIndex, style }) {
    let content = this.state.gridData[rowIndex][columnIndex];

    return (
      <_GridCell key={key} style={style}>
        {content}
      </_GridCell>
    );
  }

  makeGridData_annotationsMeasuresLinear() {
    return this.props.annotationsMeasuresLinear.map(annotation => {
      const picture = this.props.pictures[annotation.pictureId];

      // This must follow field order defined in the `COLUMNS` const
      return [
        path.basename(picture.file),
        annotation.targetType,
        annotation.title,
        this.formatValueInMm(annotation.value_in_mm),
        this.formatPosition_AnnotationMeasureLinear(annotation, picture),
        picture.file
      ];
    });
  }

  // BUSINESS LOGIC

  formatValueInMm(_) {
    return typeof _ === 'number' ? _.toFixed(2) : null;
  }

  formatPosition_AnnotationMeasureLinear(annotation, picture) {
    const x1_in_mm = pixelsToMm(annotation.x1, picture.dpix) * 0.01;
    const y1_in_mm = pixelsToMm(annotation.y1, picture.dpiy) * 0.01;
    const x2_in_mm = pixelsToMm(annotation.x2, picture.dpix) * 0.01;
    const y2_in_mm = pixelsToMm(annotation.y2, picture.dpiy) * 0.01;

    const coordinates = [x1_in_mm, y1_in_mm, x2_in_mm, y2_in_mm];
    if (coordinates.map(_ => Infinity === _).indexOf(true) >= 0) return null;
    if (coordinates.map(isNaN).indexOf(true) >= 0) return null;

    return `[${x1_in_mm.toFixed(2)}, ${y1_in_mm.toFixed(2)}] > [${x2_in_mm.toFixed(2)}, ${y2_in_mm.toFixed(2)}]`;
  }

  exportXlsx() {
    const data = this.state.gridData;
    const now = new Date();
    const output_file_name = path.join(USER_DATA_DIR, `${formatDate(now)}.csv`);
    const worksheet = XLSX.utils.aoa_to_sheet([COLUMNS, ...data]);
    const stream = XLSX.stream.to_csv(worksheet);
    stream.pipe(fs.createWriteStream(output_file_name));
  }
}

export default Data;

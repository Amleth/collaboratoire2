import { shell } from 'electron';
import logger from 'electron-logger';
import fs from 'fs-extra';
import path from 'path';
import promiseLimit from 'promise-limit';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import request from 'request';
import progress from 'request-progress';
import styled from 'styled-components';

import {
  DOC_BORDER,
  DOC_LINK_BG,
  DOC_LINK_FG,
  MAIN_NAV_BG,
  MAIN_NAV_FG,
  MAIN_NAV_FG_OVER,
  PROGRESS_DOWNLOADED,
  PROGRESS_JOB_BG,
  PROGRESS_JOB_FG1,
  PROGRESS_JOB_FG2,
  RECOLNAT_CAMILLE_DEGARDIN
} from './constants';
import { USER_DATA_DIR } from '../index';
import { formatDate } from '../utils/js';
import { format } from 'url';

const img_import_from_explore_1 = require('./pictures/explore01.png');
const img_import_from_explore_2 = require('./pictures/explore02.png');
const RECOLNAT_LOGO = require('./pictures/recolnat_logo.png');

const _Root = styled.div`
  height: 100%;
  overflow: scroll;
  width: 100%;

  > * {
    padding: 30px;
  }
`;

const _Title = styled.div`
  background-color: ${RECOLNAT_CAMILLE_DEGARDIN};
  text-align: center;
  text-transform: uppercase;
  width: 100%;

  img {
  }

  h1 {
    color: white;
    font-size: 350%;
    letter-spacing: 0.3em;
  }
`;

const _ImportFromExplore = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  h2 {
    font-size: 200%;
    text-align: center;
    text-transform: uppercase;
    width: 100%;

    a {
      color: ${MAIN_NAV_FG_OVER};

      &:hover {
        text-decoration: underline;
      }
    }
  }

  h3 {
    font-size: 150%;
    text-align: center;
    width: 100%;
  }

  img {
    border: 1px solid ${DOC_BORDER};
    margin: 10px;
    max-height: 333px;
    max-width: 333px;
  }
`;

const _ImportFromExplorePictures = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const _FileOpenLink = styled.span`
  background-color: ${DOC_LINK_BG};
  border-radius: 2px;
  color: ${DOC_LINK_FG};
  padding: 0.2em;

  &:hover {
    background-color: ${DOC_LINK_FG};
    color: ${DOC_LINK_BG};
  }
`;

const _ProgressList = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
  width: 100%;

  > li {
    background-color: ${PROGRESS_JOB_BG};
    margin: 0;
    padding: 0;
    width: 100%;

    div:nth-child(1) {
      background: red;
    }

    div:nth-child(2) {
      background: blue;
      font-family: monospace;
    }

    div:nth-child(3) {
      background: green;
      font-family: monospace;
    }

    div:nth-child(4) {
      background: yellow;
      font-family: monospace;
    }

    div:nth-child(5) {
      background: purple;
    }
  }
`;

export default class extends Component {
  constructor(props) {
    super(props);

    this.state = { selectedExploreJsonFile: null, progress: [] };

    this.downloadFromExplore = this.downloadFromExplore.bind(this);
  }

  downloadFromExplore(selectedExploreJsonFile) {
    if (!fs.existsSync(selectedExploreJsonFile)) return;

    this.setState({ selectedExploreJsonFile });

    const now = formatDate(new Date());
    const DESTINATION_DIR = path.join(USER_DATA_DIR, now);
    fs.ensureDirSync(DESTINATION_DIR);

    const specimens = JSON.parse(fs.readFileSync(selectedExploreJsonFile, 'utf8'));

    console.log(
      `Downloading ${specimens.length} specimens (pictures & metadata) from explore file: ${selectedExploreJsonFile}`
    );

    // Jobs preparation

    const jobsDescriptions = [];

    for (const specimen of specimens.slice(0, 30)) {
      // If the specimen has not exactly one picture, we don't knwo how to deal with it
      if (specimen.m_.length !== 1) continue;

      // Metadata
      const metadata = {};
      metadata.determinations = specimen.d_;
      metadata.basisofrecord = specimen.basisofrecord;
      metadata.catalognumber = specimen.catalognumber;
      metadata.collectioncode = specimen.collectioncode;
      metadata.collectionid = specimen.collectionid;
      metadata.collectionname = specimen.collectionname;
      metadata.dwcaid = specimen.dwcaid;
      metadata.family = specimen.family;
      metadata.genus = specimen.genus;
      metadata.institutioncode = specimen.institutioncode;
      metadata.institutionid = specimen.institutionid;
      metadata.institutionname = specimen.institutionname;
      metadata.modified = specimen.modified;
      metadata.scientificname = specimen.scientificname;
      metadata.specificepithet = specimen.specificepithet;

      // Picture
      const pictureId = specimen.m_[0].id;
      const pictureUrl = specimen.m_[0].identifier;
      const targetMetadataFile = path.join(DESTINATION_DIR, pictureId + '.json');
      const targetPictureFile = path.join(DESTINATION_DIR, pictureId + '.jpeg');

      jobsDescriptions.push({
        id: pictureId,
        metadata,
        pictureUrl,
        targetMetadataFile,
        targetPictureFile
      });
    }

    // Download pictures

    const limit = promiseLimit(5);

    const downloadPictureJob = (id, metadata, pictureUrl, targetMetadataFile, targetPictureFile) => {
      return new Promise((resolve, reject) => {
        progress(request(pictureUrl))
          .on('progress', state => {
            //
            // Update current job status
            //

            // What is the current job index in all jobs progress list?
            let jobIndex = -1;
            for (let i = 0; i < this.state.progress.length; i++) {
              if (this.state.progress[i].id === id) {
                jobIndex = i;
                break;
              }
            }
            if (jobIndex !== -1) {
              // The job is already on the list
              this.setState({
                progress: [
                  ...this.state.progress.slice(0, jobIndex),
                  {
                    ...this.state.progress[jobIndex],
                    transferred: state.size.transferred
                  },
                  ...this.state.progress.slice(jobIndex + 1)
                ]
              });
            } else {
              // New jobs are placed at the beginning of the list
              this.setState({
                progress: [
                  {
                    id,
                    pictureUrl,
                    status: 'downloading',
                    targetMetadataFile,
                    targetPictureFile,
                    transferred: state.size.transferred
                  },
                  ...this.state.progress
                ]
              });
            }
          })
          .on('error', err => reject(err))
          .on('end', () => {
            // Update current job status
            let jobIndex = -1;
            for (let i = 0; i < this.state.progress.length; i++) {
              if (this.state.progress[i].id === id) {
                jobIndex = i;
                break;
              }
            }
            this.setState({
              progress: [
                ...this.state.progress.slice(0, jobIndex),
                {
                  ...this.state.progress[jobIndex],
                  status: 'downloaded'
                },
                ...this.state.progress.slice(jobIndex + 1)
              ]
            });

            // Write metadata
            fs.writeFileSync(targetMetadataFile, JSON.stringify(metadata));

            // Resolve job promise
            resolve({ id, metadata, pictureUrl, targetMetadataFile, targetPictureFile });
          })
          .pipe(fs.createWriteStream(targetPictureFile));
      });
    };

    Promise.all(
      jobsDescriptions.map(jobDescription => {
        return limit(() =>
          downloadPictureJob(
            jobDescription.id,
            jobDescription.metadata,
            jobDescription.pictureUrl,
            jobDescription.targetMetadataFile,
            jobDescription.targetPictureFile
          )
        );
      })
    ).then(results => {
      console.log(results);
    });
  }

  render() {
    if (this.state.selectedExploreJsonFile) {
      return (
        <_Root>
          <_ProgressList>
            {this.state.progress.map(_ => {
              return (
                <li key={_.id} className={_.status}>
                  <div>{_.status}</div>
                  <div>{_.pictureUrl}</div>
                  <div>{_.targetMetadataFile}</div>
                  <div>{_.targetPictureFile}</div>
                  <div>{`${(_.transferred / 1000 / 1000).toFixed(2)} MB`}</div>
                </li>
              );
            })}
          </_ProgressList>
        </_Root>
      );
    } else
      return (
        <_Root>
          <_Title>
            <div>
              <img src={RECOLNAT_LOGO} />
            </div>
            <h1>the collaboratory</h1>
          </_Title>
          <_ImportFromExplore>
            <h2>
              Import pictures & metadata from{' '}
              <a onClick={e => shell.openExternal('https://explore.recolnat.org/')}>explore.recolnat.org</a>
            </h2>
            <h3>1) Select & export:</h3>
            <_ImportFromExplorePictures>
              <div>
                <img src={img_import_from_explore_1} />
              </div>
              <div>
                <img src={img_import_from_explore_2} />
              </div>
            </_ImportFromExplorePictures>
            <h3>
              2) Unzip the downloaded <code>.zip</code>, and{' '}
              <_FileOpenLink onClick={e => this.downloadFromExplore('/Users/amleth/Downloads/1510741434.json')}>
                open the <code>.json</code> file <i className="fa fa-folder-open-o" aria-hidden="true" />
              </_FileOpenLink>
            </h3>
          </_ImportFromExplore>
        </_Root>
      );
  }
}

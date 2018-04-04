import { remote, shell } from 'electron';
import fs from 'fs-extra';
import path from 'path';
import promiseLimit from 'promise-limit';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import request from 'request';
import progress from 'request-progress';
import styled from 'styled-components';

import {
  DOC_BG,
  DOC_BORDER,
  DOC_BUTTON_BG,
  DOC_BUTTON_FG,
  DOC_FG,
  DOC_ICON,
  DOC_ICON_HOVER,
  DOC_LINK_BG,
  DOC_LINK_FG,
  MAIN_NAV_BG,
  MAIN_NAV_FG,
  MAIN_NAV_FG_OVER,
  PROGRESS_BG,
  PROGRESS_DOWNLOADED,
  PROGRESS_FG1,
  PROGRESS_FG2,
  PROGRESS_SEP,
  RECOLNAT_CAMILLE_DEGARDIN,
  DOC_TITLE_ICON
} from './constants';
import { USER_DATA_DIR } from '../index';
import {
  addPicturesDirectory,
  disableDirectory,
  enableDirectory,
  getAllPicturesDirectories,
  getEnabledPicturesDirectories,
  removePicturesDirectory,
  toConfigFile
} from '../config';
import { formatDate } from '../utils/js';
import { format } from 'url';

const img_import_from_explore_1 = require('./pictures/explore01.png');
const img_import_from_explore_2 = require('./pictures/explore02.png');
const RECOLNAT_LOGO = require('./pictures/recolnat_logo.png');

const _Root = styled.div`
  color: ${DOC_FG};
  height: 100%;
  overflow: scroll;
  width: 100%;

  > * {
    padding: 30px;
  }

  .link:hover {
    text-decoration: underline;
  }

  .icon {
    color: ${DOC_ICON};

    &:hover {
      color: ${DOC_ICON_HOVER};
    }
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
const _Message = styled.div`
  color: ${RECOLNAT_CAMILLE_DEGARDIN};
  margin-top: 50px;
  text-align: center;
`;

const _ImportSection = styled.div`
  text-align: center;

  &:nth-child(2) {
    background-color: ${DOC_BG};
  }

  h2 {
    font-size: 200%;
    text-align: center;
    text-transform: uppercase;
    width: 100%;

    a {
      color: ${DOC_LINK_FG};

      &:hover {
        text-decoration: underline;
      }
    }

    .icon {
      color: ${DOC_TITLE_ICON};

      &: hover {
        color: ${DOC_TITLE_ICON};
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

  ul,
  li {
    margin: 0;
    padding: 0;
  }

  ul {
    font-size: 120%;
    list-style-type: none;
    margin-bottom: 50px;
  }

  li {
    font-family: monospace;
  }
`;

const _ImportFromExplorePictures = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const _FileOpenLink = styled.span`
  background-color: ${DOC_BUTTON_BG};
  border: 1px solid ${DOC_BORDER};
  border-radius: 2px;
  color: ${DOC_BUTTON_FG};
  padding: 0.2em;

  &:hover {
    background-color: ${DOC_BUTTON_FG};
    color: ${DOC_BUTTON_BG};
  }
`;

const _Progress = styled.div`
  background-color: ${PROGRESS_BG};
  color: ${PROGRESS_FG1};
  margin: 0;
  padding: 30px;
  width: 100%;

  > h2 {
    border: 2px solid ${PROGRESS_FG1};
    font-size: 200%;
    margin: 0 0 30px 0;
    padding: 50px 0;
    text-align: center;
    text-transform: uppercase;
    width: 100%;
  }

  button {
    background-color: ${DOC_LINK_BG};
    border: none;
    border-radius: 2px;
    color: ${DOC_LINK_FG};
    font-size: 133%;
    margin-bottom: 20px;
    padding: 1em;

    &:hover {
      background-color: ${DOC_LINK_FG};
      color: ${DOC_LINK_BG};
    }
  }

  > table {
    border-collapse: collapse;
    font-family: monospace;
    font-size: 120%;
    margin: 0 0 10px 0;
    padding: 0;
    width: 100%;

    i.fa-check {
      color: ${PROGRESS_DOWNLOADED};
    }

    tr: {
      padding: 2px 0;
    }

    td:nth-child(1) {
      padding: 0 7px 0 0;
    }

    tr:nth-child(1) {
      font-weight: bold;
      text-transform: uppercase;
    }

    tr:nth-child(2),
    tr:nth-child(3),
    tr:nth-child(4) {
      td:nth-child(2) {
        color: ${PROGRESS_FG2};
        font-size: 80%;
      }
    }
  }
`;

export default class extends Component {
  constructor(props) {
    super(props);

    this.state = { selectedExploreJsonFile: null, jobs: [], jobsCompleted: 0, progress: [] };

    this.downloadFromExplore = this.downloadFromExplore.bind(this);
  }

  downloadFromExplore(selectedExploreJsonFile) {
    if (!fs.existsSync(selectedExploreJsonFile)) return;

    this.setState({ selectedExploreJsonFile });

    const now = formatDate(new Date());
    const DESTINATION_DIR = path.join(USER_DATA_DIR, now);
    fs.ensureDirSync(DESTINATION_DIR);

    const specimens = JSON.parse(fs.readFileSync(selectedExploreJsonFile, 'utf8'));

    // Jobs preparation

    const jobsDescriptions = [];

    for (const specimen of specimens) {
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
        humanid: `${metadata.institutioncode}/${metadata.collectioncode}/${metadata.catalognumber}`,
        id: pictureId,
        metadata,
        pictureUrl,
        targetMetadataFile,
        targetPictureFile
      });
    }

    // Download pictures

    const limit = promiseLimit(4);

    const downloadPictureJob = (humanid, id, metadata, pictureUrl, targetMetadataFile, targetPictureFile) => {
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
                    humanid,
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
              jobsCompleted: this.state.jobsCompleted + 1,
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

    this.setState({ jobs: jobsDescriptions });

    Promise.all(
      jobsDescriptions.map(jobDescription => {
        return limit(() =>
          downloadPictureJob(
            jobDescription.humanid,
            jobDescription.id,
            jobDescription.metadata,
            jobDescription.pictureUrl,
            jobDescription.targetMetadataFile,
            jobDescription.targetPictureFile
          )
        );
      })
    ).then(results => {
      addPicturesDirectory(DESTINATION_DIR);
      toConfigFile();
      remote.relaunch();
      remote.exit();
    });
  }

  render() {
    if (this.state.selectedExploreJsonFile) {
      let p = 1;
      return (
        <_Root>
          <_Progress>
            <h2>
              {this.state.jobs.length} files & their metadata will be downloaded ({this.state.jobsCompleted}/{
                this.state.jobs.length
              })
            </h2>
            {this.state.progress.map(_ => {
              return (
                <table key={_.id} className={_.status}>
                  <tbody>
                    <tr>
                      <td>
                        {_.status === 'downloading' ? (
                          <i className="fa fa-circle-o-notch fa-spin fa-fw" />
                        ) : (
                          <i className="fa fa-check fa-fw" />
                        )}
                      </td>
                      <td>{`${_.status} '${_.humanid}' (${(_.transferred / 1000 / 1000).toFixed(2)} MB)`}</td>
                    </tr>
                    <tr>
                      <td>
                        <i className="fa fa-globe fa-fw" />
                      </td>
                      <td>
                        <a className="link" onClick={e => shell.openExternal(_.pictureUrl)}>
                          {_.pictureUrl}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <i className="fa fa-file-text-o fa-fw" />
                      </td>
                      <td className="link" onClick={e => shell.showItemInFolder(_.targetMetadataFile)}>
                        {_.targetMetadataFile}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <i className="fa fa-photo fa-fw" />
                      </td>
                      <td className="link" onClick={e => shell.showItemInFolder(_.targetPictureFile)}>
                        {_.targetPictureFile}
                      </td>
                    </tr>
                  </tbody>
                </table>
              );
            })}
          </_Progress>
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
          <_ImportSection>
            <h2>
              <i className="fa fa-desktop fa-fw icon" />&nbsp;On this computer
            </h2>
            <ul>
              {getAllPicturesDirectories().map(_ => {
                const enabled = getEnabledPicturesDirectories().indexOf(_) !== -1;
                return (
                  <li key={_}>
                    <span className="link" onClick={e => shell.showItemInFolder(_)}>
                      {_}
                    </span>
                    &nbsp;
                    <i
                      className="fa fa-trash fa-fw icon"
                      onClick={e => {
                        removePicturesDirectory(_);
                        toConfigFile();
                      }}
                    />
                    {enabled ? (
                      <i
                        className="fa fa-eye fa-fw icon"
                        onClick={e => {
                          console.log('Please disable', _);
                          disableDirectory(_);
                          this.forceUpdate();
                          toConfigFile();
                        }}
                      />
                    ) : (
                      <i
                        className="fa fa-eye-slash fa-fw icon"
                        onClick={e => {
                          console.log('Please enable', _);
                          enableDirectory(_);
                          this.forceUpdate();
                          toConfigFile();
                        }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
            <h3>
              <_FileOpenLink
                onClick={e => {
                  const _ = remote.dialog.showOpenDialog({ properties: ['openDirectory'] });
                  if (!_ || _.length < 1) return;
                  addPicturesDirectory(_.pop());
                  toConfigFile();
                }}
              >
                Add local directory <i className="fa fa-folder-open-o" aria-hidden="true" />
              </_FileOpenLink>
            </h3>
          </_ImportSection>
          <_ImportSection>
            <h2>
              <i className="fa fa-globe fa-fw icon" />&nbsp;Import pictures & metadata from{' '}
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
              <_FileOpenLink
                onClick={e => {
                  const _ = remote.dialog.showOpenDialog({
                    properties: ['openFile'],
                    filters: [{ name: 'JSON explore file', extensions: ['json'] }]
                  });
                  if (!_ || _.length < 1) return;
                  this.downloadFromExplore(_.pop());
                }}
              >
                open the <code>.json</code> file <i className="fa fa-folder-open-o" aria-hidden="true" />
              </_FileOpenLink>
            </h3>
          </_ImportSection>
        </_Root>
      );
  }
}

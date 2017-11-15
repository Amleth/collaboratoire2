import { shell } from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

import {
  DOC_BORDER,
  DOC_LINK_BG,
  DOC_LINK_FG,
  MAIN_NAV_BG,
  MAIN_NAV_FG,
  MAIN_NAV_FG_OVER,
  RECOLNAT_CAMILLE_DEGARDIN
} from './constants';

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
    font-size: 400%;
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

export default ({}) => {
  return null;
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
          <_FileOpenLink>
            open the <code>.json</code> file <i className="fa fa-folder-open-o" aria-hidden="true" />
          </_FileOpenLink>
        </h3>
      </_ImportFromExplore>
    </_Root>
  );
};

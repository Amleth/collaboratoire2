import 'babel-polyfill';
import Chance from 'chance';
import configYaml from 'config-yaml';
import { remote } from 'electron';
import fs from 'fs-extra';
import logger from 'electron-logger';
import path from 'path';
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { push } from 'react-router-redux';
import styled, { css } from 'styled-components';

import { RECOLNAT_CAMILLE_DEGARDIN } from './components/constants';
import { getConfig, setConfig } from './config';
import { importExploreJson } from './actions/app';
import Root from './containers/Root';
import { createInitialState } from './reducers/app';
import { configureStore, history } from './store/configureStore';
import { initPicturesLibrary } from './system/library';

import './app.global.css';
import 'react-virtualized/styles.css';

const chance = new Chance();
const start = new Date().getTime();

const _LoadingMessage = styled.div`
  color: white;
  font-size: 200%;
  height: 100%;
  margin-top: 111px;
  text-align: center;
  width: 100%;

  ul {
    font-size: 69%;
    list-style-type: none;
    margin: 0;
    padding: 0;

    li {
      font-family: monospace;
      margin: 0;
      padding: 0;
    }
  }
`;

const _WaitIcon = styled.i`
  @keyframes hop {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  animation: hop 1s ease infinite alternate;
`;

// Create application cache & user data directories
const CACHE_DIR = path.join(remote.app.getPath('home'), 'collaboratoire2-cache');
const THUMBNAILS_DIR = path.join(CACHE_DIR, 'thumbnails');
export const USER_DATA_DIR = path.join(remote.app.getPath('home'), 'collaboratoire2-userdata');
const CACHE_FILE = path.join(CACHE_DIR, 'cache.json');
fs.ensureDirSync(CACHE_DIR);
fs.ensureDirSync(USER_DATA_DIR);
fs.ensureDirSync(THUMBNAILS_DIR);

// Logger configuration
logger.setOutput({ file: path.join(CACHE_DIR, 'log.log') });

(async () => {
  // Read config file
  setConfig(configYaml(path.join(remote.app.getPath('home'), 'collaboratoire2-config.yml')));

  // Display a waiting message
  render(
    <_LoadingMessage>
      <p>Loading pictures from:</p>
      <ul>{getConfig()['pictures_directories'].map(_ => <li key={_}>{_}</li>)}</ul>
      <p>Please wait...</p>
      <_WaitIcon className="fa fa-tree" aria-hidden="true" />
    </_LoadingMessage>,
    document.getElementById('root')
  );

  // Ensure the working directory exists
  let picturesArray = await initPicturesLibrary(CACHE_FILE, THUMBNAILS_DIR, getConfig()['pictures_directories']);
  if (picturesArray.length === 0) {
  }

  const picturesObject = {};
  for (const p of picturesArray) {
    picturesObject[p.id] = p;
  }

  // Init Redux store
  const initialState = createInitialState();
  initialState.app.pictures = picturesObject;
  initialState.app.pictures_selection = Object.keys(picturesObject);
  const store = configureStore(initialState);

  console.log(`${new Date().getTime() - start}ms`);

  setTimeout(function() {
    store.dispatch(push('/'));
  }, 500);

  render(
    <AppContainer>
      <Root store={store} history={history} />
    </AppContainer>,
    document.getElementById('root')
  );

  if (module.hot) {
    module.hot.accept('./containers/Root', () => {
      const NextRoot = require('./containers/Root');
      render(
        <AppContainer>
          <NextRoot store={store} history={history} />
        </AppContainer>,
        document.getElementById('root')
      );
    });
  }
})();

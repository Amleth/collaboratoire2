import 'babel-polyfill';
import Chance from 'chance';
import { remote } from 'electron';
import fs from 'fs-extra';
import logger from 'electron-logger';
import path from 'path';
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { push } from 'react-router-redux';
import rimraf from 'rimraf';

import { RECOLNAT_CAMILLE_DEGARDIN } from './components/constants';
import Loading from './components/Loading';
import { fromConfigFile, getAllPicturesDirectories, getEnabledPicturesDirectories, setConfigFilePath } from './config';
import { importExploreJson } from './actions/app';
import Root from './containers/Root';
import { createInitialState } from './reducers/app';
import { configureStore, history } from './store/configureStore';
import { ee, EVENT_COMPUTING_PICTURE, EVENT_COMPLETE, initPicturesLibrary } from './system/library';
import { getMetadata } from './system/erecolnat-metadata';

import './app.global.css';
import 'react-virtualized/styles.css';

export let store;
const chance = new Chance();
const start = new Date().getTime();

// Create application cache & user data directories
const CACHE_DIR = path.join(remote.app.getPath('home'), 'collaboratoire2-cache');
// rimraf.sync(CACHE_DIR);
const THUMBNAILS_DIR = path.join(CACHE_DIR, 'thumbnails');
export const USER_DATA_DIR = path.join(remote.app.getPath('home'), 'collaboratoire2-userdata');
const CACHE_FILE = path.join(CACHE_DIR, 'cache.json');
fs.ensureDirSync(CACHE_DIR);
fs.ensureDirSync(USER_DATA_DIR);
fs.ensureDirSync(THUMBNAILS_DIR);

// Logger configuration
logger.setOutput({ file: path.join(CACHE_DIR, 'log.log') });

// Read config file
setConfigFilePath(path.join(remote.app.getPath('home'), 'collaboratoire2-config.yml'));
fromConfigFile();

// Callback which boot the app
const go = picturesArray => {
  // Restructure pictures data
  const picturesObject = {};
  for (const p of picturesArray) {
    picturesObject[p.sha1] = p;
  }

  // Init Redux store
  const initialState = createInitialState();
  initialState.app.pictures = picturesObject;
  initialState.app.pictures_selection = Object.keys(picturesObject);
  store = configureStore(initialState).store;

  // add erecolnat metadata
  for (const p in store.getState().app.pictures) {
    const erecolnatMetadata = getMetadata(store.getState().app.pictures[p].file);
    if (erecolnatMetadata) store.getState().app.pictures[p].erecolnatMetadata = erecolnatMetadata;
  }

  console.log(`${new Date().getTime() - start}ms`);

  // Ugly hack to be sure to start at the '/' route
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
};

// Wait for library init
if (getAllPicturesDirectories().length > 0) {
  render(
    <Loading directories={getAllPicturesDirectories()} loadingEventEmitter={ee} />,
    document.getElementById('root')
  );
  initPicturesLibrary(CACHE_FILE, THUMBNAILS_DIR, getEnabledPicturesDirectories());
  ee.on(EVENT_COMPLETE, picturesArray => {
    go(picturesArray);
  });
} else {
  go([]);
}

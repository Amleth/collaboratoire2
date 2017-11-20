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

  // Create some test data
  // const { createTag } = require('./actions/app');
  // for (let i = 0; i < 100; i++) {
  //   store.dispatch(createTag(chance.word()));
  // }
  // const { tagPicture } = require('./actions/app');
  // for (let picture of Object.values(store.getState().app.pictures)) {
  //   for (let j = 0; j < chance.d100(); j++) {
  //     const tag = chance.pickone(store.getState().app.tags.map(_ => _.name));
  //     store.dispatch(tagPicture(picture.id, tag));
  //   }
  // }
  // const { createAnnotationMeasureLinear } = require('./actions/app');
  // for (let picture of Object.values(store.getState().app.pictures)) {
  //   for (let j = 0; j < 20; j++) {
  //     store.dispatch(
  //       createAnnotationMeasureLinear(
  //         picture.id,
  //         chance.integer({ min: 0, max: picture.width }),
  //         chance.integer({ min: 0, max: picture.height }),
  //         chance.integer({ min: 0, max: picture.width }),
  //         chance.integer({ min: 0, max: picture.height }),
  //         Math.random() * 300
  //       )
  //     );
  //   }
  // }
  // const { createAnnotationPointOfInterest } = require('./actions/app');
  // for (let picture of Object.values(store.getState().app.pictures)) {
  //   for (let j = 0; j < 10; j++) {
  //     store.dispatch(
  //       createAnnotationPointOfInterest(
  //         picture.id,
  //         chance.integer({ min: 0, max: picture.width }),
  //         chance.integer({ min: 0, max: picture.height })
  //       )
  //     );
  //   }
  // }
  // const { createAnnotationRectangular } = require('./actions/app');
  // for (let picture of Object.values(store.getState().app.pictures)) {
  //   for (let j = 0; j < 5; j++) {
  //     store.dispatch(
  //       createAnnotationRectangular(
  //         picture.id,
  //         chance.integer({ min: 0, max: picture.width }),
  //         chance.integer({ min: 0, max: picture.height }),
  //         chance.integer({ min: 0, max: picture.width / 5 }),
  //         chance.integer({ min: 0, max: picture.height / 5 })
  //       )
  //     );
  //   }
  // }

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

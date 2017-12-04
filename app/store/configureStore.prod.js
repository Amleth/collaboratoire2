import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'react-router-redux';
import { combineReducers, createStore, applyMiddleware } from 'redux';
// import { persistStore, persistCombineReducers } from 'redux-persist';
// import storage from 'redux-persist/es/storage';
import thunk from 'redux-thunk';

import rootReducer from '../reducers';

const history = createBrowserHistory();
const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, router);

function configureStore(initialState) {
  // const config = { key: 'root', storage };
  // const store = createStore(persistCombineReducers(config, rootReducer), initialState, enhancer);
  const store = createStore(combineReducers(rootReducer), initialState, enhancer);
  // const persistor = persistStore(store);

  // return { persistor, store };
  return { store };
}

export default { configureStore, history };

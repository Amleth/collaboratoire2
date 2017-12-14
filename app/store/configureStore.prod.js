import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'react-router-redux';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import rootReducer from '../reducers';

const history = createBrowserHistory();
const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, router);

function configureStore(initialState) {
  const store = createStore(combineReducers(rootReducer), initialState, enhancer);

  return store;
}

export default { configureStore, history };

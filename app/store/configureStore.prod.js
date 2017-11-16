import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'react-router-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import rootReducer from '../reducers';

const history = createBrowserHistory();
const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, router);

function configureStore(initialState) {
  return createStore(rootReducer, initialState, enhancer);
}

export default { configureStore, history };

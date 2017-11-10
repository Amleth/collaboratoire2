import React from 'react';
import { Switch, Route } from 'react-router';

import App from './components/App';
import HomePage from './containers/HomePage';
import Library from './containers/Library';
import Image from './containers/Image';
import Data from './containers/Data';

export default () => (
  <App>
    <Switch>
      {<Route exact path="/" component={HomePage} />}
      {<Route exact path="/library" component={Library} />}
      {<Route exact path="/image" component={Image} />}
      {<Route exact path="/data" component={Data} />}
    </Switch>
  </App>
);

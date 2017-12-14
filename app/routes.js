import React from 'react';
import { Switch, Route } from 'react-router';

import App from './containers/App';
import Home from './containers/Home';
import Library from './containers/Library';
import FreeSpace from './containers/FreeSpace';
import Image from './containers/Image';
import Data from './containers/Data';

export default () => (
  <App>
    <Switch>
      {<Route exact path="/" component={Home} />}
      {<Route exact path="/library" component={Library} />}
      {<Route exact path="/image" component={Image} />}
      {<Route exact path="/freespace" component={FreeSpace} />}
      {<Route exact path="/data" component={Data} />}
    </Switch>
  </App>
);

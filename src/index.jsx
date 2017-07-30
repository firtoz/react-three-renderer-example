/* eslint-disable no-undef */

import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter as Router,
  Route,
} from 'react-router-dom';
import Perf from 'react-addons-perf';
import createHashHistory from 'history/createHashHistory';

import ExampleBrowser from './examples/ExampleBrowser';

const customHistory = createHashHistory();
window.Perf = Perf;

ReactDOM.render(
  <Router history={customHistory}>
    <div>
      <Route path="/:slug?" component={ExampleBrowser} />
    </div>
  </Router>,
  document.getElementById('content'),
);

import React from 'react';
import ReactDOM from 'react-dom';
import ExampleBrowser from './examples/ExampleBrowser';
import Perf from 'react-addons-perf';

window.Perf = Perf;

ReactDOM.render(<ExampleBrowser/>, document.getElementById('content'));

import React from 'react';
import ReactDOM from 'react-dom';
import AppWrapper from './components/AppWrapper';

const Bluebird = require('bluebird');
global.Promise = Bluebird;
//Bluebird.config({ warnings: false });

if (!process.env.NODE_ENV) {
  throw new Error(
    'Environment variable NODE_ENV must be set to development or production.'
  );
}


ReactDOM.render(
  <AppWrapper />,
  document.getElementById('application')
);

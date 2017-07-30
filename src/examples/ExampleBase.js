import React from 'react';

import PropTypes from 'prop-types';

class ExampleBase extends React.Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  };
}

export default ExampleBase;

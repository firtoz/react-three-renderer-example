import React from 'react';
import PropTypes from 'prop-types';

import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';

import Cloth from './Cloth';

class ClothGeometry extends React.Component {
  static propTypes = {
    cloth: PropTypes.instanceOf(Cloth).isRequired,
  };

  componentDidMount() {
    const geometry = this.geometry;

    geometry.computeFaceNormals();
  }

  _geometryRef = (geometry) => {
    this.geometry = geometry;
  };

  shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate;

  render() {
    const {
      cloth,
    } = this.props;

    return (<parametricGeometry
      ref={this._geometryRef}
      parametricFunction={Cloth.clothFunction}
      slices={cloth.w}
      stacks={cloth.h}
      dynamic
    />);
  }
}

export default ClothGeometry;

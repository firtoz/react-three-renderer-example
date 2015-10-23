import React from 'react';
import DraggableCube from './DraggableCube';
import THREE from 'three.js';

import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';

const {PropTypes} = React;

import MouseInput from '../inputs/MouseInput';

class AllCubes extends React.Component {
  static propTypes = {
    mouseInput: PropTypes.instanceOf(MouseInput),
    onCubesMounted: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    const cubePositions = [];
    cubePositions.length = 200;

    for (let i = 0; i < 200; ++i) {
      cubePositions[i] = new THREE.Vector3(
        Math.random() * 1000 - 500,
        Math.random() * 600 - 300,
        Math.random() * 800 - 400
      );
    }

    const cubes = [];
    cubes.length = cubePositions.length;
    this.cubes = cubes;

    this.cubePositions = cubePositions;

    this.mouse = new THREE.Vector2();
    this.offset = new THREE.Vector3();
    this.selected = null;
  }

  componentDidMount() {
    const {
      onCubesMounted,
      } = this.props;

    onCubesMounted(this.cubes);
  }

  shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate;

  _onCubeCreate = (index, cube) => {
    this.cubes[index] = cube;
  };

  render() {
    const {
      mouseInput,
      } = this.props;

    return (<group>
      {this.cubePositions.map((cubePosition, index) => {
        return (<DraggableCube
          key={index}
          mouseInput={mouseInput}
          initialPosition={cubePosition}
          onCreate={this._onCubeCreate.bind(this, index)}
        />);
      })}
    </group>);
  }
}

export default AllCubes;

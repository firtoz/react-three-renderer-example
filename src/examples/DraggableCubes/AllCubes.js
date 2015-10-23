import React from 'react';
import DraggableCube from './DraggableCube';
import THREE from 'three.js';

import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';

class AllCubes extends React.Component {
  constructor(props, context) {
    super(props, context);

    const cubePositions = [];

    for (let i = 0; i < 200; ++i) {
      cubePositions.push(new THREE.Vector3(
        Math.random() * 1000 - 500,
        Math.random() * 600 - 300,
        Math.random() * 800 - 400
      ));
    }

    this.state = {
      cubePositions,
    };

    this.mouse = new THREE.Vector2();
    this.offset = new THREE.Vector3();
    this.selected = null;
  }

  shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate;

  render() {
    return (<group>
      {this.state.cubePositions.map((cubePosition, index) => {
        return (<DraggableCube
          key={index}
          position={cubePosition}
        />);
      })}
    </group>);
  }
}

export default AllCubes;

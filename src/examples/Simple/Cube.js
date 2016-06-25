import React from 'react';
import React3 from 'react-three-renderer';
import THREE from 'three';

class Cube extends React.Component {

  componentWillReceiveProps() {
    if( window.debuggg ) {
      console.log('Cube.js componentWillReceiveProps');
    }
  }

  render() {
    if( window.debuggg ) {
      window.debuggg = false;
      console.log('Cube.js render');
    }
    return (<group>
      <mesh
        rotation={this.props.rotation}
      >
        <boxGeometry
          width={1}
          height={1}
          depth={1}
        />
        <meshBasicMaterial
          color={0xffff00}
        />
      </mesh>
    </group>);
  }
}

export default Cube;

import React from 'react';
import React3 from 'react-three-renderer';
import THREE from 'three';
import TransitionExampleModule from './TransitionExampleModule';

import eases from 'eases';

const transitionTypes = Object.keys(eases);

class PositionTransitionExample extends React.Component {
  static propTypes = {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.cameraPosition = new THREE.Vector3(0, 0, 5);
    this.groupOffset = new THREE.Vector3(0, 0, 0.125);

    this.state = {
      firstCubePosition: new THREE.Vector3(-1, 0, 0),
      firstTransitionType: 'cubicInOut',
      firstTransitionDuration: 2000,

      secondTransitionType: 'linear',
      secondCubePosition: new THREE.Vector3(1, 0, 0),
      secondTransitionDuration: 4000,

      yOffset: 2,
    };

    [
      'moveClicked',

      'onFirstSelectionChange',
      'onFirstTransitionDurationChange',

      'onSecondSelectionChange',
      'onSecondTransitionDurationChange',
    ].forEach(functionName => {
      this[functionName] = this[functionName].bind(this);
    });
  }

  onFirstSelectionChange(event) {
    this.setState({
      firstTransitionType: event.target.value,
    });
  }

  onFirstTransitionDurationChange(event) {
    this.setState({
      firstTransitionDuration: +event.target.value,
    });
  }

  onSecondSelectionChange(event) {
    this.setState({
      secondTransitionType: event.target.value,
    });
  }

  onSecondTransitionDurationChange(event) {
    this.setState({
      secondTransitionDuration: +event.target.value,
    });
  }

  moveClicked() {
    this.setState({
      yOffset: -this.state.yOffset,
      firstCubePosition: new THREE.Vector3(-1, this.state.yOffset, 0),
      secondCubePosition: new THREE.Vector3(1, this.state.yOffset, 0),
    });
  }

  render() {
    const {
      width,
      height,
    } = this.props;

    const controls = (<div
      style={{
        textAlign: 'center',
        padding: 10,
        zIndex: 10,
        width: '100%',
        position: 'absolute',
        color: '#000',
        background: 'white',
      }}
    >
      <label>First Transition Type <select
        onChange={this.onFirstSelectionChange}
        value={this.state.firstTransitionType}>
        {transitionTypes.map(type =>
          <option key={type} value={type}>{type}</option>)}
      </select></label> <br />

      <label>First Transition Duration: <input
        type="number"
        value={this.state.firstTransitionDuration}
        onChange={this.onFirstTransitionDurationChange}
      /></label> <br />

      <label>Second Transition Type <select
        onChange={this.onSecondSelectionChange}
        value={this.state.secondTransitionType}>
        {transitionTypes.map(type =>
          <option key={type} value={type}>{type}</option>)}
      </select></label> <br />

      <label>Second Transition Duration: <input
        type="number"
        value={this.state.secondTransitionDuration}
        onChange={this.onSecondTransitionDurationChange}
      /></label> <br />

      <button onClick={this.moveClicked}>Move!</button>
    </div>);

    const littlePreviewCubes = (<group
      position={this.groupOffset}
    >
      <mesh
        position={this.state.firstCubePosition}
      >
        <boxGeometry
          width={0.1}
          height={0.1}
          depth={0.1}
        />
        <meshBasicMaterial
          color={0xffffff}
        />
      </mesh>
      <mesh
        position={this.state.secondCubePosition}
      >
        <boxGeometry
          width={0.1}
          height={0.1}
          depth={0.1}
        />
        <meshBasicMaterial
          color={0xffffff}
        />
      </mesh>
    </group>);

    return (<div>
      {controls}
      <React3
        mainCamera="camera"
        width={width}
        height={height}

        onAnimate={this._onAnimate}
      >
        <module
          descriptor={TransitionExampleModule}
        />
        <scene>
          <perspectiveCamera
            name="camera"
            fov={75}
            aspect={width / height}
            near={0.1}
            far={1000}

            position={this.cameraPosition}
          />
          <mesh
            position={this.state.firstCubePosition}
            easeType={this.state.firstTransitionType}
            transitionDuration={this.state.firstTransitionDuration}
            easePosition
          >
            <boxGeometry
              width={0.25}
              height={0.25}
              depth={0.25}
            />
            <meshBasicMaterial
              color={0x00ff00}
            />
          </mesh>
          <mesh
            position={this.state.secondCubePosition}
            easeType={this.state.secondTransitionType}
            transitionDuration={this.state.secondTransitionDuration}
            easePosition
          >
            <boxGeometry
              width={0.25}
              height={0.25}
              depth={0.25}
            />
            <meshBasicMaterial
              color={0x0000ff}
            />
          </mesh>
          {littlePreviewCubes}
        </scene>
      </React3></div>);
  }
}

export default PositionTransitionExample;

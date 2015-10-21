import React from 'react';
const {PropTypes} = React;

import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';

import THREE from 'three.js';
import Stats from 'stats.js';

import React3 from 'react-three-renderer';

import ExampleBase from '../ExampleBase';

import TrackballControls from '../../ref/trackball';

class AllCubes extends React.Component {
  shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate;

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
  }

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

class DraggableCube extends React.Component {
  static propTypes = {
    position: PropTypes.instanceOf(THREE.Vector3).isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.rotation = new THREE.Euler(
      Math.random() * 2 * Math.PI,
      Math.random() * 2 * Math.PI,
      Math.random() * 2 * Math.PI
    );

    this.scale = new THREE.Vector3(
      Math.random() * 2 + 1,
      Math.random() * 2 + 1,
      Math.random() * 2 + 1
    );

    this.color = Math.random() * 0xffffff;
  }

  render() {
    const {
      position,
      } = this.props;

    const {
      rotation,
      scale,
      color,
      } = this;

    return (<mesh
      position={position}
      rotation={rotation}
      scale={scale}

      castShadow
      receiveShadow
    >
      <geometryResource
        resourceId="boxGeometry"
      />
      <meshLambertMaterial
        color={color}
      />
    </mesh>);
  }
}

class DraggableCubes extends ExampleBase {
  constructor(props, context) {
    super(props, context);


    this.state = {
      cameraPosition: new THREE.Vector3(0, 0, 1000),
      cameraRotation: new THREE.Euler(),
    };

    this.lightPosition = new THREE.Vector3(0, 500, 2000);

    //this.directionalLightPosition = new THREE.Vector3(0, 1, 0);
    //
    //this.objectPositions = [
    //  new THREE.Vector3(-400, 0, 200),
    //  new THREE.Vector3(-200, 0, 200),
    //  new THREE.Vector3(0, 0, 200),
    //  new THREE.Vector3(200, 0, 200),
    //  new THREE.Vector3(-400, 0, 0),
    //  new THREE.Vector3(-200, 0, 0),
    //  new THREE.Vector3(0, 0, 0),
    //  new THREE.Vector3(200, 0, 0),
    //  new THREE.Vector3(400, 0, 0),
    //
    //  new THREE.Vector3(-400, 0, -200),
    //  new THREE.Vector3(-200, 0, -200),
    //  new THREE.Vector3(0, 0, -200),
    //  new THREE.Vector3(200, 0, -200),
    //  new THREE.Vector3(400, 0, -200),
    //];
    //
    //this.lathePoints = [];
    //
    //for (let i = 0; i < 50; i++) {
    //  this.lathePoints.push(new THREE.Vector3(Math.sin(i * 0.2) * Math.sin(i * 0.1) * 15 + 50, 0, ( i - 5 ) * 2));
    //}
    //
    //this.arrowDir = new THREE.Vector3(0, 1, 0);
    //this.arrowOrigin = new THREE.Vector3(0, 0, 0);
    //
    //this.scenePosition = new THREE.Vector3(0, 0, 0);
    //
    //this.state = {
    //  ...this.state,
    //  timer: Date.now() * 0.0001,
    //};
  }

  _onAnimate = () => {
    this._onAnimateInternal();
  };

  componentDidMount() {
    this.stats = new Stats();

    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';

    this.refs.container.appendChild(this.stats.domElement);

    const controls = new TrackballControls(this.refs.camera);

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    this.controls = controls;

    this.controls.addEventListener('change', this._onTrackballChange);
  }

  _onTrackballChange = () => {
    this.setState({
      cameraPosition: this.refs.camera.position.clone(),
      cameraRotation: this.refs.camera.rotation.clone(),
    });
  };

  componentWillUnmount() {
    this.controls.removeEventListener('change', this._onTrackballChange);

    this.controls.dispose();
    delete this.controls;
    delete this.stats;
  }

  _onAnimateInternal() {
    this.stats.update();
    this.controls.update();
  }

  render() {
    const {
      width,
      height,
      } = this.props;

    const {
      cameraPosition,
      cameraRotation,
      } = this.state;

    return (<div ref="container">
      <React3
        width={width}
        height={height}
        antialias
        pixelRatio={window.devicePixelRatio}
        mainCamera="mainCamera"
        onAnimate={this._onAnimate}
        sortObjects={false}
        shadowMapEnabled
        shadowMapType={THREE.PCFShadowMap}
      >
        <scene>
          <perspectiveCamera
            fov={70}
            aspect={width / height}
            near={1}
            far={10000}
            name="mainCamera"
            ref="camera"
            position={cameraPosition}
            rotation={cameraRotation}
          />
          <ambientLight
            color={0x505050}
          />
          <spotLight
            color={0xffffff}
            intensity={1.5}
            position={this.lightPosition}

            castShadow
            shadowCameraNear={200}
            shadowCameraFar={10000}
            shadowCameraFov={50}

            shadowBias={-0.00022}

            shadowMapWidth={2048}
            shadowMapHeight={2048}
          />
          <resources>
            <boxGeometry
              resourceId="boxGeometry"

              width={40}
              height={40}
              depth={40}
            />
          </resources>
          <AllCubes/>
          <mesh
            receiveShadow
          >
            <planeBufferGeometry
              width={2000}
              height={2000}
              widthSegments={8}
              heightSegments={8}
            />
            <meshBasicMaterial
              visible={false}
            />
          </mesh>
        </scene>
      </React3>
    </div>);
  }
}

export default DraggableCubes;

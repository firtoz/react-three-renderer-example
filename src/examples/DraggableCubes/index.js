import React from 'react';
const {PropTypes} = React;

import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';

import THREE from 'three.js';
import Stats from 'stats.js';

import React3 from 'react-three-renderer';

import ExampleBase from '../ExampleBase';

import TrackballControls from '../../ref/trackball';

import MouseInput from '../inputs/MouseInput';

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

    this.color = new THREE.Color(Math.random() * 0xffffff);

    const hsl = this.color.getHSL();

    hsl.s = Math.min(1, hsl.s * 1.1);
    hsl.l = Math.min(1, hsl.l * 1.1);

    const {h, s, l} = hsl;

    this.hoverColor = new THREE.Color().setHSL(h, s, l);
    this.pressedColor = 0xff0000;

    this.state = {
      hovered: false,
      pressed: false,
    };
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this._onDocumentMouseUp);
  }

  shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate;

  _onMouseEnter = () => {
    this.setState({
      'hovered': true,
    });
  };

  _onMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();

    this.setState({
      'pressed': true,
    });

    document.addEventListener('mouseup', this._onDocumentMouseUp);
  };

  _onDocumentMouseUp = (event) => {
    event.preventDefault();

    this.setState({
      pressed: false,
    });

    document.removeEventListener('mouseup', this._onDocumentMouseUp);
  };

  _onMouseLeave = () => {
    if (this.state.hovered) {
      this.setState({
        'hovered': false,
      });
    }
  };

  render() {
    const {
      position,
      } = this.props;

    const {
      rotation,
      scale,
      color: idleColor,
      hoverColor,
      pressedColor,
      } = this;

    const {
      hovered,
      pressed,
      } = this.state;

    let color;

    if (pressed) {
      color = pressedColor;
    } else if (hovered) {
      color = hoverColor;
    } else {
      color = idleColor;
    }

    return (<group
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <mesh
        castShadow
        receiveShadow

        onMouseEnter={this._onMouseEnter}
        onMouseDown={this._onMouseDown}
        onMouseLeave={this._onMouseLeave}
      >
        <geometryResource
          resourceId="boxGeometry"
        />
        <meshLambertMaterial
          color={color}
        />
      </mesh>
      {hovered ? <mesh>
        <geometryResource
          resourceId="boxGeometry"
        />
        <meshBasicMaterial
          color={0xffff00}
          wireframe
        />
      </mesh> : null}
    </group>);
  }
}

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

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.offset = new THREE.Vector3();
    this.intersected = null;
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

class DraggableCubes extends ExampleBase {
  constructor(props, context) {
    super(props, context);


    this.state = {
      cameraPosition: new THREE.Vector3(0, 0, 1000),
      cameraRotation: new THREE.Euler(),
    };

    this.lightPosition = new THREE.Vector3(0, 500, 2000);
  }

  shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate;

  _onAnimate = () => {
    this._onAnimateInternal();
  };

  componentDidMount() {
    this.stats = new Stats();

    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';

    const {
      scene,
      container,
      camera,
      mouseInput,
      } = this.refs;

    container.appendChild(this.stats.domElement);

    const controls = new TrackballControls(camera);

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    this.controls = controls;

    this.controls.addEventListener('change', this._onTrackballChange);

    mouseInput.ready(scene, container, camera);
  }

  componentDidUpdate() {
    const {
      mouseInput,
      } = this.refs;

    mouseInput.containerResized();
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

    return (<div
      ref="container"
    >
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
        clearColor={0xf0f0f0}
      >
        <module
          ref="mouseInput"
          descriptor={MouseInput}
        />
        <resources>
          <boxGeometry
            resourceId="boxGeometry"

            width={40}
            height={40}
            depth={40}
          />
        </resources>
        <scene ref="scene">
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
          <AllCubes/>
          <mesh
            receiveShadow
            ref="plane"
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

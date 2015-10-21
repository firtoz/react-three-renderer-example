import React from 'react';

import THREE from 'three.js';
import Stats from 'stats.js';

import React3 from 'react-three-renderer';

import ExampleBase from '../ExampleBase';

import Resources from './Resources';

import Shapes from './Shapes';

class MouseInput {
  constructor(scene, container, camera) {
    this._scene = scene;
    this._container = container;
    this._camera = camera;

    this._raycaster = new THREE.Raycaster();
    this._mouse = new THREE.Vector2();

    this._onMouseMove = (event) => {
      this._mouse.set(event.clientX, event.clientY);
    };

    this._containerRect = this._container.getBoundingClientRect();

    this._hoverObjectMap = {};

    document.addEventListener('mousemove', this._onMouseMove, false);
  }

  containerResized() {
    this._containerRect = this._container.getBoundingClientRect();
  }

  update() {
    const containerRect = this._containerRect;

    const temp = new THREE.Vector2(containerRect.left, containerRect.top);

    const relativeMouseCoords = this._mouse.clone()
      .sub(temp)
      .divide(temp.set(containerRect.width, containerRect.height));

    relativeMouseCoords.x = relativeMouseCoords.x * 2 - 1;
    relativeMouseCoords.y = -relativeMouseCoords.y * 2 + 1;

    // mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    // mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    this._raycaster.setFromCamera(relativeMouseCoords, this._camera);

    const intersections = this._raycaster.intersectObject(this._scene, true);

    const hoverMapToUpdate = {
      ...this._hoverObjectMap,
    };

    intersections.forEach(intersection => {
      const object = intersection.object;

      const uuid = object.uuid;


      if (this._hoverObjectMap[uuid]) {
        delete hoverMapToUpdate[uuid];

        // just update that intersection
        this._hoverObjectMap[uuid].intersection = intersection;
      } else {
        this._hoverObjectMap[uuid] = {
          object,
          intersection,
        };

        React3.eventDispatcher.dispatchEvent(object, 'onMouseEnter', intersection);
      }
    });

    // delete all unseen uuids in hover map
    Object.keys(hoverMapToUpdate).forEach(uuid => {
      React3.eventDispatcher.dispatchEvent(this._hoverObjectMap[uuid].object, 'onMouseLeave');

      delete this._hoverObjectMap[uuid];
    });

    //React3.dispatchEvent();
    //console.log(relativeMouseCoords, intersections);

    // e = e || window.event;

    // var target = e.target || e.srcElement,
    //   rect = target.getBoundingClientRect(),
    //   offsetX = e.clientX - rect.left,
    //   offsetY = e.clientY - rect.top;

    // console.log([offsetX, offsetY]);
  }

  dispose() {
    document.removeEventListener('mousemove', this._onMouseMove, false);
  }
}

class GeometryShapes extends ExampleBase {
  constructor(props, context) {
    super(props, context);

    this.cameraPosition = new THREE.Vector3(0, 150, 500);
    this.groupPosition = new THREE.Vector3(0, 50, 0);


    this.targetRotationOnMouseDown = 0;

    this.mouseX = 0;
    this.mouseXOnMouseDown = 0;
    this.targetRotation = 0;

    this.state = {
      ...this.state,
      groupRotation: new THREE.Euler(0, 0, 0),
    };
  }

  componentDidUpdate() {
    this.mouseInput.containerResized();
  }

  componentDidMount() {
    this.stats = new Stats();
    this.mouseInput = new MouseInput(this.refs.scene, this.refs.container, this.refs.camera);

    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';

    this.refs.container.appendChild(this.stats.domElement);

    document.addEventListener('mousedown', this._onDocumentMouseDown, false);
    document.addEventListener('touchstart', this._onDocumentTouchStart, false);
    document.addEventListener('touchmove', this._onDocumentTouchMove, false);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this._onDocumentMouseDown, false);
    document.removeEventListener('touchstart', this._onDocumentTouchStart, false);
    document.removeEventListener('touchmove', this._onDocumentTouchMove, false);
    document.removeEventListener('touchmove', this._onDocumentMouseMove, false);
    document.removeEventListener('touchmove', this._onDocumentMouseUp, false);
    document.removeEventListener('touchmove', this._onDocumentMouseOut, false);

    delete this.stats;

    this.mouseInput.dispose();
    delete this.mouseInput;
  }

  _onDocumentMouseDown = (event) => {
    event.preventDefault();

    document.addEventListener('mousemove', this._onDocumentMouseMove, false);
    document.addEventListener('mouseup', this._onDocumentMouseUp, false);
    document.addEventListener('mouseout', this._onDocumentMouseOut, false);

    const {
      width,
      } = this.props;

    const windowHalfX = width / 2;

    this.mouseXOnMouseDown = event.clientX - windowHalfX;
    this.targetRotationOnMouseDown = this.targetRotation;
  };

  _onDocumentMouseMove = (event) => {
    const {
      width,
      } = this.props;

    const windowHalfX = width / 2;

    this.mouseX = event.clientX - windowHalfX;
    this.targetRotation = this.targetRotationOnMouseDown +
      ( this.mouseX - this.mouseXOnMouseDown ) * 0.02;
  };

  _onDocumentMouseUp = () => {
    document.removeEventListener('mousemove', this._onDocumentMouseMove, false);
    document.removeEventListener('mouseup', this._onDocumentMouseUp, false);
    document.removeEventListener('mouseout', this._onDocumentMouseOut, false);
  };

  _onDocumentMouseOut = () => {
    document.removeEventListener('mousemove', this._onDocumentMouseMove, false);
    document.removeEventListener('mouseup', this._onDocumentMouseUp, false);
    document.removeEventListener('mouseout', this._onDocumentMouseOut, false);
  };

  _onDocumentTouchStart = (event) => {
    if (event.touches.length === 1) {
      event.preventDefault();

      const {
        width,
        } = this.props;

      const windowHalfX = width / 2;

      this.mouseXOnMouseDown = event.touches[0].pageX - windowHalfX;
      this.targetRotationOnMouseDown = this.targetRotation;
    }
  };

  _onDocumentTouchMove = (event) => {
    if (event.touches.length === 1) {
      event.preventDefault();

      const {
        width,
        } = this.props;

      const windowHalfX = width / 2;

      this.mouseX = event.touches[0].pageX - windowHalfX;
      this.targetRotation = this.targetRotationOnMouseDown +
        ( this.mouseX - this.mouseXOnMouseDown ) * 0.05;
    }
  };

  _onAnimate = () => {
    this._onAnimateInternal();
  };

  _onAnimateInternal() {
    const groupRotationY = this.state.groupRotation.y;

    if (Math.abs(groupRotationY - this.targetRotation) > 0.0001) {
      this.setState({
        groupRotation: new THREE.Euler(0, groupRotationY +
          ( this.targetRotation - groupRotationY ) * 0.05, 0),
      });
    }

    this.stats.update();
    this.mouseInput.update();
  }

  render() {
    const {
      width,
      height,
      } = this.props;

    const {
      groupRotation,
      } = this.state;

    return (<div ref="container">
      <div style={{
        color: 'black',
        position: 'absolute',
        top: '10px',
        width: '100%',
        textAlign: 'center',
      }}>
        Simple procedurally generated 3D shapes<br/>
        Drag to spin
      </div>
      <React3
        width={width}
        height={height}
        antialias
        pixelRatio={window.devicePixelRatio}
        mainCamera="mainCamera"
        clearColor={0xf0f0f0}
        onAnimate={this._onAnimate}
      >
        <scene ref="scene">
          <perspectiveCamera
            name="mainCamera"
            ref="camera"
            fov={50}
            aspect={width / height}
            near={1}
            far={1000}

            position={this.cameraPosition}
          >
            <pointLight
              color={0xffffff}
              intensity={0.8}
            />
          </perspectiveCamera>
          <Resources/>
          <group
            position={this.groupPosition}
            rotation={groupRotation}
          >
            <Shapes/>
          </group>
        </scene>
      </React3>
    </div>);
  }
}

export default GeometryShapes;

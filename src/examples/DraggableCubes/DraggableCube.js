import React from 'react';
const {PropTypes} = React;

import THREE from 'three.js';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';

import MouseInput from '../inputs/MouseInput';

class DraggableCube extends React.Component {
  static propTypes = {
    initialPosition: PropTypes.instanceOf(THREE.Vector3).isRequired,
    mouseInput: PropTypes.instanceOf(MouseInput),
    setPosition: PropTypes.func.isRequired,
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

    const {
      initialPosition,
      } = this.props;

    this.state = {
      hovered: false,
      pressed: false,
      position: initialPosition,
    };
  }

  shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate;

  componentWillUnmount() {
    document.removeEventListener('mouseup', this._onDocumentMouseUp);
  }

  _onMouseEnter = () => {
    this.setState({
      'hovered': true,
    });
  };

  _onMouseDown = (event, intersection) => {
    event.preventDefault();
    event.stopPropagation();

    this.setState({
      'pressed': true,
    });

    const {
      position,
      } = this.state;

    this._offset = intersection.point.clone().sub(position);
    this._distance = intersection.distance;

    document.addEventListener('mouseup', this._onDocumentMouseUp);
    document.addEventListener('mousemove', this._onDocumentMouseMove);
  };

  _onDocumentMouseMove = (event) => {
    event.preventDefault();

    const {
      mouseInput,
      } = this.props;

    const ray:THREE.Ray = mouseInput.getCameraRay(new THREE.Vector2(event.clientX, event.clientY));

    this.setState({
      position: ray.at(this._distance).sub(this._offset),
    });
  };

  _onDocumentMouseUp = (event) => {
    event.preventDefault();

    this.setState({
      pressed: false,
    });

    document.removeEventListener('mouseup', this._onDocumentMouseUp);
    document.removeEventListener('mousemove', this._onDocumentMouseMove);
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
      rotation,
      scale,
      } = this;

    const {
      hovered,
      pressed,
      position,
      } = this.state;

    let color;

    if (pressed) {
      color = this.pressedColor;
    } else if (hovered) {
      color = this.hoverColor;
    } else {
      color = this.color;
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

export default DraggableCube;

import React from 'react';
const {PropTypes} = React;

import THREE from 'three.js';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';

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

  shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate;

  componentWillUnmount() {
    document.removeEventListener('mouseup', this._onDocumentMouseUp);
  }

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
      } = this;

    const {
      hovered,
      pressed,
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

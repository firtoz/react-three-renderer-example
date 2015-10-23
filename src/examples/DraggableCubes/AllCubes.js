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
    onHoverStart: PropTypes.func.isRequired,
    onHoverEnd: PropTypes.func.isRequired,
    onDragStart: PropTypes.func.isRequired,
    onDragEnd: PropTypes.func.isRequired,

    hovering: PropTypes.bool,
    dragging: PropTypes.bool,
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

    this._hoveredCubes = 0;
    this._draggingCubes = 0;
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

  _onCubeMouseEnter = () => {
    if (this._hoveredCubes === 0) {
      const {
        onHoverStart,
        } = this.props;

      onHoverStart();
    }

    this._hoveredCubes++;
  };

  _onCubeMouseLeave = () => {
    this._hoveredCubes--;

    if (this._hoveredCubes === 0) {
      const {
        onHoverEnd,
        } = this.props;

      onHoverEnd();
    }
  };

  _onCubeDragStart = () => {
    if (this._draggingCubes === 0) {
      const {
        onDragStart,
        } = this.props;

      onDragStart();
    }

    this._draggingCubes++;
  };

  _onCubeDragEnd = () => {
    this._draggingCubes--;

    if (this._draggingCubes === 0) {
      const {
        onDragEnd,
        } = this.props;

      onDragEnd();
    }
  };


  render() {
    const {
      mouseInput,
      hovering,
      dragging,
      } = this.props;

    return (<group>
      {this.cubePositions.map((cubePosition, index) => {
        return (<DraggableCube
          key={index}
          mouseInput={mouseInput}
          initialPosition={cubePosition}
          onCreate={this._onCubeCreate.bind(this, index)}
          onMouseEnter={this._onCubeMouseEnter}
          onMouseLeave={this._onCubeMouseLeave}
          onDragStart={this._onCubeDragStart}
          onDragEnd={this._onCubeDragEnd}

          hovering={hovering}
          dragging={dragging}
        />);
      })}
    </group>);
  }
}

export default AllCubes;

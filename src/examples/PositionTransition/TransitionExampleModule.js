import THREE from 'three';

import Module from 'react-three-renderer/lib/Module';

import PropTypes from 'react/lib/ReactPropTypes';

import propTypeInstanceOf from 'react-three-renderer/lib/utils/propTypeInstanceOf';

import eases from 'eases';

const allEaseTypes = Object.keys(eases);

class PositionTransition {
  constructor(threeObject, wantedPosition) {
    this.module = threeObject;
    this.threeObject = threeObject;
    this.wantsToBeRemoved = false;

    threeObject.userData.events.on('dispose', this.onObjectDispose);

    this.newTarget(wantedPosition);
  }

  newTarget(newPosition) {
    this.startPosition = this.threeObject.position.clone();
    this.wantedPosition = newPosition;
    this.transitionStartTime = new Date().getTime();
  }

  tick() {
    if (this.wantsToBeRemoved) {
      return false;
    }

    const threeObject = this.threeObject;
    const duration = threeObject.userData._transitionDuration;
    const endTime = this.transitionStartTime + duration;
    const now = new Date().getTime();

    if (now > endTime) {
      this.finish();
      return false;
    }

    const wantedEase = eases[threeObject.userData._easeType] || eases.cubicInOut;

    const easedValue = wantedEase((now - this.transitionStartTime) / duration);

    const fullDifference = this.wantedPosition.clone()
      .sub(this.startPosition);

    const finalValue = this.startPosition.clone()
      .add(fullDifference.multiplyScalar(easedValue));

    threeObject.position.copy(finalValue);

    if (threeObject.userData._lookAt) {
      threeObject.lookAt(threeObject.userData._lookAt);
    }

    return true;
  }

  finish() {
    if (this.wantsToBeRemoved) {
      return;
    }

    this.wantsToBeRemoved = true;

    const threeObject = this.threeObject;

    threeObject.position.copy(this.wantedPosition);

    if (threeObject.userData._lookAt) {
      threeObject.lookAt(threeObject.userData._lookAt);
    }

    threeObject.userData._positionTransition = undefined;

    this.threeObject.userData.events.removeListener('dispose', this.onObjectDispose);
  }

  onObjectDispose() {
    this.wantsToBeRemoved = true;

    this.threeObject.userData.events.removeListener('dispose', this.onObjectDispose);
  }
}

/**
 * Adds three props to object types ( e.g. mesh ):
 *  - easeType ( see eases/index.js )
 *  - transitionDuration : how many milliseconds the position transition should take
 *  - easePosition : bool, if true it will use a transition to set positions
 *
 * These will affect how their position property is applied.
 */
class TransitionExample extends Module {
  constructor() {
    super();

    this.patchedDescriptors = [];
    this.activeTransitions = [];
    this.react3RendererInstance = null;
  }

  setup(r3rInstance) {
    this.react3RendererInstance = r3rInstance;

    super.setup(r3rInstance);

    const Object3DDescriptor = r3rInstance.threeElementDescriptors.object3D.constructor;

    Object.keys(r3rInstance.threeElementDescriptors).forEach(elementDescriptorName => {
      const elementDescriptor = r3rInstance.threeElementDescriptors[elementDescriptorName];

      if (elementDescriptor instanceof Object3DDescriptor) {
        // replace their position property to take transitions into account
        elementDescriptor.removeProp('position');

        elementDescriptor.hasProp('position', {
          type: propTypeInstanceOf(THREE.Vector3),
          update: (threeObject, position) => {
            if (threeObject.userData._easePosition) {
              if (threeObject.userData._positionTransition) {
                threeObject.userData._positionTransition.newTarget(position);
              } else {
                threeObject.userData._positionTransition =
                  new PositionTransition(threeObject, position);

                this.activeTransitions.push(threeObject.userData._positionTransition);
              }
            } else {
              threeObject.position.copy(position);

              if (threeObject.userData._lookAt) {
                threeObject.lookAt(threeObject.userData._lookAt);
              }
            }
          },
          default: new THREE.Vector3(),
        });

        elementDescriptor.hasProp('easeType', {
          type: PropTypes.oneOf(allEaseTypes),
          update(threeObject, easeType) {
            threeObject.userData._easeType = easeType;
          },
          updateInitial: true,
          default: 'cubicInOut',
        });

        elementDescriptor.hasProp('transitionDuration', {
          type: PropTypes.number,
          update(threeObject, transitionDuration) {
            threeObject.userData._transitionDuration = transitionDuration;
          },
          updateInitial: true,
          default: 200,
        });

        elementDescriptor.hasProp('easePosition', {
          type: PropTypes.bool,
          update(threeObject, easePosition) {
            if (!easePosition && threeObject.userData._positionTransition) {
              // there is already a transition, force it to end

              threeObject.userData._positionTransition.finish();
            }

            threeObject.userData._easePosition = easePosition;
          },
          updateInitial: true,
          default: false,
        });

        this.patchedDescriptors.push(elementDescriptorName);
      }
    });
  }

  update() {
    // if the tick returns false then it means it's finished and wants to be removed
    // otherwise let them keep ticking every update
    this.activeTransitions = this.activeTransitions.filter(transition => transition.tick());
  }

  dispose() {
    // UNTESTED, will be called only if you want to remove the module from R3R

    this.activeTransitions.forEach(transition => transition.finish());

    this.activeTransitions = [];

    this.patchedDescriptors.forEach(elementDescriptorName => {
      const DescriptorConstructor = this.react3RendererInstance
        .threeElementDescriptors[elementDescriptorName].constructor;

      // reconstruct all patched descriptors! ( UNTESTED )
      this.react3RendererInstance.threeElementDescriptors[elementDescriptorName] =
        new DescriptorConstructor(this.react3RendererInstance);
    });
  }
}

export default TransitionExample;

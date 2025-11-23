import * as THREE from 'three';
import { GAME_CONSTANTS } from '../constants.js';

/**
 * Movement System - Handles player movement with Source-like physics
 */
export function MovementSystem(world, camera, audioManager) {
    return (entities, dt, time) => {
        const GRAVITY = GAME_CONSTANTS.PHYSICS.GRAVITY;
        const JUMP_FORCE = GAME_CONSTANTS.PHYSICS.JUMP_FORCE;
        const MOVE_SPEED = GAME_CONSTANTS.PHYSICS.MOVE_SPEED;
        const AIR_CONTROL = GAME_CONSTANTS.PHYSICS.AIR_CONTROL;
        const FRICTION = GAME_CONSTANTS.PHYSICS.FRICTION;

        const movableEntities = world.query('Position', 'Velocity', 'Input');

        movableEntities.forEach(entity => {
            const pos = entity.components.Position;
            const vel = entity.components.Velocity;
            const input = entity.components.Input;
            const collider = entity.components.Collider;

            if (!pos || !vel || !input) return;

            const wasOnGround = entity.components.Flags ? entity.components.Flags.onGround : false;

            // Input Direction relative to Camera
            const direction = new THREE.Vector3();
            const front = new THREE.Vector3();
            const side = new THREE.Vector3();

            camera.getWorldDirection(front);
            front.y = 0;
            front.normalize();
            side.copy(front).cross(camera.up).normalize();

            if (input.forward) direction.add(front);
            if (input.backward) direction.sub(front);
            if (input.left) direction.sub(side);
            if (input.right) direction.add(side);
            direction.normalize();

            // Acceleration
            const speed = MOVE_SPEED * (input.crouch ? 0.4 : 1.0);
            const accel = wasOnGround ? speed * 10 : speed * AIR_CONTROL;

            if (direction.lengthSq() > 0) {
                vel.x += direction.x * accel * dt;
                vel.z += direction.z * accel * dt;

                // Footstep sounds
                if (wasOnGround && !entity.components.Flags.lastFootstep) {
                    entity.components.Flags.lastFootstep = 0;
                }
                if (wasOnGround) {
                    entity.components.Flags.lastFootstep += dt;
                    if (entity.components.Flags.lastFootstep > 0.4) {
                        audioManager.playFootstep();
                        entity.components.Flags.lastFootstep = 0;
                    }
                }
            }

            // Friction
            if (wasOnGround) {
                const speedXZ = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
                if (speedXZ > 0) {
                    const drop = speedXZ * FRICTION * dt;
                    const newSpeed = Math.max(speedXZ - drop, 0);
                    if (speedXZ > 0) {
                        vel.x *= newSpeed / speedXZ;
                        vel.z *= newSpeed / speedXZ;
                    }
                }
            }

            // Speed Limit
            const maxSpeed = speed;
            const currSpeed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
            if (currSpeed > maxSpeed && wasOnGround) {
                vel.x = (vel.x / currSpeed) * maxSpeed;
                vel.z = (vel.z / currSpeed) * maxSpeed;
            }

            // Jump with buffering
            const jumpBufferValid = (time - (input.jumpBufferTime || 0)) < (GAME_CONSTANTS.PLAYER.JUMP_BUFFER_TIME / 1000);
            if (jumpBufferValid && wasOnGround) {
                vel.y = JUMP_FORCE;
                entity.components.Flags.onGround = false;
                input.jumpBufferTime = 0; // Consume buffer
            }

            // Gravity
            vel.y -= GRAVITY * dt;

            // Crouch logic
            if (collider) {
                if (input.crouch) {
                    collider.height = GAME_CONSTANTS.PLAYER.CROUCH_HEIGHT;
                } else {
                    collider.height = GAME_CONSTANTS.PLAYER.HEIGHT;
                }
            }
        });
    };
}

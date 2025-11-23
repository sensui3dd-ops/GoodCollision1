import { GAME_CONSTANTS } from '../constants.js';

/**
 * Input System - Processes keyboard and mouse input
 */
export function InputSystem(world, keyState, mouseState) {
    return (entities, dt, time) => {
        const players = world.query('PlayerTag', 'Input');
        if (players.length === 0) return;

        const player = players[0];
        const input = player.components.Input;

        input.forward = keyState['KeyW'];
        input.backward = keyState['KeyS'];
        input.left = keyState['KeyA'];
        input.right = keyState['KeyD'];
        input.jump = keyState['Space'];
        input.crouch = keyState['KeyC'];
        input.reload = keyState['KeyR'];
        input.flashlight = keyState['KeyF'];
        input.fire = mouseState['left'];

        // Jump buffering
        if (input.jump && !input.jumpWasPressed) {
            input.jumpBufferTime = time;
        }
        input.jumpWasPressed = input.jump;
    };
}

import { GAME_CONSTANTS } from '../constants.js';

/**
 * Render System - Updates camera and debug info
 */
export function RenderSystem(world, camera) {
    return (entities, dt) => {
        const players = world.query('PlayerTag', 'Position', 'Collider');
        if (players.length === 0) return;

        const player = players[0];
        const pos = player.components.Position;
        const col = player.components.Collider;

        // Camera follow with smooth crouch
        const targetHeight = pos.y + col.height - GAME_CONSTANTS.PLAYER.EYE_OFFSET;

        camera.position.x = pos.x;
        camera.position.z = pos.z;
        camera.position.y += (targetHeight - camera.position.y) * 15 * dt;

        // Weapon bob
        if (player.components.Weapon) {
            const vel = player.components.Velocity;
            const speedXZ = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
            const flags = player.components.Flags;

            if (flags.onGround && speedXZ > 0.1) {
                const bobAmount = Math.sin(Date.now() * 0.01) * 0.02;
                player.components.Weapon.group.position.y = -0.25 + bobAmount;
            } else {
                player.components.Weapon.group.position.y += (-0.25 - player.components.Weapon.group.position.y) * 10 * dt;
            }
        }

        // Debug info
        const debugPosEl = document.getElementById('debug-pos');
        if (debugPosEl) {
            debugPosEl.innerText = `POS: ${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`;
        }
    };
}

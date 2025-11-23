import { GAME_CONSTANTS } from '../constants.js';

/**
 * Health System - Manages health, damage, and regeneration
 */
export function HealthSystem(world) {
    return (entities, dt, time) => {
        const healthEntities = world.query('Health');

        healthEntities.forEach(entity => {
            const health = entity.components.Health;

            // Process damage events
            if (health.damageQueue && health.damageQueue.length > 0) {
                health.damageQueue.forEach(dmg => {
                    health.current = Math.max(0, health.current - dmg);
                    health.lastDamageTime = time;

                    // Visual feedback
                    const vignette = document.getElementById('damage-vignette');
                    if (vignette) {
                        vignette.style.opacity = '0.6';
                        setTimeout(() => vignette.style.opacity = '0', 300);
                    }

                    // Update UI
                    updateHealthUI(health);
                });
                health.damageQueue = [];
            }

            // Health regeneration
            const timeSinceDamage = (time - (health.lastDamageTime || 0)) * 1000;
            if (timeSinceDamage > GAME_CONSTANTS.HEALTH.REGEN_DELAY && health.current < health.max) {
                health.current = Math.min(health.max, health.current + GAME_CONSTANTS.HEALTH.REGEN_RATE * dt);
                updateHealthUI(health);
            }
        });
    };
}

function updateHealthUI(health) {
    const healthEl = document.getElementById('health');
    if (!healthEl) return;

    healthEl.innerText = Math.ceil(health.current);

    // Color based on health
    if (health.current < 30) {
        healthEl.style.color = '#ff0000';
    } else if (health.current < 60) {
        healthEl.style.color = '#ff8800';
    } else {
        healthEl.style.color = '#ffaa00';
    }
}

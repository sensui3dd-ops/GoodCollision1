import * as THREE from 'three';

/**
 * Physics System - Applies velocity and handles collisions
 */
export function PhysicsSystem(world, spatialHash) {
    return (entities, dt) => {
        const physicsEntities = world.query('Position', 'Velocity', 'Collider');

        physicsEntities.forEach(entity => {
            const pos = entity.components.Position;
            const vel = entity.components.Velocity;
            const col = entity.components.Collider;

            if (!pos || !vel || !col) return;

            // Apply Velocity X
            pos.x += vel.x * dt;
            checkCollisions(entity, 'x', spatialHash);

            // Apply Velocity Z
            pos.z += vel.z * dt;
            checkCollisions(entity, 'z', spatialHash);

            // Apply Velocity Y
            pos.y += vel.y * dt;

            if (!entity.components.Flags) entity.components.Flags = {};
            entity.components.Flags.onGround = false;

            checkCollisions(entity, 'y', spatialHash);

            // Floor constraint
            if (pos.y < 0) {
                pos.y = 0;
                vel.y = 0;
                entity.components.Flags.onGround = true;
            }
        });
    };
}

function checkCollisions(entity, axis, spatialHash) {
    const pos = entity.components.Position;
    const vel = entity.components.Velocity;
    const col = entity.components.Collider;
    const flags = entity.components.Flags;

    const eMinX = pos.x - col.width / 2;
    const eMaxX = pos.x + col.width / 2;
    const eMinY = pos.y;
    const eMaxY = pos.y + col.height;
    const eMinZ = pos.z - col.depth / 2;
    const eMaxZ = pos.z + col.depth / 2;

    const entityBox = new THREE.Box3(
        new THREE.Vector3(eMinX, eMinY, eMinZ),
        new THREE.Vector3(eMaxX, eMaxY, eMaxZ)
    );

    const nearbyWalls = spatialHash.query(entityBox);
    const EPSILON = 0.01; // Improved collision epsilon

    for (const wallBox of nearbyWalls) {
        if (entityBox.intersectsBox(wallBox)) {
            if (axis === 'x') {
                if (vel.x > 0) {
                    pos.x = wallBox.min.x - col.width / 2 - EPSILON;
                } else if (vel.x < 0) {
                    pos.x = wallBox.max.x + col.width / 2 + EPSILON;
                }
                vel.x = 0;
            }
            else if (axis === 'z') {
                if (vel.z > 0) {
                    pos.z = wallBox.min.z - col.depth / 2 - EPSILON;
                } else if (vel.z < 0) {
                    pos.z = wallBox.max.z + col.depth / 2 + EPSILON;
                }
                vel.z = 0;
            }
            else if (axis === 'y') {
                if (vel.y > 0) {
                    pos.y = wallBox.min.y - col.height - EPSILON;
                    vel.y = 0;
                } else if (vel.y < 0) {
                    pos.y = wallBox.max.y + EPSILON;
                    vel.y = 0;
                    flags.onGround = true;
                }
            }
        }
    }
}

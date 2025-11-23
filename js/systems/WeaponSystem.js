import * as THREE from 'three';
import { GAME_CONSTANTS } from '../constants.js';

/**
 * Weapon System - Handles shooting, reloading, and flashlight
 */
export function WeaponSystem(world, camera, scene, audioManager) {
    return (entities, dt, time) => {
        const weaponEntities = world.query('Weapon', 'Input');

        weaponEntities.forEach(entity => {
            const weapon = entity.components.Weapon;
            const input = entity.components.Input;
            const flashlight = entity.components.Flashlight;

            if (!weapon || !input) return;

            // Flashlight Toggle
            if (input.flashlight && !weapon.flashlightPressed) {
                if (flashlight) {
                    flashlight.isOn = !flashlight.isOn;
                    flashlight.object.visible = flashlight.isOn;
                }
                weapon.flashlightPressed = true;
            } else if (!input.flashlight) {
                weapon.flashlightPressed = false;
            }

            // Reload
            if (input.reload && !weapon.isReloading && weapon.ammo < GAME_CONSTANTS.WEAPON.MAGAZINE_SIZE && weapon.reserveAmmo > 0) {
                weapon.isReloading = true;
                weapon.reloadStartTime = time;
                audioManager.playReload();
            }

            // Reload Logic
            if (weapon.isReloading) {
                const elapsed = (time - weapon.reloadStartTime) * 1000;
                if (elapsed < GAME_CONSTANTS.WEAPON.RELOAD_TIME) {
                    weapon.group.rotation.x = -Math.sin((elapsed / GAME_CONSTANTS.WEAPON.RELOAD_TIME) * Math.PI) * 1;
                    weapon.group.position.y = -0.25 - Math.sin((elapsed / GAME_CONSTANTS.WEAPON.RELOAD_TIME) * Math.PI) * 0.2;
                } else {
                    weapon.group.rotation.x = 0;
                    weapon.group.position.y = -0.25;
                    const needed = GAME_CONSTANTS.WEAPON.MAGAZINE_SIZE - weapon.ammo;
                    const taken = Math.min(needed, weapon.reserveAmmo);
                    weapon.ammo += taken;
                    weapon.reserveAmmo -= taken;
                    weapon.isReloading = false;
                    updateAmmoUI(weapon);
                }
            }

            // Fire
            if (input.fire && !weapon.isReloading && weapon.ammo > 0 && (time - weapon.lastShotTime) * 1000 > GAME_CONSTANTS.WEAPON.FIRE_RATE) {
                weapon.lastShotTime = time;
                weapon.ammo--;
                updateAmmoUI(weapon);

                // Recoil
                weapon.targetRecoil.z = 0.15;
                weapon.targetRecoil.x = 0.1;
                weapon.targetRecoil.y = (Math.random() - 0.5) * 0.05;

                // Muzzle Flash
                weapon.muzzleFlash.material.opacity = 1.0;
                weapon.muzzleFlash.rotation.z = Math.random() * Math.PI;
                weapon.muzzleFlash.scale.set(1 + Math.random() * 0.5, 1 + Math.random() * 0.5, 1);

                // Audio
                audioManager.playGunshot();

                // Raycast
                fireRaycast(weapon, camera, scene);
            }

            // Update Recoil & Weapon Pos
            weapon.recoil.x = THREE.MathUtils.lerp(weapon.recoil.x, weapon.targetRecoil.x, dt * 15);
            weapon.recoil.y = THREE.MathUtils.lerp(weapon.recoil.y, weapon.targetRecoil.y, dt * 15);
            weapon.recoil.z = THREE.MathUtils.lerp(weapon.recoil.z, weapon.targetRecoil.z, dt * 15);

            weapon.targetRecoil.x = THREE.MathUtils.lerp(weapon.targetRecoil.x, 0, dt * 5);
            weapon.targetRecoil.y = THREE.MathUtils.lerp(weapon.targetRecoil.y, 0, dt * 5);
            weapon.targetRecoil.z = THREE.MathUtils.lerp(weapon.targetRecoil.z, 0, dt * 5);

            weapon.group.position.z = -0.5 + weapon.recoil.z;
            weapon.group.rotation.x = weapon.recoil.x;
            weapon.group.rotation.y = weapon.recoil.y;

            if (weapon.muzzleFlash.material.opacity > 0) {
                weapon.muzzleFlash.material.opacity -= dt * 15;
            }
        });
    };
}

function updateAmmoUI(weapon) {
    const ammoEl = document.getElementById('ammo-count');
    if (ammoEl) {
        ammoEl.innerText = `${weapon.ammo} / ${weapon.reserveAmmo}`;
    }
}

function fireRaycast(weapon, camera, scene) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    const hits = raycaster.intersectObjects(scene.children, true);
    const validHits = hits.filter(h => {
        let obj = h.object;
        while (obj) {
            if (obj === weapon.group) return false;
            obj = obj.parent;
        }
        return true;
    });

    if (validHits.length > 0) {
        const hit = validHits[0];
        createBulletHole(hit.point, hit.face.normal, weapon.bulletHolePool);
    }
}

function createBulletHole(position, normal, bulletHolePool) {
    // Use object pool
    if (bulletHolePool.active.length >= GAME_CONSTANTS.POOL.BULLET_HOLES) {
        const oldest = bulletHolePool.releaseOldest();
        if (oldest) oldest.visible = false;
    }

    const hole = bulletHolePool.acquire();
    hole.position.copy(position);
    hole.position.add(normal.clone().multiplyScalar(0.01));
    hole.lookAt(position.clone().add(normal));
    hole.visible = true;

    // Auto-release after 5 seconds
    setTimeout(() => {
        hole.visible = false;
        bulletHolePool.release(hole);
    }, 5000);
}

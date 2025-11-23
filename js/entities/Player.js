import * as THREE from 'three';
import { GAME_CONSTANTS } from '../constants.js';

/**
 * Initialize weapon mesh and components
 */
export function initWeapon(camera) {
    const weaponGroup = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3, metalness: 0.6 });
    const silverMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.2, metalness: 0.8 });

    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 0.1), material);
    handle.position.set(0, -0.15, 0.05);
    handle.rotation.x = Math.PI / 8;
    weaponGroup.add(handle);

    const slide = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.08, 0.4), silverMat);
    slide.position.set(0, 0, -0.1);
    weaponGroup.add(slide);

    const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.05), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    barrel.position.set(0, 0, -0.3);
    weaponGroup.add(barrel);

    const flashGeo = new THREE.PlaneGeometry(0.5, 0.5);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0, side: THREE.DoubleSide });
    const muzzleFlashMesh = new THREE.Mesh(flashGeo, flashMat);
    muzzleFlashMesh.position.set(0, 0, -0.45);
    muzzleFlashMesh.rotation.z = Math.random() * Math.PI;
    weaponGroup.add(muzzleFlashMesh);

    weaponGroup.position.set(0.35, -0.25, -0.5);
    camera.add(weaponGroup);

    return { group: weaponGroup, muzzleFlash: muzzleFlashMesh };
}

/**
 * Initialize flashlight
 */
export function initFlashlight(camera) {
    const flashlight = new THREE.SpotLight(0xffffff, 15);
    flashlight.position.set(0.5, -0.5, 0);
    flashlight.angle = Math.PI / 5;
    flashlight.penumbra = 0.3;
    flashlight.distance = 60;
    flashlight.castShadow = false;
    flashlight.target.position.set(0, 0, -10);
    camera.add(flashlight);
    camera.add(flashlight.target);
    flashlight.visible = false;
    return flashlight;
}

/**
 * Create player entity with all components
 */
export function createPlayer(world, camera, bulletHolePool) {
    const player = world.createEntity();
    world.addComponent(player, 'Position', { x: 0, y: 5, z: 0 });
    world.addComponent(player, 'Velocity', { x: 0, y: 0, z: 0 });
    world.addComponent(player, 'Input', {
        forward: false, backward: false, left: false, right: false,
        jump: false, crouch: false, fire: false, reload: false, flashlight: false,
        jumpWasPressed: false, jumpBufferTime: 0
    });
    world.addComponent(player, 'Collider', {
        width: GAME_CONSTANTS.PLAYER.WIDTH,
        depth: GAME_CONSTANTS.PLAYER.DEPTH,
        height: GAME_CONSTANTS.PLAYER.HEIGHT
    });
    world.addComponent(player, 'PlayerTag', {});
    world.addComponent(player, 'Flags', { onGround: false, lastFootstep: 0 });
    world.addComponent(player, 'Health', {
        current: GAME_CONSTANTS.HEALTH.MAX,
        max: GAME_CONSTANTS.HEALTH.MAX,
        damageQueue: [],
        lastDamageTime: 0
    });

    const weaponObj = initWeapon(camera);
    world.addComponent(player, 'Weapon', {
        ammo: GAME_CONSTANTS.WEAPON.MAGAZINE_SIZE,
        reserveAmmo: GAME_CONSTANTS.WEAPON.RESERVE_AMMO,
        lastShotTime: 0,
        isReloading: false,
        recoil: { x: 0, y: 0, z: 0 },
        targetRecoil: { x: 0, y: 0, z: 0 },
        group: weaponObj.group,
        muzzleFlash: weaponObj.muzzleFlash,
        flashlightPressed: false,
        bulletHolePool: bulletHolePool
    });

    const flashlightObj = initFlashlight(camera);
    world.addComponent(player, 'Flashlight', { object: flashlightObj, isOn: false });

    return player;
}

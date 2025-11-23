import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

import { GAME_CONSTANTS } from './constants.js';
import { SpatialHash } from './core/SpatialHash.js';
import { ObjectPool } from './core/ObjectPool.js';
import { AudioManager } from './core/AudioManager.js';
import { World } from './core/World.js';
import { InputSystem } from './systems/InputSystem.js';
import { MovementSystem } from './systems/MovementSystem.js';
import { PhysicsSystem } from './systems/PhysicsSystem.js';
import { HealthSystem } from './systems/HealthSystem.js';
import { RenderSystem } from './systems/RenderSystem.js';
import { WeaponSystem } from './systems/WeaponSystem.js';
import { createPlayer } from './entities/Player.js';
import { generateMap } from './map/MapGenerator.js';

// ==========================================
// INITIALIZATION
// ==========================================

const spatialHash = new SpatialHash(10);
const audioManager = new AudioManager();
const world = new World();

// ==========================================
// ENGINE SETUP (Three.js)
// ==========================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1f24);
scene.fog = new THREE.FogExp2(0x1a1f24, 0.015);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffaa00, 1);
dirLight.position.set(50, 100, 50);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 50;
dirLight.shadow.camera.bottom = -50;
dirLight.shadow.camera.left = -50;
dirLight.shadow.camera.right = 50;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

// Controls
const controls = new PointerLockControls(camera, document.body);
const overlay = document.getElementById('overlay');

overlay.addEventListener('click', () => {
    controls.lock();
    audioManager.init(); // Initialize audio on user interaction
});
controls.addEventListener('lock', () => overlay.style.opacity = '0');
controls.addEventListener('unlock', () => overlay.style.opacity = '1');

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Bullet hole pool
const bulletHolePool = new ObjectPool(() => {
    const geometry = new THREE.PlaneGeometry(0.2, 0.2);
    const material = new THREE.MeshBasicMaterial({
        color: 0x111111,
        side: THREE.DoubleSide
    });
    const hole = new THREE.Mesh(geometry, material);
    hole.visible = false;
    scene.add(hole);
    return hole;
}, GAME_CONSTANTS.POOL.BULLET_HOLES);

// ==========================================
// MAP GENERATION
// ==========================================

generateMap(scene, spatialHash);

// ==========================================
// INPUT STATE
// ==========================================

const keyState = {};
const mouseState = { left: false };
document.addEventListener('keydown', (e) => keyState[e.code] = true);
document.addEventListener('keyup', (e) => keyState[e.code] = false);
document.addEventListener('mousedown', (e) => { if (e.button === 0) mouseState['left'] = true; });
document.addEventListener('mouseup', (e) => { if (e.button === 0) mouseState['left'] = false; });

// ==========================================
// CREATE ENTITIES & ADD SYSTEMS
// ==========================================

const player = createPlayer(world, camera, bulletHolePool);

world.addSystem(InputSystem(world, keyState, mouseState));
world.addSystem(MovementSystem(world, camera, audioManager));
world.addSystem(PhysicsSystem(world, spatialHash));
world.addSystem(HealthSystem(world));
world.addSystem(RenderSystem(world, camera));
world.addSystem(WeaponSystem(world, camera, scene, audioManager));

// ==========================================
// MAIN LOOP (Fixed Timestep)
// ==========================================

const clock = new THREE.Clock();
let frameCount = 0;
let lastTime = 0;
let accumulator = 0;
const fixedDt = GAME_CONSTANTS.PHYSICS.FIXED_TIMESTEP;

function animate() {
    requestAnimationFrame(animate);

    const frameStart = performance.now();
    let dt = Math.min(clock.getDelta(), GAME_CONSTANTS.PHYSICS.MAX_TIMESTEP);
    const time = clock.getElapsedTime();

    // Fixed timestep accumulator
    accumulator += dt;

    while (accumulator >= fixedDt) {
        world.update(fixedDt, time);
        accumulator -= fixedDt;
    }

    // Render
    renderer.render(scene, camera);

    // Performance metrics
    const frameEnd = performance.now();
    const frameTime = frameEnd - frameStart;
    const debugFrametimeEl = document.getElementById('debug-frametime');
    if (debugFrametimeEl) {
        debugFrametimeEl.innerText = `Frame: ${frameTime.toFixed(2)}ms`;
    }

    // FPS Counter
    frameCount++;
    if (time - lastTime >= 1.0) {
        const debugFpsEl = document.getElementById('debug-fps');
        if (debugFpsEl) {
            debugFpsEl.innerText = `FPS: ${frameCount}`;
        }
        frameCount = 0;
        lastTime = time;
    }
}

// Start the game
animate();

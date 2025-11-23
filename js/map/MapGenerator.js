import * as THREE from 'three';
import { GAME_CONSTANTS } from '../constants.js';

/**
 * Create procedural textures for map elements
 */
function createTexture(type) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    if (type === 'grid') {
        ctx.fillStyle = '#444';
        ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, 256, 256);
        ctx.fillStyle = '#333';
        ctx.fillRect(8, 8, 240, 240);
    } else if (type === 'crate') {
        ctx.fillStyle = '#a64';
        ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = '#532';
        ctx.lineWidth = 10;
        ctx.strokeRect(0, 0, 256, 256);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(256, 256);
        ctx.moveTo(256, 0);
        ctx.lineTo(0, 256);
        ctx.stroke();
    } else if (type === 'wall') {
        ctx.fillStyle = '#777';
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = '#555';
        ctx.fillRect(0, 240, 256, 16);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.magFilter = THREE.NearestFilter;
    return tex;
}

/**
 * Generate the game map with instanced meshes
 */
export function generateMap(scene, spatialHash) {
    const MAP_SIZE = GAME_CONSTANTS.MAP.SIZE;
    const TILE_SIZE = GAME_CONSTANTS.MAP.TILE_SIZE;

    const floorMat = new THREE.MeshStandardMaterial({ map: createTexture('grid'), roughness: 0.8 });
    const wallMat = new THREE.MeshStandardMaterial({ map: createTexture('wall'), roughness: 0.5 });
    const crateMat = new THREE.MeshStandardMaterial({ map: createTexture('crate') });

    // Instanced Meshes
    const floorGeo = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE);
    floorGeo.rotateX(-Math.PI / 2);
    const wallGeo = new THREE.BoxGeometry(TILE_SIZE, TILE_SIZE * 2, TILE_SIZE);
    const crateGeo = new THREE.BoxGeometry(TILE_SIZE, TILE_SIZE, TILE_SIZE);

    const maxCount = MAP_SIZE * MAP_SIZE;
    const floorMesh = new THREE.InstancedMesh(floorGeo, floorMat, maxCount);
    const wallMesh = new THREE.InstancedMesh(wallGeo, wallMat, maxCount);
    const crateMesh = new THREE.InstancedMesh(crateGeo, crateMat, maxCount);

    floorMesh.receiveShadow = true;
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    crateMesh.castShadow = true;
    crateMesh.receiveShadow = true;

    scene.add(floorMesh);
    scene.add(wallMesh);
    scene.add(crateMesh);

    let floorIdx = 0, wallIdx = 0, crateIdx = 0;
    const dummy = new THREE.Object3D();

    // Generate Map Data
    for (let x = 0; x < MAP_SIZE; x++) {
        for (let z = 0; z < MAP_SIZE; z++) {
            const freq = 0.1;
            const noise = Math.sin(x * freq) * Math.cos(z * freq) + Math.sin((x + z) * 0.2) * 0.5;

            const posX = (x - MAP_SIZE / 2) * TILE_SIZE;
            const posZ = (z - MAP_SIZE / 2) * TILE_SIZE;

            // Always add floor
            dummy.position.set(posX, 0, posZ);
            dummy.rotation.set(0, 0, 0);
            dummy.scale.set(1, 1, 1);
            dummy.updateMatrix();
            floorMesh.setMatrixAt(floorIdx++, dummy.matrix);

            // Walls & Obstacles
            if (x === 0 || x === MAP_SIZE - 1 || z === 0 || z === MAP_SIZE - 1 || noise > 0.8) {
                dummy.position.set(posX, TILE_SIZE, posZ);
                dummy.updateMatrix();
                wallMesh.setMatrixAt(wallIdx++, dummy.matrix);

                spatialHash.insert(new THREE.Box3(
                    new THREE.Vector3(posX - TILE_SIZE / 2, 0, posZ - TILE_SIZE / 2),
                    new THREE.Vector3(posX + TILE_SIZE / 2, TILE_SIZE * 2, posZ + TILE_SIZE / 2)
                ));
            } else if (noise < -0.5 && noise > -0.7) {
                dummy.position.set(posX, TILE_SIZE / 2, posZ);
                dummy.updateMatrix();
                crateMesh.setMatrixAt(crateIdx++, dummy.matrix);

                spatialHash.insert(new THREE.Box3(
                    new THREE.Vector3(posX - TILE_SIZE / 2, 0, posZ - TILE_SIZE / 2),
                    new THREE.Vector3(posX + TILE_SIZE / 2, TILE_SIZE, posZ + TILE_SIZE / 2)
                ));
            }
        }
    }

    floorMesh.count = floorIdx;
    wallMesh.count = wallIdx;
    crateMesh.count = crateIdx;
}

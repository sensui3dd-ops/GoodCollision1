// ==========================================
// SPATIAL HASH (Optimized Collision Detection)
// ==========================================

/**
 * Spatial Hash for O(1) collision checks
 * Divides world into grid cells for efficient proximity queries
 */
export class SpatialHash {
    constructor(cellSize) {
        this.cellSize = cellSize;
        this.cells = new Map();
    }

    _getKey(x, z) {
        return `${Math.floor(x / this.cellSize)},${Math.floor(z / this.cellSize)}`;
    }

    insert(box) {
        const minX = Math.floor(box.min.x / this.cellSize);
        const maxX = Math.floor(box.max.x / this.cellSize);
        const minZ = Math.floor(box.min.z / this.cellSize);
        const maxZ = Math.floor(box.max.z / this.cellSize);

        for (let x = minX; x <= maxX; x++) {
            for (let z = minZ; z <= maxZ; z++) {
                const key = `${x},${z}`;
                if (!this.cells.has(key)) {
                    this.cells.set(key, []);
                }
                this.cells.get(key).push(box);
            }
        }
    }

    query(box) {
        const minX = Math.floor(box.min.x / this.cellSize);
        const maxX = Math.floor(box.max.x / this.cellSize);
        const minZ = Math.floor(box.min.z / this.cellSize);
        const maxZ = Math.floor(box.max.z / this.cellSize);

        const results = new Set();
        for (let x = minX; x <= maxX; x++) {
            for (let z = minZ; z <= maxZ; z++) {
                const key = `${x},${z}`;
                if (this.cells.has(key)) {
                    const cell = this.cells.get(key);
                    for (const item of cell) {
                        results.add(item);
                    }
                }
            }
        }
        return results;
    }

    clear() {
        this.cells.clear();
    }
}

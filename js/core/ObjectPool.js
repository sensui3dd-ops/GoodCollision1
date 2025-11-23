// ==========================================
// OBJECT POOL (Reduce GC Pressure)
// ==========================================

/**
 * Generic object pool for reusable game objects
 */
export class ObjectPool {
    constructor(factory, maxSize = 50) {
        this.factory = factory;
        this.maxSize = maxSize;
        this.available = [];
        this.active = [];
    }

    acquire() {
        let obj;
        if (this.available.length > 0) {
            obj = this.available.pop();
        } else {
            obj = this.factory();
        }
        this.active.push(obj);
        return obj;
    }

    release(obj) {
        const idx = this.active.indexOf(obj);
        if (idx !== -1) {
            this.active.splice(idx, 1);
            if (this.available.length < this.maxSize) {
                this.available.push(obj);
            }
        }
    }

    releaseOldest() {
        if (this.active.length > 0) {
            const obj = this.active.shift();
            if (this.available.length < this.maxSize) {
                this.available.push(obj);
            }
            return obj;
        }
        return null;
    }
}

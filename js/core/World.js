// ==========================================
// 1. ECS CORE (Entity Component System)
// ==========================================

/**
 * ECS World with Query Caching
 * Manages entities, components, and systems with optimized queries
 */
export class World {
    constructor() {
        this.entities = [];
        this.systems = [];
        this.nextId = 0;
        this.entitiesToAdd = [];
        this.entitiesToRemove = new Set();
        this.queryCache = new Map(); // Component signature -> filtered entities
    }

    createEntity() {
        const entity = { id: this.nextId++, components: {} };
        this.entitiesToAdd.push(entity);
        return entity;
    }

    removeEntity(entity) {
        this.entitiesToRemove.add(entity.id);
    }

    addComponent(entity, name, data) {
        entity.components[name] = data;
        this.clearQueryCache(); // Invalidate cache when components change
        return entity;
    }

    addSystem(system) {
        this.systems.push(system);
    }

    /**
     * Query entities with specific components (cached)
     * @param {...string} componentNames - Component names to filter by
     * @returns {Array} Entities matching the query
     */
    query(...componentNames) {
        const signature = componentNames.sort().join(',');

        if (this.queryCache.has(signature)) {
            return this.queryCache.get(signature);
        }

        const results = this.entities.filter(entity =>
            componentNames.every(name => entity.components[name] !== undefined)
        );

        this.queryCache.set(signature, results);
        return results;
    }

    clearQueryCache() {
        this.queryCache.clear();
    }

    update(dt, time) {
        // Flush Adds
        if (this.entitiesToAdd.length > 0) {
            this.entities.push(...this.entitiesToAdd);
            this.entitiesToAdd = [];
            this.clearQueryCache();
            const entCountEl = document.getElementById('ent-count');
            if (entCountEl) entCountEl.innerText = this.entities.length;
        }

        // Flush Removes
        if (this.entitiesToRemove.size > 0) {
            this.entities = this.entities.filter(e => !this.entitiesToRemove.has(e.id));
            this.entitiesToRemove.clear();
            this.clearQueryCache();
            const entCountEl = document.getElementById('ent-count');
            if (entCountEl) entCountEl.innerText = this.entities.length;
        }

        // Run Systems
        for (const system of this.systems) {
            system(this.entities, dt, time);
        }
    }
}

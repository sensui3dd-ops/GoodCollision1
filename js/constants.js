// ==========================================
// GAME CONSTANTS
// ==========================================
export const GAME_CONSTANTS = {
    MAP: {
        SIZE: 64,
        TILE_SIZE: 4
    },
    PHYSICS: {
        GRAVITY: 30.0,
        JUMP_FORCE: 12.0,
        MOVE_SPEED: 15.0,
        AIR_CONTROL: 0.3,
        FRICTION: 10.0,
        FIXED_TIMESTEP: 1 / 60,
        MAX_TIMESTEP: 0.1
    },
    PLAYER: {
        WIDTH: 0.6,
        DEPTH: 0.6,
        HEIGHT: 1.8,
        CROUCH_HEIGHT: 0.9,
        EYE_OFFSET: 0.2,
        JUMP_BUFFER_TIME: 100 // ms
    },
    WEAPON: {
        FIRE_RATE: 150, // ms
        MAGAZINE_SIZE: 12,
        RESERVE_AMMO: 120,
        RELOAD_TIME: 1500, // ms
        DAMAGE: 25,
        MAX_RANGE: 100
    },
    HEALTH: {
        MAX: 100,
        REGEN_DELAY: 5000, // ms
        REGEN_RATE: 5 // per second
    },
    POOL: {
        BULLET_HOLES: 50
    }
};

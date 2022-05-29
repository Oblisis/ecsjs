const Ecs = require('@oblisis/ecsjs');

const world = Ecs.createWorld();

for (var i = 0; i < 10; i++) {
    entityId = Ecs.createEntity(world);

    Ecs.setComponent(world, entityId, 'position',
        {
            x: Math.random() * 100,
            y: Math.random() * 100,
        });

    Ecs.setComponent(world, entityId, 'velocity',
        {
            x: Math.random() - 0.5,
            y: Math.random() - 0.5,
        });
}

const motionQuery = Ecs.createQuery(world,
    {
        all: ['position', 'velocity']
    });

function motion(dt) {
    Ecs.each(world, motionQuery, function(entityId, position, velocity) {
        position.x += velocity.x * dt;
        position.y += velocity.y * dt;
    });
}

const logQuery = Ecs.createQuery(world,
    {
        all: ['position']
    });
    
function log(dt) {
    Ecs.each(world, logQuery, function(entityId, position) {
        console.log(entityId, position);
    });
}

// Main loop
var lastTime = new Date();
while (true) {
    const currentTime = new Date();
    const dt = (currentTime - lastTime) * 1000;

    motion(dt);
    log(dt);

    lastTime = new Date();
}

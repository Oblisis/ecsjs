'use strict';

module.exports = {
    createWorld,
    createEntity,
    removeEntity,
    getEntity,
    getComponents,
    setComponent,
    removeComponent,
    createQuery,
    each,
    matches
};

function createWorld() {
    const world = {
        entities: {},
        entityCount: 0,
        queries: [],
        lastId: 0
    };

    return world;
}

function createEntity(world) {
    const entityId = world.lastId + 1;
    world.lastId = entityId;
    world.entities[entityId] = {};
    world.entityCount += 1;

    return entityId;
}

function removeEntity(world, entityId) {
    delete world[entityId];
    world.entityCount -= 1;

    for (var query of world.queries) {
        if (entityId in query.entities) {
            query.entities.delete(entityId)
        }
    }
}

function getEntity(world, entityId) {
    return world.entities[entityId];
}

function setComponent(world, entityId, componentId, data) {
    const entity = world.entities[entityId];
    const dirty = !(componentId in entity);

    entity[componentId] = data;

    if (dirty) {
        for (var query of world.queries) {
            if (matches(world, entityId, query)) {
                query.entities.add(entityId);
            }
        }
    }
}

function removeComponent(world, entityId, componentId) {
    delete world.entities[entityId][componentId];

    for (var query of world.queries) {
        if (entityId in query.entities ) {
            if (!matches(world, entityId, query)) {
                query.entities.delete(entityId);
            }
        }
    }
}

function getComponents(world, entityId, componentIds) {
    const entity = getEntity(world, entityId);
    const components = [];
    for (const componentId of componentIds) {
        if (componentId in entity) {
            components.push(entity[componentId]);
        } else {
            components.push(null);
        }
    }

    return components;
}

function createQuery(world, params) {
    const query = {
        all: params.all || [],
        any: params.any || [],
        none: params.none || [],
        entities: new Set()
    }

    for (var entityId in world.entities) {
        if (matches(world, entityId, query)) {
            query.entities.add(entityId);
        }
    }

    return query;
}

function each(world, query, handler) {
    const componentIds = [...query.all, ...query.any];

    for (const entityId of query.entities) {
        const components = getComponents(world, entityId, componentIds);
        handler(entityId, ...components);
    }
}

function matches(world, entityId, query) {
    const entity = world.entities[entityId];
    
    for (const component of query.all) {
        if ( !(component in entity) ) {
            return false;
        }
    }

    for (const component of query.none) {
        if (component in entity) {
            return false;
        }
    }

    if (query.any.length > 0) {
        for (const component of query.any) {
            if (component in entity) {
                return true;
            }
        }

        return false;
    }    

    return true;
}
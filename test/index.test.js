var assert = require('assert');
const Ecs = require('../index');

describe('#createWorld()', function() {
    it('returns a new world', function() {
        const world = Ecs.createWorld();
        assert.notEqual(world, null);
    });
});

describe('#createEntity()', function() {
    it('creates a new entity', function() {
        const world = Ecs.createWorld();
        const entityId = Ecs.createEntity(world);
        assert.notEqual(entityId, null);
        assert.equal(world.entityCount, 1);
    });
});

describe('#getEntity()', function() {
    it('gets an entity', function() {
        const world = Ecs.createWorld();
        const entityId = Ecs.createEntity(world);
        const entity = Ecs.getEntity(world, entityId);
        assert.notEqual(entity, null);
    });
});

describe('#setComponent()', function() {
    it('sets a component', function() {
        const world = Ecs.createWorld();
        const entityId = Ecs.createEntity(world);
        Ecs.setComponent(world, entityId, "Test", 1);
        const entity = Ecs.getEntity(world, entityId);

        assert.equal(entity["Test"], 1);
    });
});

describe('#removeComponent()', function() {
    it('removes a component', function() {
        const world = Ecs.createWorld();
        const entityId = Ecs.createEntity(world);
        Ecs.setComponent(world, entityId, "Test", 1);
        const entity = Ecs.getEntity(world, entityId);
        Ecs.removeComponent(world, entityId, "Test");

        assert.equal("Test" in entity, false);
    });
});

describe('#getComponent()', function() {
    var world;
    var entityId;
    
    before(function() {
        world = Ecs.createWorld();
        entityId = Ecs.createEntity(world);
        Ecs.setComponent(world, entityId, "Component1", 1);
        Ecs.setComponent(world, entityId, "Component2", 2);
    });

    it('returns component value if present', function() {
        const [component] = Ecs.getComponents(world, entityId, ['Component1'])
        assert.equal(component, 1);
    })

    it('returns null if not present', function() {
        const [component] = Ecs.getComponents(world, entityId, ['Component3'])
        assert.equal(component, null);
    })

    it('returns multiple', function() {
        const [component1, component3] = Ecs.getComponents(world, entityId, ['Component1', 'Component3'])
        assert.equal(component1, 1);
        assert.equal(component3, null);
    })
});

describe('#createQuery()', function() {
    it('returns a new query', function() {
        const world = Ecs.createWorld();
        const query = Ecs.createQuery(world, {all:["Component1"]});

        assert.equal(query.all[0], 'Component1');
    });
});

describe('#each()', function() {
    var world;

    before(function() {
        world = Ecs.createWorld();
        const entityId = Ecs.createEntity(world);
        Ecs.setComponent(world, entityId, "Component1", 1);
        Ecs.setComponent(world, entityId, "Component2", 2);

        const entityId2 = Ecs.createEntity(world);
        Ecs.setComponent(world, entityId2, "Component2", 2);
        Ecs.setComponent(world, entityId2, "Component3", 3);
    });

    it('returns single entity matching query', function() {
        const query = Ecs.createQuery(world, {all: ['Component1']});

        var count = 0;
        Ecs.each(world, query, function(entityId, c) {
            assert.equal(c, 1);
            count += 1;
        })

        assert.equal(count, 1);
    });

    it('returns all entities matching query', function() {
        const query = Ecs.createQuery(world, {all:['Component2']});

        var count = 0;
        Ecs.each(world, query, function(entityId, c) {
            assert.equal(c, 2);
            count += 1;
        })

        assert.equal(count, 2);
    });

    it('does not return entities that do not match', function() {
        const query = Ecs.createQuery(world, {all:['Component4']});

        var count = 0;
        Ecs.each(world, query, function(entityId, c) {
            count += 1;
        })

        assert.equal(count, 0);
    });
});

describe('#matches()', function() {
    var world;
    var entityId;
    
    before(function() {
        world = Ecs.createWorld();
        entityId = Ecs.createEntity(world);
        Ecs.setComponent(world, entityId, "Component1", 1);
        Ecs.setComponent(world, entityId, "Component2", 1);
    });

    describe('all', function() {
        it('returns true if empty', function() {
            const query = Ecs.createQuery(world, {});
            assert.equal(Ecs.matches(world, entityId, query), true);
        });

        it('returns true if subset of components match', function() {
            const query = Ecs.createQuery(world, {all:['Component1']});
            assert.equal(Ecs.matches(world, entityId, query), true);
        });

        it('returns true if all components match', function() {
            const query = Ecs.createQuery(world, {all:['Component1', 'Component2']});
            assert.equal(Ecs.matches(world, entityId, query), true);
        });

        it('returns false if no components match', function() {
            const query = Ecs.createQuery(world, {all:['Component3']});
            assert.equal(Ecs.matches(world, entityId, query), false);
        });

        it('returns false if one component does not match', function() {
            const query = Ecs.createQuery(world, {all:['Component1', 'Component2', 'Component3']});
            assert.equal(Ecs.matches(world, entityId, query), false);
        });
    });

    describe('any', function() {
        it('returns true if empty', function() {
            const query = Ecs.createQuery(world, {});
            assert.equal(Ecs.matches(world, entityId, query), true);
        });

        it('returns true if all of components match', function() {
            const query = Ecs.createQuery(world, {any:['Component1']});
            assert.equal(Ecs.matches(world, entityId, query), true);
        });

        it('returns true if any of components match', function() {
            const query = Ecs.createQuery(world, {any: ['Component1', 'Component3']});
            assert.equal(Ecs.matches(world, entityId, query), true);
        });

        it('returns false if no components match', function() {
            const query = Ecs.createQuery(world, { any:['Component3']});
            assert.equal(Ecs.matches(world, entityId, query), false);
        });
    });
});
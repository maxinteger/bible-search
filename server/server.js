var R = require('ramda'),
    Hapi = require('hapi'),
    Dogwater = require('dogwater'),
    Mongo = require('sails-mongo');

var server = new Hapi.Server();
server.connection({port: 3000});

server.route({
    method: 'GET',
    path: '/dogs/',
    handler: function (request, reply) {
        console.log();
        reply(request.collections.dogs.find());
    }
});


server.register([{
        register: require('good'),
        options: {
            opsInterval: 1000,
            reporters: [{
                reporter: require('good-console'),
                events: { log: '*', response: '*' }
            }]
        }
    },
    {
        register: require('dogwater'),
        options: {
            adapters: {
                mongo: Mongo
            },
            connections: {
                base: {
                    adapter: 'mongo',
                    url: 'mongodb://localhost:27017/bible'
                }
            },
            models: [{
                identity: 'book',
                connection: 'base',
                attributes: {
                    bible: {
                        collection: 'bible',
                        via: 'book'
                    }
                }
            },{
                identity: 'bible',
                connection: 'base',
                attributes: {
                    testament: 'number',
                    book: {
                        model: 'book'
                    },
                    bookNumber: 'number',
                    verse: 'number',
                    text: 'string',
                    links: 'array'
                }
            }],
            fixtures: []
        }
    }], function (err) {

    if (err) {
        throw err;
    }

    server.start(function () {

        console.log('Server running at:', server.info.uri);
    });
});
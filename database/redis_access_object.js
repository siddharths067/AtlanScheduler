const bluebird = require(`bluebird`);
const redis = require(`redis`);
bluebird.promisifyAll(redis);

const rao = redis.createClient({
    host: "redis"
});

module.exports = rao;
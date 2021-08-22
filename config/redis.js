require('dotenv/config')

module.exports = {
    redisUrl: `redis://${process.env.REDIS_URL}`,
    redisPwd: process.env.REDIS_PASSWORD
}
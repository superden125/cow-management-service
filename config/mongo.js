require('dotenv/config');

const url = process.env.MONGO_URL
const dbName = process.env.MONGO_DB_NAME || 'cow-management-service'

module.exports = {url, dbName}
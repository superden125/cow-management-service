require('dotenv/config')

module.exports = {
    port: process.env.PORT || 3000,
    userAdmin: process.env.USERNAMES,
    passwordAdmin: process.env.PASSWORD
}
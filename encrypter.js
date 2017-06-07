const crypto = require('crypto');

module.exports = (script) => {
    let cipher = crypto.createCipher('aes256', 'dbevolve');
    let crypted = cipher.update(script,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
}
const alfy = require('alfy');
const input = alfy.input;

alfy.config.set('wordOfURL', input);
module.exports = {
    wordOfURL: alfy.config.get('wordOfURL')
};
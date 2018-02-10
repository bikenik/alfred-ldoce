const os = require('os');
const user = os.userInfo();
const { path_to_anki_media } = process.env;
console.log(user);

module.exports = {
  concurrency: 10,
  input: './src/input/' + 'header.json',
  body: './src/input/' + 'body.json',
  fields: {
    headword: 'Headword',
    frequency: 'Frequency',
    audio: 'Audio',
    translation: 'Translation',
    example: 'Example',
    image: 'Image',
    verb_table: 'Verb_table',
    tag: 'Tag'
  },
  get mediaDir() {
    return user.homedir + path_to_anki_media;
  }
};

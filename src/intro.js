'use strict';
const alfy = require('alfy');
const alfredNotifier = require('alfred-notifier');
const headword = `=${alfy.input}`;
const input = alfy.input;
let quickLook = '';

alfy
  .fetch('http://api.pearson.com/v2/dictionaries/ldoce5/entries', {
    query: {
      headword,
      // search,
      audio: 'example',
      limit: 50
    }
  })
  .then(data => {
    const items = data.results.map(x => {
      let currentWord = alfy.input.replace(/\s/g, '-');
      return {
        title: x.headword,
        subtitle: x.part_of_speech,
        arg: x.url,
        valid: true,
        autocomplete: x.headword || '',
        // icon: { path: 'ldoce_words.png' },
        quicklookurl: `https://www.ldoceonline.com/dictionary/${currentWord}`
      };
    });
    alfy.output(items);
  });
module.exports = {
  quickLook: quickLook
};
alfredNotifier();

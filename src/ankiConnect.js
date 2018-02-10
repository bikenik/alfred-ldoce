const Promise = require('promise');
const { XMLHttpRequest } = require('xmlhttprequest');
const { name_of_deck } = process.env;
const chalk = require('chalk');

// ANKI CONNECT

function ankiConnectInvoke(action, version, params) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('error', () =>
      reject('failed to connect to AnkiConnect')
    );
    xhr.addEventListener('load', () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (response.error) {
          throw response.error;
        } else {
          if (response.hasOwnProperty('result')) {
            resolve(response.result);
          } else {
            reject('failed to get results from AnkiConnect');
          }
        }
      } catch (e) {
        reject(e);
      }
    });

    xhr.open('POST', 'http://127.0.0.1:8765');
    xhr.send(
      JSON.stringify({
        action,
        version,
        params
      })
    );
  });
}

async function ankiConnect(output) {
  for (let i = 0; i < output.length; i++) {
    if (output[i].Homnum) {
      output[i].Homnum = output[i].Homnum.toString();
      output[i].Headword = `${output[i].Headword}<span class="HOMNUM-title">${
        output[i].Homnum
      }
    </span>`;
    }
    delete output[i].Inflections; // Can't understood the reason of error without delete
    let outputMe = JSON.stringify(output[i]);
    if (output[i].Definition !== 'notfound' && output[i].Definition !== '') {
      try {
        const result = await ankiConnectInvoke('addNote', 5, {
          note: {
            deckName: name_of_deck,
            modelName: 'Ldoce-Express',
            fields: JSON.parse(outputMe),
            tags: [output[i].Tag]
          }
        });
        console.log(`got ID of notes: ${result}`);
      } catch (e) {
        console.log(`error getting decks: ${e}`);
      }
    }
  }
  console.log(chalk.green('Success! main'));
}
module.exports = ankiConnect;

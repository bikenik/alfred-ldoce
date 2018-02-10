const alfy = require('alfy');
const jsonfile = require('jsonfile');
const fs = require('fs');
const utils = require('./utils.js');
const url = 'http://api.pearson.com' + utils.wordOfURL;
const fileHeader = './src/input/header.json';
const fileBody = './src/input/body.json';
const input = alfy.input;
//'http://api.pearson.com/v2/dictionaries/entries/cqAFVMFB7F'
alfy.fetch(url).then(data => {
  let header = [
    {
      Headword: data.result.headword,
      Brit_audio: data.result.audio[0].url,
      Amer_audio: data.result.audio[1].url,
      Part_of_speech: data.result.part_of_speech,
      Register_label: data.result.register_label
    }
  ];
  if (data.result.run_ons) {
    header[0].Part_of_speech = data.result.run_ons[0].part_of_speech;
  }
  if (data.result.images) {
    header[0].Image = data.result.images[0].url;
  }
  if (data.result.gramatical_info) {
    header[0].Type_of_gramm = data.result.gramatical_info.type;
  }
  if (data.result.lexical_unit) {
    header[0].Lexical_unit = data.lexical_unit;
  }
  if (data.result.homnum) {
    header[0].Homnum = data.result.homnum;
  }
  if (data.result.inflections) {
    header[0].Inflections = data.result.inflections[0];
  }
  if (data.result.geography) {
    header[0].Geography = data.result.geography;
  }

  try {
    fs.unlinkSync(fileBody); // delete file
    console.log('successfully deleted: fileBody');
  } catch (err) {
    // handle the error
  }
  // jsonfile.writeFileSync(file, header, { flag: 'a' })
  jsonfile.writeFile(fileHeader, header, { spaces: 2 }, function(err) {
    // console.error(err);
  });
});

'use strict';
const alfy = require('alfy');
const utils = require('./utils.js');
const jsonfile = require('jsonfile');
const fs = require('fs');
const input = alfy.input;

const url = 'http://api.pearson.com' + utils.wordOfURL;
//'http://api.pearson.com/v2/dictionaries/entries/cqAFpQJ7AM' = roof
const items = [];
alfy.fetch(url).then(data => {
  const $ = data.result;

  if ($.phrasal_verbs) {
    for (let i = 0; i < $.phrasal_verbs.length; i++) {
      if ($.phrasal_verbs[i].senses) {
        for (let z = 0; z < $.phrasal_verbs[i].senses.length; z++) {
          let sense = $.phrasal_verbs[i].senses[z];
          if (sense.examples) {
            items.push({
              title: $.phrasal_verbs[i].headword,
              subtitle: sense.definition[0],
              arg: {
                definition: [
                  `<span class="neutral span">[</span>${
                    $.phrasal_verbs[i].headword
                  }<span class="neutral span">] </span>${sense.definition}`
                ],
                examples: sense.examples,
                sense: sense
              },
              text: {
                copy: sense.definition[0],
                largetype: sense.examples[0].text
              },
              icon: { path: './icons/phrasal_verbs.png' }
            });
          }
          if (sense.gramatical_examples) {
            for (let x = 0; x < sense.gramatical_examples.length; x++) {
              if (sense.gramatical_examples[x].examples) {
                items.push({
                  title: sense.gramatical_examples[x].pattern,
                  subtitle: sense.definition[0],
                  arg: {
                    examples: sense.gramatical_examples[x].examples,
                    definition: [
                      `<span class="neutral span">[</span>${
                        $.phrasal_verbs[i].headword
                      }<span class="neutral span">] </span>> ${
                        sense.definition
                      } [${sense.gramatical_examples[x].pattern}]`
                    ],
                    sense: sense
                  },
                  text: {
                    copy: sense.gramatical_examples[x].examples[0].text,
                    largetype: sense.gramatical_examples[x].examples[0].text
                  },
                  valid: true,
                  icon: { path: './icons/gramatical.png' }
                });
              }
            }
          }
        }
        if ($.phrasal_verbs[i].variants) {
          items[items.length - 1].arg.sense.variants =
            $.phrasal_verbs[i].variants;
        }
      }
    }
  }

  const elements = [];
  // elements.push(header);
  for (let i = 0; i < items.length; i++) {
    if (items[i] !== undefined) {
      elements.push(items[i]);
    }
  }
  const variantsToSingleChoose = alfy
    .inputMatches(elements, 'title')
    .map(x => ({
      title: x.title,
      subtitle: x.subtitle,
      arg: JSON.stringify(x.arg, '', 2),
      icon: x.icon,
      text: {
        copy: x.text.copy,
        largetype: x.text.largetype
      },
      variables: {
        word: `${data.result.headword}`
      }
    }));
  alfy.output(variantsToSingleChoose);

  const variantsAll = alfy.inputMatches(elements, 'title').map(x => ({
    arg: x.arg,
    variables: { word: `${data.result.headword}` }
  }));

  let variantsAllExp = [];
  for (let i = 0; i < variantsAll.length; i++) {
    variantsAllExp.push(variantsAll[i].arg);
  }
  alfy.config.set('allPhrases', variantsAllExp);
});

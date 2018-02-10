'use strict';
const alfy = require('alfy');
const utils = require('./utils.js');
const jsonfile = require('jsonfile');
const fs = require('fs');
const input = alfy.input;

const url = 'http://api.pearson.com' + utils.wordOfURL;
const items = [];
alfy.fetch(url).then(data => {
  const $ = data.result;

  if ($.run_ons) {
    for (let i = 0; i < $.run_ons.length; i++) {
      if ($.run_ons[i].examples) {
        items.push({
          title: $.run_ons[i].derived_form,
          subtitle:
            $.run_ons[i].part_of_speech || $.run_ons[i].examples[0].text,
          arg: {
            definition: [
              `${
                $.run_ons[i].derived_form
              }<span class="neutral span"> [</span>${
                $.run_ons[i].part_of_speech
              }<span class="neutral span">]</span>`
            ],
            examples: $.run_ons[i].examples,
            sense: $.run_ons[i]
          },
          $,
          text: {
            copy: $.run_ons[i].examples[0].text,
            largetype: $.run_ons[i].examples[0].text
          },
          icon: { path: './icons/runon.png' }
        });
      }
    }
  }
  if ($.senses) {
    for (let i = 0; i < $.senses.length; i++) {
      let sense = $.senses[i];
      if (sense.examples !== undefined && sense.lexical_unit) {
        items.push({
          title: sense.signpost || sense.lexical_unit || $.headword,
          subtitle: sense.definition[0],
          arg: {
            definition: [
              `${sense.lexical_unit}<span class="neutral span"> [</span>${
                sense.definition
              }<span class="neutral span">]</span>`
            ],
            examples: sense.examples,
            sense: sense
          },
          text: {
            copy: sense.definition[0],
            largetype: sense.examples[0].text
          },
          icon: { path: './icons/flag.png' }
        });
      }
      if (sense.examples !== undefined && !sense.lexical_unit) {
        items.push({
          title: sense.signpost || $.headword || sense.definition[0],
          subtitle: sense.definition[0],
          arg: {
            definition: sense.definition,
            examples: sense.examples,
            sense: sense
          },
          text: {
            copy: sense.definition[0],
            largetype: sense.examples[0].text
          },
          icon: { path: './icons/flag.png' }
        });
      }

      if (sense.gramatical_examples) {
        for (let x = 0; x < sense.gramatical_examples.length; x++) {
          if (sense.gramatical_examples[x].examples) {
            items.push({
              title:
                sense.gramatical_examples[x].pattern ||
                sense.signpost ||
                sense.definition[0],
              subtitle: sense.definition[0],
              arg: {
                examples: sense.gramatical_examples[x].examples,
                definition: [
                  `${sense.definition}<span class="neutral span"> [</span>${
                    sense.gramatical_examples[x].pattern
                  }<span class="neutral span">]</span>`
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

      if (sense.collocation_examples) {
        for (let y = 0; y < sense.collocation_examples.length; y++) {
          if (sense.collocation_examples[y].example.text !== undefined) {
            items.push({
              title:
                sense.collocation_examples[y].collocation ||
                sense.definition[0],
              subtitle: sense.definition[0],
              arg: {
                examples: [sense.collocation_examples[y].example],
                definition: [
                  `${sense.definition}<span class="neutral span"> [</span>${
                    sense.collocation_examples[y].collocation
                  }<span class="neutral span">]</span>`
                ],
                sense: sense
              },
              text: {
                copy: sense.collocation_examples[y].example.text,
                largetype: sense.collocation_examples[y].example.text
              },
              // valid: false,
              autocomplete: sense.collocation_examples[y].collocation,
              icon: { path: './icons/collocation.png' }
            });
          }
        }
      }
    }
  }

  const elements = [];
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
      },
      quicklookurl: `https://www.ldoceonline.com/dictionary/${data.result.headword.replace(
        /\s/g,
        '-'
      )}`
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

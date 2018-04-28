# alfred-ldoce-express [![Build Status](https://travis-ci.org/bikenik/alfred-ldoce.svg?branch=master)](https://travis-ci.org/bikenik/alfred-ldoce)

> [Alfred 3](https://www.alfredapp.com) workflow to quick look of Longman dictionary and creating [Anki](https://apps.ankiweb.net) cards.

![Search by headword and across all entries](./media-readme/main-window.png)

![Use [⌘L] for more info by large text and copy it](./media-readme/largeText.png)

![Create, choose and delete your decks in Anki](./media-readme/mods.png)

## Description

The search, `ldoce <query>`, uses [Pearson's API](http://developer.pearson.com/apis/dictionaries) to hunt for headwords and senses that match `headeword/<query>`. 25 results are retrieved by default for headword search.
This workflow searches from Longman Dictionary of Contemporary English (5th edition)[ldoce5 - API]. And creates Anki cards by your choices (if an article of the current word in this API not existing audio examples the Alfred will create audio examples from [Oddcast](http://www.oddcast.com/demos/tts/tts_example.php?clients). [uses random voices: Julie, Kate, James]

## Install

```
$ npm install --global alfred-ldoce
```

* Download and import the [deck example](https://github.com/bikenik/alfred-ldoce/blob/master/Ldoce-Express.apkg) for Anki to install template for this grabbing from ldoce Api.

_Requires: [Node.js](https://nodejs.org) 7.6+, Alfred [Powerpack](https://www.alfredapp.com/powerpack/), [Anki](https://apps.ankiweb.net) intelligent flash cards, [AnkiConnect](https://ankiweb.net/shared/info/2055492159) plugin for Anki._

## Usage
[video presentation](https://youtu.be/MD6wpJJIzHc)

##### In Alfred, type `ldoce`, <kbd>Enter</kbd>, and your query.

* `ldoce <query>` 
  — Show list of headwords 
  - `⇥`, `↩` or `⌘+NUM`
  — Show senses of selected headword 
  - `⌥+↩` — Show phrasal verbs for selected headword if exist (for verbs only). If item not found, in Alfred, type **`ldl`** (last query) to go to the last query of current verb 
  - `⇧` or `⌘+Y` 
  — Show Quick Look preview from [ldoceonline.com/dictionary/query](https://www.ldoceonline.com)
* `<query>` 
— Search for previous matching `ldoce <query>`
  * `⇥`, `↩` or `⌘+NUM` or click — select to choose sense for creating card
  * `⌘+L` — Show one of example sentences in Alfred's Large Type window
  * `⌘+↩` — create card from selected senses of word
  * `⌥+↩` — create card from all matching of current query
* `<!set> or <!del>` — Choose, create or delete deck for Anki
* If you notice this sign [ 🔦 ] it means the current deffinition exist additional words for search. Hit ( ⌥+⌅ ) to show and search by this words.


**Note:** OS X's "delete word" shortcut ( `⌥+⌫` ) is very handy for backing out of a current search result.

## notation conventions

![regular headword](./media-readme/flag@01.png)
: Regular

![gramatical example](./media-readme/gramatical@01.png)
: Gramatical

![phrasal verb](./media-readme/phrasal_verbs@01.png)
: Phrasal verbs

![collocation](./media-readme/collocation@01.png)
: Collocation

![runon](./media-readme/runon@01.png)
: Run-on sentences

## Configuration

* There is three options: 
	- `language`: [Choose your language](https://cloud.google.com/translate/docs/languages) (it use google-translate-api). 
	- `path_to_anki-media`: by default don't need to.

### ToDo

- [ ] Update Readme
- [ ] tests

## License

MIT © [bikeNik](https://github.com/bikenik)

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=VGQSA6T7M8YD8)
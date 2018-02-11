# alfred-ldoce-express [![Build Status](https://travis-ci.org/bikeNik/alfred-ldoce.svg?branch=master)](https://travis-ci.org/bikeNik/alfred-ldoce)

> [Alfred 3](https://www.alfredapp.com) workflow to quick look of Longman dictionary and creating [Anki](https://apps.ankiweb.net) cards.

![Alt text](https://monosnap.com/file/0FutYvzGRaSWQQonXZnNdTh3ncvnGz.png)

## Description

The search, `ldoce <query>`, uses [Pearson's API](http://developer.pearson.com/apis/dictionaries) to hunt for headwords and senses that match `headeword/<query>`. 25 results are retrieved by default for headword search.
It searches only those headwords which has audio in examples. So it's express search dictionary.

## Install

```
$ npm install --global alfred-ldoce
```

* Download and import the [deck example](https://github.com/bikenik/alfred-ldoce/blob/master/Ldoce-Express.apkg) for Anki to install template for this grabbing from ldoce Api.

_Requires: [Node.js](https://nodejs.org) 4+, Alfred [Powerpack](https://www.alfredapp.com/powerpack/), [Anki](https://apps.ankiweb.net) intelligent flash cards, [AnkiConnect](https://ankiweb.net/shared/info/2055492159) plugin for Anki._

## Usage
[video presentation](https://youtu.be/MD6wpJJIzHc)

##### In Alfred, type `ldoce`, <kbd>Enter</kbd>, and your query.

* `ldoce <query>` 
  — Show list of headwords 
  - `⇥`, `↩` or `⌘+NUM` 
  - Show senses of selected headword 
  - `⌥+↩` - Show phrasal verbs for selected headword if exist (for verbs only). If item not found, in Alfred, type **`ldl`** (last query) to go to the last query of current verb 
  - `⇧` or `⌘+Y` 
  - Show Quick Look preview from [ldoceonline.com/dictionary/query](https://www.ldoceonline.com)
* `<query>` 
— Search for previous matching `ldoce <query>`
  * `↩` or `⌘+NUM` or click - select to choose sense for creating card
  * `⌘+L` — Show one of example sentences in Alfred's Large Type window
  * `⌘+↩` — create card from selected senses of word
  * `⌥+↩` - create card from all matching of current query

**Note:** OS X's "delete word" shortcut (`⌥+⌫`) is very handy for backing out of a current search result.

## notation conventions

![regular headword](https://monosnap.com/file/KV6vraTFJHThTFsQeoQwtisUMBDrC3.png)
: Regular

![gramatical example](https://monosnap.com/file/HZt858KXy398FSU5YBGJZo3mhXgmuh.png)
: Gramatical

![phrasal verb](https://monosnap.com/file/4TY1QQIqzS4WKqqcnVEfgarEFTHq74.png)
: Phrasal verbs

![collocation](https://monosnap.com/file/OaTcAp1VMGkRJhyYYItkhtXGWlNaLG.png)
: Collocation

![runon](https://monosnap.com/file/AcL3WjZvjmZBBCJyYYTs54zFqnmY3y.png)
: Run-on sentences

## Configuration

* There is three options: 
	- `language`: [Choose your language](https://cloud.google.com/translate/docs/languages) (it use google-translate-api). 
	- `name_of_deck`: Change the name of pre-built deck if necessary. 
	- `path_to_anki-media`: by default don't need to.

## License

MIT © [bikeNik](https://github.com/bikenik)

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=VGQSA6T7M8YD8)
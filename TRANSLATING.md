# Translating club-QuickBox

club-QuickBox speaks your language. The skin ships its own string catalog and a translation for each of QuickBox's supported languages, and you are welcome to add more.

## Shipped languages

The skin ships these seven languages today:

| Code | Language |
|---------|----------------------|
| `en` | English (the base catalog) |
| `da` | Danish |
| `de` | German |
| `es` | Spanish |
| `fr` | French |
| `pt-br` | Portuguese (also served for `pt-pt`) |
| `zh-cn` | Chinese (Simplified) |

## How the language is chosen

The skin follows ruTorrent's own language, the one you pick in ruTorrent's Settings under Interface.

When you load ruTorrent, the skin first loads `lang/en.js` (the full catalog) and then loads `lang/<code>.js` for your active language, so a translation only ever has to cover what it translates.

Anything a translation does not define falls back to the English string, so a partial translation is still safe to ship and nothing ever renders blank.

## Adding a language

Pick your ruTorrent language code (the same code ruTorrent uses for its own `lang/<code>.js` file, for example `it` for Italian or `nl` for Dutch).

Copy `lang/en.js` to `lang/<code>.js` and translate the values only.

Keep every key exactly as it is, keep the keys in the same order, and keep the surface comments so the next translator can find things.

Leave placeholders untouched: tokens like `{browse}`, `{name}`, `{n}` and `{HASH}`, HTML entities, keyboard names such as `Ctrl K` and `Esc`, and product names such as club-QuickBox, QuickBox, ruTorrent, rTorrent and MediaInfo all stay as written.

Run `sh bin/check-lang.sh` and make sure it prints `LANG OK`; it fails if your file is missing a key or carries one that English does not have.

Test it live by switching ruTorrent's language to yours and hard-refreshing the browser so the new file loads.

One thing to know: a new language only loads once its code is added to the `LANG_SUPPORTED` list in `init.js` (line 74). A maintainer adds it there when your translation is merged, so until then you can test your file by temporarily adding your code to that list in your own copy.

## Submitting a language

Open a pull request against the `development` branch of `QuickBox/club-QuickBox` with your new `lang/<code>.js` file.

If you do not use git, open an issue instead and attach the file; a maintainer will add it for you.

Either way, thank you for helping club-QuickBox reach more people.

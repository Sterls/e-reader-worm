# Credits

## Word list
The game's dictionary (`public/words.txt`) is built from **ENABLE**
(Enhanced North American Benchmark Lexicon), which its authors placed in the
**public domain**. That means it can be used freely, including in a commercial
game, with no licence fee and no attribution required (we credit it anyway).

- Copy used: https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt
- Rebuild with: `node scripts/build-words.mjs path/to/enable1.txt` (keeps words of 3 to 15 letters)

## Sounds
All sound effects are generated in code at runtime (Web Audio API). There are no audio files.

## Art
The mascot, icon and tile art are original and drawn in code / SVG for this game.

## Fonts
The game uses the device's built-in fonts. No font files are bundled.

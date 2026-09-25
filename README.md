# Build While Bleeding

Build While Bleeding is the front door for RyanrealAF's independent creative and technical projects.

## Projects

- Hardwire: Music theory for the streets.
- Seuss: A formal theory library exploring rhythm, meter, rhyme, and transfer.
- The Leak Report: An educational field manual for listening beneath the words.
- Cartography: Writings, songs, PSAs, and the broader creative archive.

## Site architecture

- / = Build While Bleeding
- /hardwire = Hardwire
- /library/seuss = Seuss
- /the-leak-report = The Leak Report
- /cartography = Cartography

Each project remains independently developed and deployable. Build While Bleeding provides the public front door and routing layer.

## Development

    npm install
    npm run dev

The starter intentionally contains no database, authentication, or shared runtime dependency on the project repositories.

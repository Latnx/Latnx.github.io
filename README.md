# latnx.github.io

Hugo site using the pinned Blowfish theme.

## Obsidian Notes

`Obsidian/` contains the original notes and attachments. Edit those source files,
then run the importer to update the website:

```sh
npm ci
npm test
npm run import:obsidian
```

The importer generates the Notes section at `/docs/notes/`, preserves the source
folders as categories, and converts Obsidian links, image embeds, and diagrams.
Generated pages are in `content/docs/notes/`; attachments are in `static/obsidian/`.
Do not edit generated pages directly.

## Preview

Install Node.js 22 or later and Hugo Extended 0.166.0, then run:

```sh
git submodule update --init --depth 1
npm ci
npm run import:obsidian
hugo server
```

Open `http://localhost:1313/docs/notes/`.

## Publish

Push to `main` to run the importer tests, regenerate the notes, build Hugo, and
deploy to GitHub Pages through `.github/workflows/hugo.yml`.

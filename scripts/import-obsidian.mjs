import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import YAML from 'yaml';

const parser = unified().use(remarkParse).use(remarkGfm).use(remarkFrontmatter, ['yaml']);
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultRoot = path.dirname(scriptDirectory);
const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif', '.bmp']);
const headingRepairs = new Map([
  ['面试/数据库/Redis/02 数据类型.md#4. 哈希表 Dict', '4. 哈希表 Hashtable'],
]);
const noteCoverFamilies = Object.freeze({
  algorithms: ['img/note-covers/algorithms-a.webp', 'img/note-covers/algorithms-b.webp'],
  backend: ['img/note-covers/backend.webp'],
  data: ['img/note-covers/data-a.webp', 'img/note-covers/data-b.webp'],
  knowledge: ['img/note-covers/knowledge.webp'],
  network: ['img/note-covers/network-a.webp', 'img/note-covers/network-b.webp'],
  programming: ['img/note-covers/programming-a.webp', 'img/note-covers/programming-b.webp'],
  research: ['img/note-covers/research.webp'],
  systems: ['img/note-covers/systems.webp'],
});

const hash = (value) => createHash('sha256').update(value).digest('hex').slice(0, 16);
const key = (value) => value.normalize('NFC').toLowerCase();
const encodeSegment = (value) => encodeURIComponent(value).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
const escapeHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const escapeLabel = (value) => value.replace(/[\\[\]]/g, '\\$&').replaceAll('\n', ' ');
const normalizeHeading = (value) => key(value.trim().replace(/\s+/g, ' '));

function coverFamily(relative) {
  const scope = `${key(relative).replaceAll('\\', '/').replace(/\.md$/, '')}/`;
  if (scope.startsWith('leetcode/') || scope.startsWith('面试题/数据结构/')) return 'algorithms';
  if (scope.startsWith('面试/数据库/') || /^面试题\/(?:mysql|redis)\//.test(scope)) return 'data';
  if (scope.startsWith('面试/网络/') || scope.startsWith('面试题/计算机网络/') || scope.startsWith('无线电/')) return 'network';
  if (scope.startsWith('面试/ai/') || scope.startsWith('论文/') || scope.startsWith('开题')) return 'research';
  if (scope.startsWith('项目/') || scope.startsWith('实习/') || scope.startsWith('面试/场景题/') || scope.startsWith('面试/消息队列/') || scope.startsWith('面试题/kafka/') || scope.startsWith('swagger/')) return 'backend';
  if (scope.startsWith('linux/') || scope.startsWith('面试/os/') || scope.startsWith('面试/docker/') || scope.startsWith('docker/') || scope.startsWith('git/') || scope.startsWith('vscode ')) return 'systems';
  if (scope.startsWith('面试/java/') || scope.startsWith('面试/golang/') || scope.startsWith('面试题/go/')) return 'programming';
  return 'knowledge';
}

export const noteCoverPaths = Object.freeze(Object.values(noteCoverFamilies).flat());

export function coverForNote(relative) {
  const covers = noteCoverFamilies[coverFamily(relative)];
  const variant = Number.parseInt(hash(relative).slice(0, 8), 16) % covers.length;
  return covers[variant];
}

function metadataValue(metadata, name) {
  if (Object.hasOwn(metadata, name)) return metadata[name];
  return Object.entries(metadata).find(([candidate]) => key(candidate) === key(name))?.[1];
}

function withoutMetadataKeys(metadata, names) {
  const omitted = new Set(names.map(key));
  return Object.fromEntries(Object.entries(metadata).filter(([name]) => !omitted.has(key(name))));
}

function socialImages(metadata, featureimage) {
  const configured = metadataValue(metadata, 'images');
  if (Array.isArray(configured)) {
    const images = configured.filter((image) => typeof image === 'string' && image.trim()).map((image) => image.trim());
    if (images.length) return images;
  }
  if (typeof configured === 'string' && configured.trim()) return [configured.trim()];
  return [featureimage];
}

async function featureImageForNote(root, note) {
  const configured = metadataValue(note.metadata, 'featureimage');
  if (typeof configured !== 'string' || !configured.trim()) return coverForNote(note.relative);
  const value = configured.trim();
  if (/^https?:\/\//i.test(value)) return value;
  const resource = value.replaceAll('\\', '/').replace(/^\/+/, '').replace(/^assets\//i, '');
  if (!imageExtensions.has(path.posix.extname(resource).toLowerCase())) return coverForNote(note.relative);
  const assetsRoot = path.resolve(root, 'assets');
  const candidate = path.resolve(assetsRoot, resource);
  if (!candidate.startsWith(`${assetsRoot}${path.sep}`)) return coverForNote(note.relative);
  try {
    if ((await fs.stat(candidate)).isFile()) return resource;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  return coverForNote(note.relative);
}

function visit(node, callback) {
  callback(node);
  for (const child of node.children ?? []) visit(child, callback);
}

function plainText(node) {
  if (node.type === 'image') return node.alt ?? '';
  if (typeof node.value === 'string') return node.value;
  return (node.children ?? []).map(plainText).join('');
}

async function listFiles(directory, prefix = '') {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    if (entry.name.startsWith('.')) continue;
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await listFiles(path.join(directory, entry.name), relative));
    else if (entry.isFile()) files.push(relative);
    else throw new Error(`Unsupported symbolic link or special file: ${relative}`);
  }
  return files;
}

function directoryRoute(relative) {
  if (!relative || relative === '.') return '';
  return relative.split('/').map((_, index, parts) => `d-${hash(parts.slice(0, index + 1).join('/'))}`).join('/');
}

export function noteRoute(relative) {
  const directory = directoryRoute(path.posix.dirname(relative));
  return `/docs/notes/${directory ? `${directory}/` : ''}n-${hash(relative)}/`;
}

function inspectNote(relative, source) {
  const tree = parser.parse(source);
  const frontmatter = tree.children.find((node) => node.type === 'yaml' && node.position.start.offset === 0);
  const metadata = frontmatter ? YAML.parse(frontmatter.value) ?? {} : {};
  if (typeof metadata !== 'object' || Array.isArray(metadata)) throw new Error(`Invalid frontmatter in ${relative}`);
  const headings = [];
  visit(tree, (node) => {
    if (node.type !== 'heading') return;
    const label = plainText(node).replace(/\s+\{#[^}]+\}\s*$/, '').trim();
    const existing = /\{#([^}]+)\}\s*$/.exec(source.slice(node.position.start.offset, node.position.end.offset));
    headings.push({ label, id: existing?.[1] ?? `h-${hash(`${relative}#${label}#${headings.length}`)}`, node, existing: Boolean(existing) });
  });
  return { relative, source, tree, frontmatter, metadata, headings, url: noteRoute(relative) };
}

export async function createVault(sourceDirectory) {
  const files = await listFiles(sourceDirectory);
  const notes = new Map();
  const assets = new Map();
  const index = new Map();
  function indexFile(alias, relative) {
    const normalized = key(alias);
    if (!index.has(normalized)) index.set(normalized, new Set());
    index.get(normalized).add(relative);
  }
  for (const relative of files) {
    if (path.posix.extname(relative).toLowerCase() === '.md') {
      notes.set(relative, inspectNote(relative, await fs.readFile(path.join(sourceDirectory, relative), 'utf8')));
    } else {
      assets.set(relative, `/obsidian/${hash(relative)}/${encodeSegment(path.posix.basename(relative))}`);
    }
    indexFile(relative, relative);
    indexFile(path.posix.basename(relative), relative);
    if (notes.has(relative)) {
      indexFile(relative.slice(0, -3), relative);
      indexFile(path.posix.basename(relative, path.posix.extname(relative)), relative);
    }
  }
  return { sourceDirectory, notes, assets, index, files, usedAssets: new Set(), unresolved: [], repairedReferences: [] };
}

function resolveFile(vault, note, target) {
  const decoded = decodeURIComponent(target).replaceAll('\\', '/');
  if (!decoded) return { relative: note.relative };
  const candidate = path.posix.normalize(path.posix.join(path.posix.dirname(note.relative), decoded));
  for (const direct of [candidate, `${candidate}.md`, decoded.replace(/^\//, ''), `${decoded.replace(/^\//, '')}.md`]) {
    if (vault.notes.has(direct) || vault.assets.has(direct)) return { relative: direct };
  }
  const matches = vault.index.get(key(decoded));
  if (matches?.size === 1) return { relative: [...matches][0] };
  return { error: matches?.size > 1 ? 'ambiguous-file' : 'missing-file', candidates: matches ? [...matches] : [] };
}

function sourceLine(note, offset) {
  return note.source.slice(0, offset).split('\n').length;
}

function isolateBlockImage(source, start, end, html) {
  const lineStart = source.lastIndexOf('\n', start - 1) + 1;
  const nextNewline = source.indexOf('\n', end);
  const lineEnd = nextNewline < 0 ? source.length : nextNewline;
  const prefix = source.slice(lineStart, start);
  const suffix = source.slice(end, lineEnd);
  if (!/^(?:[ \t]*>[ \t]*)*(?:[ \t]*(?:[-+*]|\d+[.)])[ \t]+)?[ \t]*$/.test(prefix) || suffix.trim()) return html;
  const continuation = prefix.replace(/(?:[-+*]|\d+[.)])[ \t]+$/, (marker) => ' '.repeat(marker.length));
  // Blank container lines end CommonMark HTML blocks without breaking lists or quotes.
  return `\n${continuation}${html}\n${continuation}`;
}

function resolveUrl(vault, note, rawTarget, offset) {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(rawTarget)) return { url: rawTarget, external: true };
  const hashOffset = rawTarget.indexOf('#');
  const fileAndQuery = hashOffset < 0 ? rawTarget : rawTarget.slice(0, hashOffset);
  const queryOffset = fileAndQuery.indexOf('?');
  const target = queryOffset < 0 ? fileAndQuery : fileAndQuery.slice(0, queryOffset);
  const query = queryOffset < 0 ? '' : fileAndQuery.slice(queryOffset);
  const fragment = hashOffset < 0 ? '' : decodeURIComponent(rawTarget.slice(hashOffset + 1));
  const resolved = resolveFile(vault, note, target);
  let error = resolved.error;
  let url;
  if (!error && vault.notes.has(resolved.relative)) {
    const destination = vault.notes.get(resolved.relative);
    url = destination.url;
    if (fragment) {
      const replacement = headingRepairs.get(`${resolved.relative}#${fragment}`);
      const wanted = replacement ?? fragment;
      const heading = destination.headings.find((item) => normalizeHeading(item.label) === normalizeHeading(wanted) || item.id === wanted);
      if (!heading) error = fragment.startsWith('^') ? 'unsupported-block-reference' : 'missing-heading';
      else {
        url += `#${encodeURIComponent(heading.id)}`;
        if (replacement) vault.repairedReferences.push({ source: note.relative, line: sourceLine(note, offset), reference: rawTarget, heading: replacement, url });
      }
    }
  } else if (!error) {
    url = vault.assets.get(resolved.relative) + query + (fragment ? `#${encodeURIComponent(fragment)}` : '');
    vault.usedAssets.add(resolved.relative);
  }
  if (error) {
    vault.unresolved.push({ source: note.relative, line: sourceLine(note, offset), reference: rawTarget, reason: error, ...(resolved.candidates?.length ? { candidates: resolved.candidates } : {}) });
    return { error };
  }
  return { url, relative: resolved.relative, image: imageExtensions.has(path.posix.extname(resolved.relative).toLowerCase()) };
}

function applyEdits(source, edits) {
  let boundary = source.length;
  let result = source;
  for (const edit of edits.sort((a, b) => b.start - a.start || b.end - a.end)) {
    if (edit.end > boundary) throw new Error(`Overlapping Markdown edits at ${edit.start}`);
    result = result.slice(0, edit.start) + edit.value + result.slice(edit.end);
    boundary = edit.start;
  }
  return result;
}

export function convertNote(vault, note) {
  const edits = [];
  const protectedRanges = [];
  const markdownLinks = [];
  const definitions = new Map();
  visit(note.tree, (node) => {
    if (['code', 'inlineCode', 'html', 'yaml'].includes(node.type)) protectedRanges.push([node.position.start.offset, node.position.end.offset]);
    if (node.type === 'code' && node.lang?.toLowerCase() === 'mermaid') {
      edits.push({ start: node.position.start.offset, end: node.position.end.offset, value: `{{< mermaid >}}\n${node.value}\n{{< /mermaid >}}` });
    }
    if (node.type === 'html' && /^<\/?(?:K|package|new)>$/.test(node.value)) {
      edits.push({ start: node.position.start.offset, end: node.position.end.offset, value: escapeHtml(node.value) });
    }
    if (['link', 'image', 'definition', 'linkReference', 'imageReference'].includes(node.type)) markdownLinks.push(node);
    if (node.type === 'definition') definitions.set(node.identifier, node);
  });
  const inProtectedRange = (start, end) => protectedRanges.some(([from, to]) => start < to && end > from);
  for (const match of note.source.matchAll(/%%[\s\S]*?%%/g)) {
    const start = match.index;
    const end = start + match[0].length;
    if (inProtectedRange(start, end)) continue;
    edits.push({ start, end, value: '' });
    protectedRanges.push([start, end]);
  }
  const wikiRanges = [];
  for (const match of note.source.matchAll(/!?\[\[([^\]\n]+)\]\]/g)) {
    const start = match.index;
    const end = start + match[0].length;
    if (inProtectedRange(start, end)) continue;
    let escapes = 0;
    for (let index = start - 1; index >= 0 && note.source[index] === '\\'; index--) escapes++;
    if (escapes % 2) continue;
    const [target, ...aliases] = match[1].split('|');
    const alias = aliases.join('|');
    const embed = match[0].startsWith('!');
    const label = alias || target.replace(/^#/, '') || path.posix.basename(note.relative, '.md');
    const resolved = resolveUrl(vault, note, target.trim(), start);
    let value = escapeLabel(label);
    if (!resolved.error) {
      if (embed && resolved.image) {
        const dimensions = /^(\d+)(?:x(\d+))?$/.exec(alias);
        if (dimensions) {
          value = `<img src="${escapeHtml(resolved.url)}" alt="${escapeHtml(path.posix.basename(resolved.relative))}" width="${dimensions[1]}"${dimensions[2] ? ` height="${dimensions[2]}"` : ''} loading="lazy" style="max-width:100%;height:auto">`;
          value = isolateBlockImage(note.source, start, end, value);
        } else {
          value = `![${escapeLabel(alias || path.posix.basename(resolved.relative))}](${resolved.url})`;
        }
      } else value = `[${escapeLabel(label)}](${resolved.url})`;
    }
    edits.push({ start, end, value });
    wikiRanges.push([start, end]);
  }
  for (const match of note.source.matchAll(/==(?=\S)([^\n]+?)==/g)) {
    const start = match.index;
    const end = start + match[0].length;
    if (inProtectedRange(start, end) || wikiRanges.some(([from, to]) => start < to && end > from)) continue;
    edits.push({ start, end: start + 2, value: '<mark>' });
    edits.push({ start: end - 2, end, value: '</mark>' });
  }
  for (const node of markdownLinks.toReversed()) {
    // GFM-generated external autolinks may not carry source positions.
    if (node.type === 'definition' || !node.position) continue;
    const start = node.position.start.offset;
    const end = node.position.end.offset;
    if (wikiRanges.some(([from, to]) => start < to && end > from) || protectedRanges.some(([from, to]) => start >= from && end <= to)) continue;
    const definition = node.type.endsWith('Reference') ? definitions.get(node.identifier) : node;
    if (!definition) continue;
    const target = definition.url;
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target)) continue;
    const resolved = resolveUrl(vault, note, target, start);
    const isImage = node.type === 'image' || node.type === 'imageReference';
    const labelStart = node.children?.[0]?.position?.start.offset ?? start + 1;
    const labelEnd = node.children?.at(-1)?.position?.end.offset ?? start + 1;
    let label = isImage ? escapeLabel(node.alt ?? '') : note.source.slice(labelStart, labelEnd);
    if (!isImage) {
      // Preserve independently converted nested images and formatting inside link labels.
      const nested = edits.filter((edit) => edit.start >= labelStart && edit.end <= labelEnd);
      label = applyEdits(label, nested.map((edit) => ({ ...edit, start: edit.start - labelStart, end: edit.end - labelStart })));
      for (const edit of nested) edits.splice(edits.indexOf(edit), 1);
    }
    const title = definition.title ? ` "${definition.title.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"` : '';
    edits.push({ start, end, value: resolved.error ? label : `${isImage ? '!' : ''}[${label}](${resolved.url}${title})` });
  }
  for (const heading of note.headings) {
    if (heading.existing) continue;
    const { start, end } = heading.node.position;
    const raw = note.source.slice(start.offset, end.offset);
    const atx = /^(#{1,6})[ \t]+/.test(raw);
    if (atx) {
      const trailing = /[ \t]+#+[ \t]*$/.exec(raw);
      const offset = trailing ? end.offset - trailing[0].length : end.offset;
      edits.push({ start: offset, end: end.offset, value: ` {#${heading.id}}` });
    } else {
      // Inline anchors also work for Setext headings and preserve their source layout.
      const offset = start.offset + raw.indexOf('\n');
      edits.push({ start: offset, end: offset, value: ` <span id="${heading.id}"></span>` });
    }
  }
  if (note.frontmatter) edits.push({ start: note.frontmatter.position.start.offset, end: note.frontmatter.position.end.offset, value: '' });
  return applyEdits(note.source, edits).replace(/^(?:\r?\n)+/, '');
}

function frontmatter(metadata) {
  return `---\n${YAML.stringify(metadata, { lineWidth: 0 })}---\n\n`;
}

function contentPathForUrl(url) {
  return `content${url.replace(/\/$/, '')}.md`;
}

async function safeWrite(root, relative, content) {
  const output = path.resolve(root, relative);
  if (!output.startsWith(`${path.resolve(root)}${path.sep}`)) throw new Error(`Unsafe generated path: ${relative}`);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, content);
}

export async function importVault(root = defaultRoot) {
  const vault = await createVault(path.join(root, 'Obsidian'));
  const outputs = new Map();
  const groups = new Map([['', []]]);
  const pages = [];
  for (const note of vault.notes.values()) {
    const directory = path.posix.dirname(note.relative) === '.' ? '' : path.posix.dirname(note.relative);
    const parts = directory ? directory.split('/') : [];
    for (let index = 1; index <= parts.length; index++) {
      const group = parts.slice(0, index).join('/');
      if (!groups.has(group)) groups.set(group, []);
    }
    groups.get(directory).push(note);
    const title = note.metadata.title || path.posix.basename(note.relative, path.posix.extname(note.relative));
    const featureimage = await featureImageForNote(root, note);
    const showHero = metadataValue(note.metadata, 'showHero');
    const metadata = {
      ...withoutMetadataKeys(note.metadata, ['featureimage', 'images', 'showHero']),
      title,
      url: note.url,
      draft: false,
      featureimage,
      images: socialImages(note.metadata, featureimage),
      showDate: Boolean(note.metadata.date),
      showDateUpdated: false,
      showAuthor: false,
      showHero: typeof showHero === 'boolean' ? showHero : true,
      showReadingTime: false,
      showWordCount: false,
      showTableOfContents: true,
      showEdit: false,
      obsidianSource: note.relative,
    };
    const output = contentPathForUrl(note.url);
    outputs.set(output, frontmatter(metadata) + convertNote(vault, note));
    pages.push({ source: note.relative, output, url: note.url, title, featureimage, headings: note.headings.map(({ label, id }) => ({ label, id })) });
  }
  const groupPages = [];
  for (const directory of groups.keys()) {
    const route = directoryRoute(directory);
    const url = `/docs/notes/${route ? `${route}/` : ''}`;
    const title = directory ? path.posix.basename(directory) : '笔记';
    const featureimage = coverForNote(directory);
    const output = `content/docs/notes/${route ? `${route}/` : ''}_index.md`;
    outputs.set(output, frontmatter({ title, url, featureimage, images: [featureimage], showDate: false, showAuthor: false, showTableOfContents: false, ...(directory ? {} : { weight: 1, cascade: { showDate: false, showDateUpdated: false, showAuthor: false, showViews: false, showLikes: false, showEdit: false } }) }));
    groupPages.push({ source: directory, output, url, title, featureimage });
  }
  const attachmentEntries = [];
  for (const [relative, url] of vault.assets) {
    const data = await fs.readFile(path.join(vault.sourceDirectory, relative));
    const output = `static${decodeURIComponent(url)}`;
    outputs.set(output, data);
    attachmentEntries.push({ source: relative, output, url, referenced: vault.usedAssets.has(relative), sha256: createHash('sha256').update(data).digest('hex') });
  }
  const attachmentFeatureImage = coverForNote('附件');
  outputs.set('content/docs/notes/attachments.md', frontmatter({ title: '附件', url: '/docs/notes/attachments/', featureimage: attachmentFeatureImage, images: [attachmentFeatureImage], showDate: false, showAuthor: false, showHero: false, showTableOfContents: false }) + attachmentEntries.map((item) => `- [${escapeLabel(item.source)}](${item.url})`).join('\n') + '\n');
  const manifest = {
    version: 1,
    generatedBy: 'scripts/import-obsidian.mjs',
    counts: { notes: pages.length, groups: groups.size, attachments: attachmentEntries.length, referencedAttachments: vault.usedAssets.size, unresolvedReferences: vault.unresolved.length, repairedReferences: vault.repairedReferences.length },
    pages,
    groups: groupPages,
    attachments: attachmentEntries,
    unresolvedReferences: vault.unresolved,
    repairedReferences: vault.repairedReferences,
    generatedFiles: [...outputs.keys()].sort(),
  };
  const manifestPath = path.join(root, 'scripts', 'obsidian-manifest.json');
  let previous;
  try { previous = JSON.parse(await fs.readFile(manifestPath, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (previous && previous.generatedBy !== manifest.generatedBy) throw new Error('Unrecognized previous import manifest');
  // Delete only stale files listed by this importer, never entire user directories.
  for (const relative of previous?.generatedFiles ?? []) {
    if (outputs.has(relative)) continue;
    if (!relative.startsWith('content/docs/notes/') && !relative.startsWith('static/obsidian/')) throw new Error(`Unsafe stale output: ${relative}`);
    const output = path.resolve(root, relative);
    const allowedDirectories = ['content/docs/notes', 'static/obsidian'].map((directory) => `${path.resolve(root, directory)}${path.sep}`);
    if (!allowedDirectories.some((directory) => output.startsWith(directory))) throw new Error(`Unsafe stale output: ${relative}`);
    await fs.rm(output, { force: true });
  }
  for (const [relative, content] of outputs) await safeWrite(root, relative, content);
  await safeWrite(root, 'scripts/obsidian-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const manifest = await importVault(process.argv[2] ? path.resolve(process.argv[2]) : defaultRoot);
  console.log(JSON.stringify(manifest.counts, null, 2));
  if (manifest.unresolvedReferences.length) {
    console.error('Unresolved source references were retained as text. See scripts/obsidian-manifest.json.');
    console.error(JSON.stringify(manifest.unresolvedReferences, null, 2));
    process.exitCode = 1;
  }
}

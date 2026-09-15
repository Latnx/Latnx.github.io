import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { convertNote, coverForNote, createVault, importVault, noteCoverPaths, noteRoute } from './import-obsidian.mjs';

async function fixture(t, files) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'obsidian-import-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  for (const [relative, content] of Object.entries(files)) {
    const output = path.join(root, 'Obsidian', relative);
    await fs.mkdir(path.dirname(output), { recursive: true });
    await fs.writeFile(output, content);
  }
  return { root, vault: await createVault(path.join(root, 'Obsidian')) };
}

test('resolves Chinese headings, aliases, width and encoded attachment paths without changing code', async (t) => {
  const { vault } = await fixture(t, {
    '分类/笔记.md': '## 中文标题\n[[#中文标题|返回]]\n![[图 (1).png|320]]\n`![[missing.png]]`\n```md\n[[missing-note]]\n```\n\\[[escaped]]\n',
    'Attachments/图 (1).png': Buffer.from([137, 80, 78, 71]),
  });
  const note = vault.notes.get('分类/笔记.md');
  const result = convertNote(vault, note);
  assert.ok(result.includes(`[返回](${note.url}#${note.headings[0].id})`));
  assert.match(result, /<img src="\/obsidian\/[^/]+\/%E5%9B%BE%20%281%29\.png"[^>]+width="320"/);
  assert.ok(result.includes('`![[missing.png]]`'));
  assert.ok(result.includes('```md\n[[missing-note]]\n```'));
  assert.ok(result.includes('\\[[escaped]]'));
  assert.equal(vault.unresolved.length, 0);
});

test('resolves relative Markdown images, encoded links and references', async (t) => {
  const { vault } = await fixture(t, {
    'folder/source.md': '[another](../other%20note.md#Heading)\n![photo](<../Attachments/a (1).png> "caption")\n[download][document]\n\n[document]: ../Attachments/paper.pdf\n\nhttps://example.com\n',
    'other note.md': '# Heading\nText',
    'Attachments/a (1).png': 'image',
    'Attachments/paper.pdf': 'document',
  });
  const result = convertNote(vault, vault.notes.get('folder/source.md'));
  assert.ok(result.includes(`[another](${noteRoute('other note.md')}#`));
  assert.match(result, /!\[photo\]\(\/obsidian\/[^/]+\/a%20%281%29\.png "caption"\)/);
  assert.match(result, /\[download\]\(\/obsidian\/[^/]+\/paper\.pdf\)/);
  assert.ok(result.includes('https://example.com'));
  assert.equal(vault.unresolved.length, 0);
});

test('block images cannot swallow following Markdown and preserve inline, list and quote placement', async (t) => {
  const { vault } = await fixture(t, {
    'source.md': '![[pic.png|320]]\n## String\n![[pic.png|200]]\n![[pic.png]]\n\nBefore ![[pic.png|100]] after.\n\n- ![[pic.png|90]]\n  **List caption**\n\n> ![[pic.png|80]]\n> **Quote caption**\n',
    'pic.png': 'image',
  });
  const result = convertNote(vault, vault.notes.get('source.md'));
  const tree = unified().use(remarkParse).parse(result);
  const nodes = [];
  const collect = (node) => { nodes.push(node); for (const child of node.children ?? []) collect(child); };
  collect(tree);
  assert.equal(nodes.filter((node) => node.type === 'heading').length, 1);
  assert.equal(nodes.filter((node) => node.type === 'image').length, 1);
  assert.equal(nodes.filter((node) => node.type === 'listItem').length, 1);
  assert.equal(nodes.filter((node) => node.type === 'blockquote').length, 1);
  assert.equal(nodes.filter((node) => node.type === 'strong').length, 2);
  assert.ok(nodes.filter((node) => node.type === 'html').every((node) => !node.value.includes('## String') && !node.value.includes('![') && !node.value.includes('caption')));
  assert.match(result, /Before <img[^\n]+width="100"[^\n]+> after\./);
  assert.match(result, /\n  <img[^\n]+width="90"/);
  assert.match(result, /\n> <img[^\n]+width="80"/);
});

test('ambiguous filenames and absent headings are reported instead of silently linking incorrectly', async (t) => {
  const { vault } = await fixture(t, {
    'source.md': '[[duplicate]]\n[[source#Absent]]\n',
    'one/duplicate.md': '# First',
    'two/duplicate.md': '# Second',
  });
  const result = convertNote(vault, vault.notes.get('source.md'));
  assert.deepEqual(vault.unresolved.map((item) => item.reason), ['ambiguous-file', 'missing-heading']);
  assert.equal(result, 'duplicate\nsource#Absent\n');
});

test('converts linked images and code-formatted link labels without overlapping edits', async (t) => {
  const { vault } = await fixture(t, {
    'source.md': '[![photo](pic.png)](target.md)\n[`target`](target.md)\n\n    [[indented-code]]\n',
    'target.md': '# Target\n',
    'pic.png': 'image',
  });
  const result = convertNote(vault, vault.notes.get('source.md'));
  assert.ok(result.includes(`[![photo](${vault.assets.get('pic.png')})](${noteRoute('target.md')})`));
  assert.ok(result.includes('[`target`](' + noteRoute('target.md') + ')'));
  assert.ok(result.includes('    [[indented-code]]'));
  assert.equal(vault.unresolved.length, 0);
});

test('renders Obsidian comments, highlights, technical placeholders and Mermaid while protecting code', async (t) => {
  const { vault } = await fixture(t, {
    'source.md': '%% [[not a note]] %%\n==important== <K> <br>\n`==code== %%visible%% <K>`\n```mermaid\nflowchart LR\nA["[[label]]"] --> B\n```\n',
  });
  const result = convertNote(vault, vault.notes.get('source.md'));
  assert.ok(result.includes('<mark>important</mark> &lt;K&gt; <br>'));
  assert.ok(result.includes('`==code== %%visible%% <K>`'));
  assert.ok(result.includes('{{< mermaid >}}\nflowchart LR\nA["[[label]]"] --> B\n{{< /mermaid >}}'));
  assert.equal(vault.unresolved.length, 0);
});

test('import is deterministic, preserves dates, copies every attachment and deletes only recorded stale outputs', async (t) => {
  const { root } = await fixture(t, {
    'folder/note.md': '---\ndate: 2026-04-01T13:53:00\ntags: [Redis]\n---\n# Heading\nText\n',
    'plain.md': 'No date.\n',
    'Attachments/unused.docx': Buffer.from([0, 1, 2, 255]),
  });
  const first = await importVault(root);
  const second = await importVault(root);
  assert.deepEqual(second, first);
  assert.deepEqual(first.counts, { notes: 2, groups: 2, attachments: 1, referencedAttachments: 0, unresolvedReferences: 0, repairedReferences: 0 });
  const dated = await fs.readFile(path.join(root, first.pages.find((item) => item.source === 'folder/note.md').output), 'utf8');
  const plain = await fs.readFile(path.join(root, first.pages.find((item) => item.source === 'plain.md').output), 'utf8');
  assert.match(dated, /date: 2026-04-01T13:53:00/);
  assert.match(dated, /featureimage: img\/note-covers\//);
  assert.match(dated, /images:\n  - img\/note-covers\//);
  assert.match(dated, /showHero: true/);
  assert.doesNotMatch(plain, /^date:/m);
  assert.deepEqual(await fs.readFile(path.join(root, first.attachments[0].output)), Buffer.from([0, 1, 2, 255]));
  assert.match(await fs.readFile(path.join(root, 'content/docs/notes/attachments.md'), 'utf8'), /unused\.docx/);
  const manual = path.join(root, 'content/docs/notes/manual.md');
  await fs.writeFile(manual, 'Keep manual content.');
  await fs.rm(path.join(root, 'Obsidian/plain.md'));
  const third = await importVault(root);
  assert.equal(third.counts.notes, 1);
  await assert.rejects(fs.stat(path.join(root, first.pages.find((item) => item.source === 'plain.md').output)), { code: 'ENOENT' });
  assert.equal(await fs.readFile(manual, 'utf8'), 'Keep manual content.');
});

test('assigns stable topic covers and preserves explicit cover and hero choices', async (t) => {
  const { root } = await fixture(t, {
    'LeetCode/001 example.md': '# Algorithm\n',
    '面试/数据库/Redis/cache.md': '# Cache\n',
    '面试/Java/runtime.md': '# Runtime\n',
    'custom.md': '---\nfeatureImage: https://example.com/custom.png\nimages: https://example.com/social.png\nshowhero: false\n---\nCustom.\n',
    'invalid.md': '---\nfeatureimage: /obsidian/missing.png\n---\nFallback.\n',
    'local.md': '---\nfeatureimage: assets/img/custom.webp\n---\nLocal.\n',
  });
  await fs.mkdir(path.join(root, 'assets/img'), { recursive: true });
  await fs.writeFile(path.join(root, 'assets/img/custom.webp'), 'image');
  const first = await importVault(root);
  const bySource = new Map(first.pages.map((page) => [page.source, page]));
  assert.match(bySource.get('LeetCode/001 example.md').featureimage, /^img\/note-covers\/algorithms-[ab]\.webp$/);
  assert.match(bySource.get('面试/数据库/Redis/cache.md').featureimage, /^img\/note-covers\/data-[ab]\.webp$/);
  assert.match(bySource.get('面试/Java/runtime.md').featureimage, /^img\/note-covers\/programming-[ab]\.webp$/);
  assert.equal(bySource.get('custom.md').featureimage, 'https://example.com/custom.png');
  assert.equal(bySource.get('invalid.md').featureimage, 'img/note-covers/knowledge.webp');
  assert.equal(bySource.get('local.md').featureimage, 'img/custom.webp');
  assert.equal(coverForNote('LeetCode/001 example.md'), bySource.get('LeetCode/001 example.md').featureimage);
  assert.match(first.groups.find((group) => group.source === 'LeetCode').featureimage, /^img\/note-covers\/algorithms-[ab]\.webp$/);

  const custom = await fs.readFile(path.join(root, bySource.get('custom.md').output), 'utf8');
  assert.match(custom, /featureimage: https:\/\/example\.com\/custom\.png/);
  assert.match(custom, /images:\n  - https:\/\/example\.com\/social\.png/);
  assert.match(custom, /showHero: false/);
  assert.doesNotMatch(custom, /^featureImage:|^showhero:/m);

  await fs.writeFile(path.join(root, 'Obsidian/LeetCode/002 added later.md'), '# New\n');
  const second = await importVault(root);
  assert.equal(second.pages.find((page) => page.source === 'LeetCode/001 example.md').featureimage, bySource.get('LeetCode/001 example.md').featureimage);
});

test('maps every topic family to its intended cover pool', () => {
  const cases = [
    ['LeetCode/017 并查集.md', /algorithms-[ab]\.webp$/],
    ['项目/后端项目/重试.md', /backend\.webp$/],
    ['面试/数据库/MySQL/3 索引.md', /data-[ab]\.webp$/],
    ['Untitled.md', /knowledge\.webp$/],
    ['面试/网络/应用层/1 HTTP.md', /network-[ab]\.webp$/],
    ['面试/golang/原理/GC.md', /programming-[ab]\.webp$/],
    ['论文/相关工作.md', /research\.webp$/],
    ['Linux/常用命令.md', /systems\.webp$/],
  ];
  for (const [source, expected] of cases) assert.match(coverForNote(source), expected);
});

test('every configured note cover asset exists', async () => {
  const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  await Promise.all(noteCoverPaths.map((cover) => fs.access(path.join(root, 'assets', cover))));
});

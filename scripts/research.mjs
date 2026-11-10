import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSnapshot } from '../lib/schema.mjs';
import { summarizeResearch } from '../lib/research.mjs';
import { buildSite } from '../lib/site.mjs';
import { prepareProposal, candidateForProposal, requestToPatch, reviewProposal, publishProposal } from '../lib/research-workflow.mjs';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const snapshotDirectory = path.join(repository, 'public-data/wop-publication-snapshot-v2');
const usage = `Research workflow (private work files belong under outputs/):
  npm run research -- queue [--status open] [--section processing] [--priority high]
  npm run research -- request request.json --author NAME --out proposal.json
  npm run research -- prepare patch.json --author NAME --out proposal.json
  npm run research -- inspect proposal.json
  npm run research -- preview proposal.json --out outputs/research-preview
  npm run research -- review proposal.json --reviewer NAME --decision approve|request_changes --note TEXT --out review.json
  npm run research -- publish proposal.json --review review.json

prepare accepts {summary, changes:[{wopId, sections?, sources?, evidence?, questions?, reviewSections?}]}.
Sources, evidence and questions are upserted by stable ID. Review the sources and
candidate before approving; the command records a review, it does not perform one.
Publication updates the local snapshot and static site. It does not deploy a website.`;

try {
  const args = process.argv.slice(2);
  const command = args.shift();
  if (!command || command === 'help' || command === '--help') {
    console.log(usage);
  } else {
    const commands = {
      queue: ['status', 'section', 'priority'], request: ['author', 'out'], prepare: ['author', 'out'],
      inspect: [], preview: ['out'], review: ['reviewer', 'decision', 'note', 'out'], publish: ['review']
    };
    if (!Object.hasOwn(commands, command)) throw new Error(`Unknown command ${command}`);
    const input = command === 'queue' ? null : args.shift();
    if (command !== 'queue' && (!input || input.startsWith('--'))) throw new Error('An input JSON file is required');
    const options = {};
    while (args.length) {
      const flag = args.shift();
      const value = args.shift();
      if (!flag?.startsWith('--') || !commands[command].includes(flag.slice(2)) || !value || value.startsWith('--') || Object.hasOwn(options, flag.slice(2))) {
        throw new Error(`Invalid or duplicate option ${flag}`);
      }
      options[flag.slice(2)] = value;
    }
    const snapshot = validateSnapshot(JSON.parse(await fs.readFile(path.join(snapshotDirectory, 'snapshot.json'), 'utf8')));
    const read = async filename => JSON.parse(await fs.readFile(path.resolve(filename), 'utf8'));
    const write = async value => {
      if (!options.out) throw new Error('--out is required');
      const destination = path.resolve(options.out);
      const privateRoot = path.join(repository, 'outputs');
      if (!destination.startsWith(`${privateRoot}${path.sep}`)) throw new Error('Write private workflow artifacts under outputs/; they are excluded from publication');
      await fs.mkdir(path.dirname(destination), { recursive: true });
      const realParent = await fs.realpath(path.dirname(destination));
      const realRoot = await fs.realpath(privateRoot);
      if (realRoot !== privateRoot) throw new Error('outputs/ must be a real private directory, not a symbolic link');
      if (realParent !== realRoot && !realParent.startsWith(`${realRoot}${path.sep}`)) throw new Error('Private output resolves outside outputs/');
      await fs.writeFile(destination, `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' });
      console.log(`Created ${destination}`);
    };
    if (command === 'queue') {
      const questions = snapshot.polymers.flatMap(article => (article.research?.questions || []).map(question => ({
        wopId: article.wopId, name: article.canonicalName, ...question
      }))).filter(question => ['status', 'section', 'priority'].every(key => !options[key] || question[key] === options[key]));
      const rank = { high: 0, normal: 1, low: 2 };
      questions.sort((a, b) => rank[a.priority] - rank[b.priority] || a.wopId.localeCompare(b.wopId));
      console.log(JSON.stringify({ summary: summarizeResearch(snapshot), questions }, null, 2));
    } else {
      const document = await read(input);
      if (command === 'request' || command === 'prepare') {
        const patch = command === 'request' ? requestToPatch(snapshot, document) : document;
        await write(prepareProposal(snapshot, patch, { author: options.author }));
      } else if (command === 'inspect') {
        const candidate = candidateForProposal(snapshot, document);
        console.log(JSON.stringify({ summary: document.summary, author: document.author, changes: document.changes.map(change => ({
          wopId: change.wopId,
          before: snapshot.polymers.find(article => article.wopId === change.wopId),
          after: candidate.polymers.find(article => article.wopId === change.wopId)
        })) }, null, 2));
      } else if (command === 'preview') {
        if (!options.out) throw new Error('--out is required');
        const output = path.resolve(options.out);
        if (path.dirname(output) !== path.join(repository, 'outputs')) throw new Error('Preview must be a direct child of outputs/');
        const result = await buildSite(candidateForProposal(snapshot, document), output, { siteUrl: process.env.WOP_SITE_URL || null });
        console.log(`Candidate preview: ${result.output}`);
      } else if (command === 'review') {
        await write(reviewProposal(snapshot, document, options));
      } else if (command === 'publish') {
        if (!options.review) throw new Error('--review is required');
        const result = await publishProposal({ snapshotDirectory, outputDirectory: path.join(repository, 'dist'), proposal: document,
          review: await read(options.review), siteUrl: process.env.WOP_SITE_URL || null });
        console.log(JSON.stringify(result, null, 2));
      }
    }
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

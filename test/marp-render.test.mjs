import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

test('renders deck with and-e.tech logo', async () => {
  await execFileAsync('npm', ['run', 'build']);
  const html = await readFile('build/index.html', 'utf8');

  assert.match(html, /src="img\/and-e-tech-logo-300\.svg"/);
});

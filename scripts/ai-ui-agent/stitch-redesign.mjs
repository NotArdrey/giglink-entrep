import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();

function parseArgs(argv) {
  const args = {
    apply: false,
    autoMerge: false,
    dryRun: false,
    fullSuite: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--apply') args.apply = true;
    else if (arg === '--auto-merge') args.autoMerge = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--full-suite') args.fullSuite = true;
    else if (arg === '--prompt') args.prompt = argv[++index];
    else if (arg === '--prompt-file') args.promptFile = argv[++index];
    else if (arg === '--source-file') args.sourceFile = argv[++index];
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (args.autoMerge) args.apply = true;
  return args;
}

function usage() {
  return [
    'Usage:',
    '  npm run ai:stitch:redesign -- --prompt "..." --apply',
    '  npm run ai:stitch:redesign -- --prompt-file prompts/redesign.md --auto-merge',
    '  npm run ai:stitch:redesign -- --source-file stitch-output.json --apply',
    '',
    'Stitch sources:',
    '  STITCH_API_URL / STITCH_API_KEY',
    '  STITCH_COMMAND',
    '  STITCH_OUTPUT_PATH',
  ].join('\n');
}

function run(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      env: process.env,
      shell: process.platform === 'win32',
      stdio: options.capture ? ['pipe', 'pipe', 'pipe'] : ['pipe', 'inherit', 'inherit'],
    });

    let stdout = '';
    let stderr = '';
    if (options.input) {
      child.stdin.write(options.input);
    }
    child.stdin.end();

    if (options.capture) {
      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });
    }

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${command} ${args.join(' ')} exited with ${code}${stderr ? `\n${stderr}` : ''}`));
    });
  });
}

async function getPrompt(args) {
  if (args.prompt) return args.prompt;
  if (args.promptFile) return fs.readFile(path.resolve(repoRoot, args.promptFile), 'utf8');
  if (args.sourceFile || process.env.STITCH_OUTPUT_PATH) return '';
  throw new Error('Provide --prompt or --prompt-file.');
}

async function parseJsonOutput(raw, label) {
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`${label} did not return valid JSON: ${error.message}`);
  }
}

async function loadStitchResult(args, prompt) {
  const sourceFile = args.sourceFile || process.env.STITCH_OUTPUT_PATH;
  if (sourceFile) {
    const raw = await fs.readFile(path.resolve(repoRoot, sourceFile), 'utf8');
    return parseJsonOutput(raw, sourceFile);
  }

  if (process.env.STITCH_COMMAND) {
    const commandResult = await run(process.env.STITCH_COMMAND, [], {
      capture: true,
      input: prompt,
    });
    return parseJsonOutput(commandResult.stdout, 'STITCH_COMMAND');
  }

  if (process.env.STITCH_API_URL) {
    const response = await fetch(process.env.STITCH_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(process.env.STITCH_API_KEY ? { authorization: `Bearer ${process.env.STITCH_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        prompt,
        repository: path.basename(repoRoot),
      }),
    });

    const body = await response.text();
    if (!response.ok) {
      throw new Error(`Stitch API returned ${response.status}: ${body}`);
    }
    return parseJsonOutput(body, 'STITCH_API_URL');
  }

  throw new Error('No Stitch source configured. Set STITCH_API_URL, STITCH_COMMAND, STITCH_OUTPUT_PATH, or pass --source-file.');
}

function validateRelativePath(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('Generated file is missing a path.');
  }

  if (path.isAbsolute(filePath)) {
    throw new Error(`Generated path must be relative: ${filePath}`);
  }

  const resolved = path.resolve(repoRoot, filePath);
  const relative = path.relative(repoRoot, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Generated path escapes the repository: ${filePath}`);
  }

  return resolved;
}

async function applyStitchResult(result) {
  if (result.patch) {
    await run('git', ['apply', '--whitespace=nowarn', '-'], { input: result.patch });
  }

  if (Array.isArray(result.files)) {
    for (const file of result.files) {
      const target = validateRelativePath(file.path);
      if (typeof file.content !== 'string') {
        throw new Error(`Generated file content must be a string: ${file.path}`);
      }
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, file.content);
    }
  }

  if (!result.patch && !Array.isArray(result.files)) {
    throw new Error('Stitch result must include either "patch" or "files".');
  }
}

async function gitOutput(args) {
  const result = await run('git', args, { capture: true });
  return result.stdout.trim();
}

async function ensureCleanWorktree() {
  const status = await gitOutput(['status', '--porcelain']);
  if (status) {
    throw new Error('Auto-merge requires a clean worktree. Commit or stash current changes first.');
  }
}

async function runVerification(fullSuite) {
  await run('npm', ['run', 'build']);
  await run('npm', ['run', 'test:e2e:ai-redesign']);
  if (fullSuite) {
    await run('npm', ['run', 'test:e2e']);
  }
}

async function commitAndMerge(branchName, originalBranch, summary) {
  await run('git', ['add', '--all']);
  const status = await gitOutput(['status', '--porcelain']);
  if (!status) {
    console.log('Stitch produced no file changes after verification.');
    await run('git', ['switch', originalBranch]);
    await run('git', ['branch', '-D', branchName]);
    return;
  }

  const message = summary ? `Apply Stitch UI redesign: ${summary}` : 'Apply Stitch UI redesign';
  await run('git', ['commit', '-m', message.slice(0, 180)]);
  await run('git', ['switch', originalBranch]);
  await run('git', ['merge', '--ff-only', branchName]);
  await run('git', ['branch', '-d', branchName]);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const prompt = await getPrompt(args);
  const result = await loadStitchResult(args, prompt);
  const summary = result.summary || 'No Stitch summary provided.';

  console.log(`Stitch result loaded: ${summary}`);

  if (args.dryRun || !args.apply) {
    console.log('Dry run complete. Pass --apply or --auto-merge to write generated UI changes.');
    return;
  }

  if (args.autoMerge) {
    await ensureCleanWorktree();
    const originalBranch = await gitOutput(['branch', '--show-current']);
    if (!originalBranch) {
      throw new Error('Auto-merge requires a named git branch.');
    }

    const branchName = `ai/stitch-redesign-${Date.now()}`;
    await run('git', ['switch', '-c', branchName]);
    await applyStitchResult(result);
    await runVerification(args.fullSuite);
    await commitAndMerge(branchName, originalBranch, result.summary);
    console.log(`Auto-merged verified Stitch redesign into ${originalBranch}.`);
    return;
  }

  await applyStitchResult(result);
  await runVerification(args.fullSuite);
  console.log('Applied Stitch redesign and passed automatic verification.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

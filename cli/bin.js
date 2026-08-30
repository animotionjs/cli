#!/usr/bin/env node

import { exec } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';
import { fileURLToPath } from 'node:url';
import { cancel, confirm, intro, isCancel, outro, spinner, text } from '@clack/prompts';

const execSync = util.promisify(exec);

function copy(from, to) {
	const modulePath = fileURLToPath(import.meta.url);
	const templateDir = path.join(path.dirname(modulePath), from);
	const destinationDir = path.join(process.cwd(), to);
	fs.cpSync(templateDir, destinationDir, { recursive: true });
}

async function main() {
	console.log();

	intro('Welcome to Animotion!');

	const dir = await text({
		message: 'Where should I create your project?',
		placeholder: '(press Enter to use the current directory)'
	});

	if (isCancel(dir)) {
		cancel('Operation cancelled.');
		return process.exit(0);
	}

	let cwd = dir || '.';

	if (fs.existsSync(cwd)) {
		if (fs.readdirSync(cwd).length > 0) {
			const shouldContinue = await confirm({
				message: 'Directory not empty. Continue?'
			});

			if (isCancel(shouldContinue)) {
				cancel('Operation cancelled.');
				return process.exit(0);
			}

			if (!shouldContinue) {
				return process.exit(1);
			}
		}
	}

	const pm = await select({
		message: 'Which package manager do you want to use?',
		options: [
			{ value: 'skip', label: 'Skip', hint: 'I will install dependencies myself' },
			{ value: 'pnpm', label: 'pnpm', hint: 'recommended' },
			{ value: 'npm', label: 'npm' },
			{ value: 'yarn', label: 'yarn' },
			{ value: 'bun', label: 'bun' },
			{ value: 'deno', label: 'deno' }
		]
	});

	const devCommands = { deno: 'deno task dev' };

	if (isCancel(pm)) {
		cancel('Operation cancelled.');
		return process.exit(0);
	}

	copy('../template', cwd);

	// npm ignores .gitignore so the template ships it as ignore
	const ignorePath = path.join(cwd, 'ignore');
	if (fs.existsSync(ignorePath)) {
		fs.renameSync(ignorePath, path.join(cwd, '.gitignore'));
	}

	if (pm !== 'skip') {
		const s = spinner();

		s.start(`Installing dependencies with ${pm}...`);

		try {
			await execSync(`${pm} install`, { cwd });
		} catch (e) {
			console.log();
			console.log(`📦️ ${pm} is required:`);
			console.log(`Install or update ${pm} and try again.`);
			return process.exit(0);
		}

		s.stop('Installed dependencies.');
	}

	outro('Done. 🪄');

	if (pm !== 'skip') {
		console.log('💿️ Start the development server:');
		console.log(devCommands[pm] ?? `${pm} run dev`);
	}

	console.log();
	console.log('💬 Discord');
	console.log('https://joyofcode.xyz/invite');
}

main().catch(console.error);

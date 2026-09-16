#!/usr/bin/env node

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cancel, confirm, intro, isCancel, outro, select, spinner, text } from '@clack/prompts';

function copy(from, to) {
	const modulePath = fileURLToPath(import.meta.url);
	const templateDir = path.join(path.dirname(modulePath), from);
	const destinationDir = path.join(process.cwd(), to);
	fs.cpSync(templateDir, destinationDir, {
		recursive: true,
		filter: (src) => {
			const base = path.basename(src);
			return base !== 'node_modules' && base !== '.svelte-kit';
		}
	});
}

function installDependencies(pm, cwd) {
	return new Promise((resolve, reject) => {
		const child = spawn(pm, ['install'], { cwd, stdio: 'inherit', shell: true });
		child.on('error', reject);
		child.on('close', (code) => {
			if (code === 0) resolve();
			else reject(Object.assign(new Error(`${pm} install exited with code ${code}`), { code }));
		});
	});
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
			await installDependencies(pm, cwd);
		} catch (e) {
			s.stop(`Failed to install dependencies with ${pm}.`);
			console.log();
			if (e?.code === 'ENOENT') {
				console.log(`📦️ ${pm} is required:`);
				console.log(`Install or update ${pm} and try again.`);
			} else {
				console.log(e?.message ?? e);
			}
			return process.exit(1);
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

import {Config} from '@remotion/cli/config';
import {existsSync, readdirSync} from 'node:fs';
import {homedir} from 'node:os';
import {join} from 'node:path';

/**
 * Remotion normally downloads its own Chrome Headless Shell on first render.
 * On machines where that download host is unreachable (offline boxes, locked
 * down CI, proxied sandboxes), point Remotion at a Chrome that is already on
 * disk instead:
 *
 *   REMOTION_BROWSER_EXECUTABLE=/path/to/chrome npx remotion render ...
 *
 * With no env var set we fall back to the Chrome Headless Shell that
 * `npx hyperframes browser ensure` installs (the HyperFrames runtime is part
 * of `make setup`), so both render runtimes share one browser. If neither is
 * present, Remotion keeps its default behaviour and downloads its own.
 */
const fromEnv = process.env.REMOTION_BROWSER_EXECUTABLE?.trim();

const hyperframesChrome = (): string | null => {
	const root = join(homedir(), '.cache', 'hyperframes', 'chrome', 'chrome-headless-shell');
	if (!existsSync(root)) {
		return null;
	}

	// Directory names look like `linux-152.0.7977.30`; prefer the newest.
	for (const version of readdirSync(root).sort().reverse()) {
		for (const platform of ['linux64', 'mac-x64', 'mac-arm64', 'win64']) {
			const binary = join(
				root,
				version,
				`chrome-headless-shell-${platform}`,
				platform === 'win64' ? 'chrome-headless-shell.exe' : 'chrome-headless-shell',
			);
			if (existsSync(binary)) {
				return binary;
			}
		}
	}

	return null;
};

const browserExecutable = fromEnv || hyperframesChrome();

if (browserExecutable) {
	Config.setBrowserExecutable(browserExecutable);
}

import { describe, expect, it } from 'vitest';
import { blocksToNotation } from './rhythm-transform';
import { renderRhythm } from './render-rhythm';

function createHost(): HTMLDivElement {
	const host = document.createElement('div');
	document.body.appendChild(host);
	return host;
}

describe('renderRhythm', () => {
	it('returns null for a zero width host', () => {
		const host = createHost();
		const result = renderRhythm(host, blocksToNotation(['quarter']), { width: 0 });
		expect(result).toBeNull();
		expect(host.querySelector('svg')).toBeNull();
	});

	it('returns null for an empty pattern', () => {
		const host = createHost();
		const result = renderRhythm(host, blocksToNotation([]), { width: 400 });
		expect(result).toBeNull();
	});

	it('renders a single SVG for a pattern', () => {
		const host = createHost();
		const result = renderRhythm(host, blocksToNotation(['quarter', 'eighth', 'eighth']), {
			width: 400,
			accessibleLabel: 'quarter, two eighths',
		});

		expect(result).not.toBeNull();
		expect(host.querySelectorAll('svg')).toHaveLength(1);
		expect(host.querySelector('svg')?.getAttribute('role')).toBe('img');
		expect(host.querySelector('svg')?.getAttribute('aria-label')).toBe('quarter, two eighths');
		expect(host.innerHTML).not.toContain('NaN');
	});

	it('replaces the previous SVG instead of appending on re-render', () => {
		const host = createHost();
		renderRhythm(host, blocksToNotation(['eighth', 'eighth']), { width: 400 });
		renderRhythm(host, blocksToNotation(['sixteenth', 'sixteenth', 'sixteenth', 'sixteenth']), {
			width: 400,
		});
		expect(host.querySelectorAll('svg')).toHaveLength(1);
	});

	it('creates one tuplet per triplet group and a beam for it', () => {
		const host = createHost();
		const result = renderRhythm(host, blocksToNotation(['quarter', 'triplet']), { width: 480 });
		expect(result?.tupletCount).toBe(1);
		expect(result?.noteCount).toBe(4);
		expect(result?.beamCount).toBe(1);
	});

	it('creates two tuplets for two consecutive triplets', () => {
		const host = createHost();
		const result = renderRhythm(host, blocksToNotation(['triplet', 'triplet']), { width: 480 });
		expect(result?.tupletCount).toBe(2);
		expect(result?.noteCount).toBe(6);
		expect(result?.beamCount).toBe(2);
	});

	it('beams mixed eighth and sixteenths in one group', () => {
		const host = createHost();
		const result = renderRhythm(host, blocksToNotation(['eighth', 'sixteenth', 'sixteenth']), {
			width: 400,
		});
		expect(result?.beamCount).toBe(1);
	});
});

import { Injectable, computed, inject } from '@angular/core';
import deLabels from '../i18n/locales/de.json';
import enLabels from '../i18n/locales/en.json';
import esLabels from '../i18n/locales/es.json';
import { LabelDictionary } from '../i18n/labels.types';
import {
	BLOCK_KINDS,
	BlockKind,
	BlockOption,
	LanguageCode,
	RhythmPattern,
	RhythmSessionItem,
} from '../models/practice.models';
import { M25StateService } from './m25-state.service';

const LOCALES: Record<LanguageCode, LabelDictionary> = {
	en: enLabels as LabelDictionary,
	es: esLabels as LabelDictionary,
	de: deLabels as LabelDictionary,
};

@Injectable({ providedIn: 'root' })
export class M25LabelsService {
	private readonly state = inject(M25StateService);

	readonly dictionary = computed(() => LOCALES[this.state.settings().language]);
	readonly blockOptions = computed<BlockOption[]>(() => BLOCK_KINDS.map((kind) => this.blockOption(kind)));

	blockOption(kind: BlockKind): BlockOption {
		const entry = this.dictionary().patterns.blocks[kind];
		return {
			kind,
			label: entry.label,
			symbol: entry.symbol,
		};
	}

	patternName(pattern: RhythmPattern | RhythmSessionItem | null | undefined): string {
		if (!pattern) {
			return this.dictionary().patterns.activeRoutine;
		}

		if (pattern.builtIn) {
			return this.dictionary().patterns.presets[pattern.name] ?? pattern.name;
		}

		return pattern.name || this.dictionary().patterns.activeRoutine;
	}

	routineName(name: string): string {
		return name.trim() || this.dictionary().patterns.untitledRoutine;
	}

	patternSymbols(blocks: readonly BlockKind[]): string {
		return blocks.map((block) => this.blockOption(block).symbol).join(' ');
	}

	formatCount(value: number): string {
		if (value < 0) {
			return `−${Math.abs(value)}`;
		}

		return String(value);
	}

	formatDuration(durationMs: number): string {
		const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		if (hours > 0) {
			return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
		}

		return `${minutes}:${String(seconds).padStart(2, '0')}`;
	}

	/** Human-readable rhythm description for accessible labels (no music glyphs). */
	patternDescription(blocks: readonly BlockKind[]): string {
		if (blocks.length === 0) {
			return this.dictionary().patterns.builderHint;
		}

		return blocks.map((block) => this.blockOption(block).label).join(', ');
	}

	targetValue(target: number): string {
		return this.interpolate(this.dictionary().patterns.targetValue, { target });
	}

	rhythmPosition(current: number, total: number): string {
		return this.interpolate(this.dictionary().patterns.rhythmPosition, { current, total });
	}

	rhythmCount(count: number): string {
		return this.interpolate(this.dictionary().patterns.rhythmCount, { count });
	}

	private interpolate(template: string, values: Record<string, number | string>): string {
		let nextText = template;
		for (const [key, value] of Object.entries(values)) {
			nextText = nextText.replaceAll(`{${key}}`, String(value));
		}
		return nextText;
	}
}
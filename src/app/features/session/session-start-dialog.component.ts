import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { M25LabelsService } from '../../core/services/m25-labels.service';
import { M25StateService } from '../../core/services/m25-state.service';

@Component({
	selector: 'm25-session-start-dialog',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './session-start-dialog.component.html',
	styleUrl: './session-dialog.shared.scss',
})
export class SessionStartDialogComponent {
	protected readonly state = inject(M25StateService);
	protected readonly labels = inject(M25LabelsService);
	protected readonly dictionary = this.labels.dictionary;
	protected readonly title = signal(this.state.settings().defaultPracticeTitle);
	protected readonly bpm = signal(this.state.settings().defaultBpm === null ? '' : String(this.state.settings().defaultBpm));
	protected readonly bpmError = signal('');

	protected start(): void {
		const askBpm = this.state.settings().askBpmBeforeStart;
		const bpmText = this.bpm().trim();
		const parsedBpm = this.parseBpm(this.bpm());

		if (askBpm && bpmText !== '' && parsedBpm === null) {
			this.bpmError.set(this.dictionary().start.bpmHint);
			return;
		}

		this.bpmError.set('');
		this.state.setDefaultPracticeTitle(this.title());
		this.state.setDefaultBpm(parsedBpm);
		this.state.startSession(this.title(), parsedBpm);
	}

	private parseBpm(rawValue: string): number | null {
		if (rawValue.trim() === '') {
			return null;
		}

		const bpm = Number(rawValue);
		if (!Number.isFinite(bpm) || bpm <= 0 || bpm > 400) {
			return null;
		}

		return Math.round(bpm);
	}
}

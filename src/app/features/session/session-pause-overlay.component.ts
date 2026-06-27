import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { M25LabelsService } from '../../core/services/m25-labels.service';
import { M25StateService } from '../../core/services/m25-state.service';

@Component({
	selector: 'm25-session-pause-overlay',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './session-pause-overlay.component.html',
	styleUrl: './session-dialog.shared.scss',
})
export class SessionPauseOverlayComponent {
	protected readonly state = inject(M25StateService);
	protected readonly labels = inject(M25LabelsService);
	protected readonly dictionary = this.labels.dictionary;
}

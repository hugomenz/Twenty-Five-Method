import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { M25LabelsService } from '../../core/services/m25-labels.service';
import { M25StateService } from '../../core/services/m25-state.service';

@Component({
	selector: 'm25-session-cancel-dialog',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './session-cancel-dialog.component.html',
	styleUrl: './session-dialog.shared.scss',
})
export class SessionCancelDialogComponent {
	protected readonly state = inject(M25StateService);
	protected readonly labels = inject(M25LabelsService);
	protected readonly dictionary = this.labels.dictionary;
}

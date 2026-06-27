import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { M25LabelsService } from '../../core/services/m25-labels.service';
import { M25StateService } from '../../core/services/m25-state.service';

@Component({
	selector: 'm25-home-screen',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './home-screen.component.html',
	styleUrl: './home-screen.component.scss',
})
export class HomeScreenComponent {
	protected readonly state = inject(M25StateService);
	protected readonly labels = inject(M25LabelsService);
	protected readonly dictionary = this.labels.dictionary;
}
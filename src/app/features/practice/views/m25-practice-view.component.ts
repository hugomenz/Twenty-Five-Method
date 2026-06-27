import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { M25LabelsService } from '../../../core/services/m25-labels.service';
import { M25StateService } from '../../../core/services/m25-state.service';

@Component({
	selector: 'm25-practice-view',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './m25-practice-view.component.html',
	styleUrl: './m25-practice-view.component.scss',
})
export class M25PracticeViewComponent {
	protected readonly state = inject(M25StateService);
	protected readonly labels = inject(M25LabelsService);
	protected readonly dictionary = this.labels.dictionary;
	protected readonly countLabel = computed(() => this.labels.formatCount(this.state.m25Count()));
	protected readonly targetLabel = computed(() => this.labels.targetValue(this.state.settings().target));
}
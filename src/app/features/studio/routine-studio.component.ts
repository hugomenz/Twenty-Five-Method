import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { M25LabelsService } from '../../core/services/m25-labels.service';
import { M25StateService } from '../../core/services/m25-state.service';
import { RoutineEditorSectionComponent } from '../settings/sections/routine-editor-section.component';

@Component({
	selector: 'm25-routine-studio',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RoutineEditorSectionComponent],
	templateUrl: './routine-studio.component.html',
	styleUrl: './studio-screen.component.scss',
})
export class RoutineStudioComponent {
	protected readonly state = inject(M25StateService);
	protected readonly labels = inject(M25LabelsService);
	protected readonly dictionary = this.labels.dictionary;
	protected readonly title = computed(() => this.dictionary().studio.routineTitle);
	protected readonly description = computed(() => this.dictionary().studio.routineDescription);
}
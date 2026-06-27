import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { M25LabelsService } from '../../core/services/m25-labels.service';
import { RhythmBuilderSectionComponent } from '../settings/sections/rhythm-builder-section.component';

@Component({
	selector: 'm25-pattern-studio',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RhythmBuilderSectionComponent],
	templateUrl: './pattern-studio.component.html',
	styleUrl: './studio-screen.component.scss',
})
export class PatternStudioComponent {
	protected readonly labels = inject(M25LabelsService);
	protected readonly dictionary = this.labels.dictionary;
	protected readonly title = computed(() => this.dictionary().studio.patternTitle);
	protected readonly description = computed(() => this.dictionary().studio.patternDescription);
}
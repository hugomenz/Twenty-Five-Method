import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { M25LabelsService } from '../../core/services/m25-labels.service';
import { FeedbackMessage, M25FeedbackService } from '../../core/services/m25-feedback.service';

/**
 * Renders transient feedback messages. The live region announces successes and
 * errors after an operation completes; each toast auto-dismisses and can be
 * closed manually.
 */
@Component({
	selector: 'm25-feedback-toasts',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div class="toasts" role="status" aria-live="polite">
			@for (message of feedback.messages(); track message.id) {
				<div class="toast" [class]="'toast toast--' + message.kind" data-testid="toast">
					<span class="toast__text">{{ text(message) }}</span>
					<button
						class="toast__close"
						type="button"
						(click)="feedback.dismiss(message.id)"
						[attr.aria-label]="dictionary().aria.dismiss"
					>
						✕
					</button>
				</div>
			}
		</div>
	`,
	styleUrl: './feedback-toasts.component.scss',
})
export class FeedbackToastsComponent {
	protected readonly feedback = inject(M25FeedbackService);
	protected readonly labels = inject(M25LabelsService);
	protected readonly dictionary = this.labels.dictionary;

	protected text(message: FeedbackMessage): string {
		let text = this.dictionary().feedback[message.key];
		for (const [key, value] of Object.entries(message.params ?? {})) {
			text = text.replaceAll(`{${key}}`, String(value));
		}

		return text;
	}
}

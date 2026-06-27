import { M25FeedbackService } from './m25-feedback.service';

describe('M25FeedbackService', () => {
	it('adds a message and keeps it when auto-dismiss is disabled', () => {
		const service = new M25FeedbackService();
		service.notify('success', 'routineSaved', 0);

		const messages = service.messages();
		expect(messages).toHaveLength(1);
		expect(messages[0]).toMatchObject({ kind: 'success', key: 'routineSaved' });
	});

	it('dismisses a message by id', () => {
		const service = new M25FeedbackService();
		service.notify('error', 'patternIncomplete', 0);
		const id = service.messages()[0]!.id;

		service.dismiss(id);
		expect(service.messages()).toHaveLength(0);
	});

	it('assigns unique ids and preserves order', () => {
		const service = new M25FeedbackService();
		service.notify('info', 'routineDeleted', 0);
		service.notify('success', 'patternSaved', 0);

		const [first, second] = service.messages();
		expect(first?.id).not.toBe(second?.id);
		expect(second?.key).toBe('patternSaved');
	});

	it('clears every message and timer', () => {
		const service = new M25FeedbackService();
		service.notify('success', 'routineSaved', 0);
		service.notify('info', 'practiceReset', 0);

		service.clear();
		expect(service.messages()).toHaveLength(0);
	});
});

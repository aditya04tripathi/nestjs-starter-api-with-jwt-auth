import { PubSubService } from './pubsub.service';

describe('PubSubService', () => {
	let service: PubSubService;

	beforeEach(() => {
		service = new PubSubService();
	});

	it('publishes payloads to subscribers', () => {
		const listener = jest.fn();
		service.subscribe('user.created', listener);

		service.publish('user.created', { id: 'user-1' });

		expect(listener).toHaveBeenCalledWith({ id: 'user-1' });
	});

	it('stops notifying listener after unsubscribe', () => {
		const listener = jest.fn();
		const unsubscribe = service.subscribe('user.updated', listener);

		unsubscribe();
		service.publish('user.updated', { id: 'user-1' });

		expect(listener).not.toHaveBeenCalled();
	});
});

import { JwtService } from '@nestjs/jwt';
import { RealtimeGateway } from './realtime.gateway';
import { PubSubService } from './pubsub/pubsub.service';

type ListenerMap = Record<string, (payload: any) => void>;

describe('RealtimeGateway', () => {
	let gateway: RealtimeGateway;
	let jwtService: jest.Mocked<JwtService>;
	let pubSubService: jest.Mocked<PubSubService>;
	let listenerMap: ListenerMap;
	let unsubscribeFns: jest.Mock[];
	let serverEmit: jest.Mock;
	let roomEmit: jest.Mock;
	let serverTo: jest.Mock;

	beforeEach(() => {
		listenerMap = {};
		unsubscribeFns = [jest.fn(), jest.fn(), jest.fn()];
		serverEmit = jest.fn();
		roomEmit = jest.fn();
		serverTo = jest.fn().mockReturnValue({ emit: roomEmit });

		jwtService = {
			verifyAsync: jest.fn(),
		} as unknown as jest.Mocked<JwtService>;

		let subscribeCalls = 0;
		pubSubService = {
			subscribe: jest.fn((event: string, listener: (payload: any) => void) => {
				listenerMap[event] = listener;
				const unSub = unsubscribeFns[subscribeCalls];
				subscribeCalls += 1;
				return unSub;
			}),
		} as unknown as jest.Mocked<PubSubService>;

		gateway = new RealtimeGateway(jwtService, pubSubService);
		gateway.server = {
			emit: serverEmit,
			to: serverTo,
		} as any;
	});

	it('subscribes to pubsub events and relays them', () => {
		gateway.afterInit();

		expect(pubSubService.subscribe).toHaveBeenCalledTimes(3);
		listenerMap['user.created']({ id: '1', name: 'A', email: 'a@example.com' });
		expect(serverEmit).toHaveBeenCalledWith('user.created', {
			id: '1',
			name: 'A',
			email: 'a@example.com',
		});

		listenerMap['user.updated']({ id: '2', name: 'B', email: 'b@example.com' });
		expect(serverTo).toHaveBeenCalledWith('user:2');
		expect(roomEmit).toHaveBeenCalledWith('user.updated', {
			id: '2',
			name: 'B',
			email: 'b@example.com',
		});

		listenerMap['user.password_changed']({ userId: '3' });
		expect(serverTo).toHaveBeenCalledWith('user:3');
		expect(roomEmit).toHaveBeenCalledWith('user.password_changed', { userId: '3' });
	});

	it('disconnects when no token is provided', async () => {
		const client = {
			handshake: { auth: {}, headers: {} },
			disconnect: jest.fn(),
			join: jest.fn(),
		} as any;

		await gateway.handleConnection(client);

		expect(client.disconnect).toHaveBeenCalledWith(true);
		expect(client.join).not.toHaveBeenCalled();
	});

	it('joins user room when auth token is valid', async () => {
		const client = {
			handshake: { auth: { token: 'valid-token' }, headers: {} },
			disconnect: jest.fn(),
			join: jest.fn(),
		} as any;
		jwtService.verifyAsync.mockResolvedValue({ sub: 'user-123' } as any);

		await gateway.handleConnection(client);

		expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
		expect(client.join).toHaveBeenCalledWith('user:user-123');
		expect(client.disconnect).not.toHaveBeenCalled();
	});

	it('uses bearer token from authorization header', async () => {
		const client = {
			handshake: {
				auth: {},
				headers: { authorization: 'Bearer header-token' },
			},
			disconnect: jest.fn(),
			join: jest.fn(),
		} as any;
		jwtService.verifyAsync.mockResolvedValue({ sub: 'user-123' } as any);

		await gateway.handleConnection(client);

		expect(jwtService.verifyAsync).toHaveBeenCalledWith('header-token');
		expect(client.join).toHaveBeenCalledWith('user:user-123');
	});

	it('disconnects when JWT payload has invalid subject', async () => {
		const client = {
			handshake: { auth: { token: 'valid-token' }, headers: {} },
			disconnect: jest.fn(),
			join: jest.fn(),
		} as any;
		jwtService.verifyAsync.mockResolvedValue({ sub: '' } as any);

		await gateway.handleConnection(client);

		expect(client.disconnect).toHaveBeenCalledWith(true);
		expect(client.join).not.toHaveBeenCalled();
	});

	it('disconnects when JWT verification throws', async () => {
		const client = {
			handshake: { auth: { token: 'bad-token' }, headers: {} },
			disconnect: jest.fn(),
			join: jest.fn(),
		} as any;
		jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

		await gateway.handleConnection(client);

		expect(client.disconnect).toHaveBeenCalledWith(true);
		expect(client.join).not.toHaveBeenCalled();
	});

	it('cleans up subscriptions on module destroy', () => {
		gateway.afterInit();

		gateway.onModuleDestroy();

		expect(unsubscribeFns[0]).toHaveBeenCalledTimes(1);
		expect(unsubscribeFns[1]).toHaveBeenCalledTimes(1);
		expect(unsubscribeFns[2]).toHaveBeenCalledTimes(1);
	});
});

import { JwtService } from '@nestjs/jwt';
import { OnModuleDestroy } from '@nestjs/common';
import {
	OnGatewayConnection,
	OnGatewayInit,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PubSubService } from 'src/realtime/pubsub/pubsub.service';

interface RealtimeEventPayload {
	[key: string]: unknown;
}

@WebSocketGateway({
	namespace: '/realtime',
	cors: {
		origin: process.env.CORS_ORIGIN
			? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
			: ['http://localhost:3000', 'http://127.0.0.1:3000'],
		credentials: true,
	},
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnModuleDestroy {
	@WebSocketServer()
	server: Server;

	private readonly unSubscribers: Array<() => void> = [];

	constructor(
		private readonly jwtService: JwtService,
		private readonly pubSubService: PubSubService,
	) {}

	afterInit(): void {
		this.unSubscribers.push(
			this.pubSubService.subscribe<{ id: string; name: string; email: string }>(
				'user.created',
				(payload) => {
					this.server.emit('user.created', payload);
				},
			),
		);
		this.unSubscribers.push(
			this.pubSubService.subscribe<{ id: string; name: string; email: string }>(
				'user.updated',
				(payload) => {
					this.server.to(`user:${payload.id}`).emit('user.updated', payload);
				},
			),
		);
		this.unSubscribers.push(
			this.pubSubService.subscribe<{ userId: string }>('user.password_changed', (payload) => {
				this.server.to(`user:${payload.userId}`).emit('user.password_changed', {
					userId: payload.userId,
				});
			}),
		);
	}

	async handleConnection(client: Socket): Promise<void> {
		const token = this.extractToken(client);
		if (!token) {
			client.disconnect(true);
			return;
		}

		try {
			const payload = await this.jwtService.verifyAsync<RealtimeEventPayload>(token);
			const sub = payload.sub;
			if (typeof sub !== 'string' || sub.length === 0) {
				client.disconnect(true);
				return;
			}
			client.join(`user:${sub}`);
		} catch {
			client.disconnect(true);
		}
	}

	onModuleDestroy(): void {
		this.unSubscribers.forEach((unsubscribe) => unsubscribe());
	}

	private extractToken(client: Socket): string | null {
		const authToken = client.handshake.auth?.token;
		if (typeof authToken === 'string' && authToken.length > 0) {
			return authToken;
		}

		const authorization = client.handshake.headers.authorization;
		if (typeof authorization !== 'string') {
			return null;
		}

		const [type, token] = authorization.split(' ');
		if (type !== 'Bearer' || !token) {
			return null;
		}

		return token;
	}
}

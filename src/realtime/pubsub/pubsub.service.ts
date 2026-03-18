import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'node:events';

type EventListener<T> = (payload: T) => void;

@Injectable()
export class PubSubService {
	private readonly emitter = new EventEmitter();

	publish<T>(eventName: string, payload: T): void {
		this.emitter.emit(eventName, payload);
	}

	subscribe<T>(eventName: string, listener: EventListener<T>): () => void {
		const wrappedListener = listener as (payload: unknown) => void;
		this.emitter.on(eventName, wrappedListener);
		return () => {
			this.emitter.off(eventName, wrappedListener);
		};
	}
}

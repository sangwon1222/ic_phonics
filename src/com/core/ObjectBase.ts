import * as PIXI from 'pixi.js';
import { CustomEvent } from './CustomEvent';

// 이벤트 콜백 함수 Type definition
interface EventCallback {
	(event: CustomEvent): void;
}

// 이벤트 보관 배열 Type definition
interface EventListenerContainer {
	[key: string]: Array<EventCallback>;
}

export class ObjectBase extends PIXI.Container {
	private mListenerContainer: EventListenerContainer;
	private mOnceListenerContainer: EventListenerContainer;

	constructor() {
		super();
		this.mListenerContainer = {};
		this.mOnceListenerContainer = {};
	}

	addCustomEventListener(evtType: string, cb: EventCallback) {
		if (this.mListenerContainer[evtType] == undefined) {
			this.mListenerContainer[evtType] = [];
		}
		this.mListenerContainer[evtType].push(cb);
	}

	removeCustomEventListener(evtType: string) {
		if (this.mListenerContainer[evtType] == undefined) {
			return;
		}
		this.mListenerContainer[evtType] = [];
	}

	// 이벤트 가동
	dispatchEvent(evtType: string, arg = null) {
		// console.log( arg, typeof arg)
		const event = new CustomEvent(this);
		if (arg != null) {
			event.data = arg;
		}
		if (this.mOnceListenerContainer[evtType] != undefined) {
			for (const cb of this.mOnceListenerContainer[evtType]) {
				cb(event);
			}
			this.mOnceListenerContainer[evtType] = [];
		}

		// console.log( "emit", arg, this.mListenerContainer[evtType] );
		if (this.mListenerContainer[evtType] != undefined) {
			for (const cb of this.mListenerContainer[evtType]) {
				cb(event);
			}
		}
	}
}

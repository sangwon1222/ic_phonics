import { ObjectBase } from './ObjectBase';

export class CustomEvent {
	private mCaller: ObjectBase;
	get caller(): ObjectBase {
		return this.mCaller;
	}

	private mData: any;

	set data(pData: any) {
		this.mData = pData;
	}
	get data(): any {
		return this.mData;
	}

	constructor(caller: ObjectBase) {
		this.mCaller = caller;
	}
}

import { App } from './App';
import { ObjectBase } from './ObjectBase';

export class SceneBase extends ObjectBase {
	private mIndex: number;

	constructor() {
		super();
	}

	// Index
	set index(n: number) {
		this.mIndex = n;
	}
	get index(): number {
		return this.mIndex;
	}

	show() {
		this.visible = true;
	}

	hide() {
		this.visible = false;
	}

	// override ----------------------------------------
	async onInit() {
		//
	}
	async onStart() {
		//
	}
	async onEnd() {
		//
	}
}

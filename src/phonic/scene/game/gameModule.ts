import * as PIXI from 'pixi.js';

export class GameModule extends PIXI.Container {
	private mGameName: string;
	get moduleName(): string {
		return this.mGameName;
	}
	constructor(gameName: string) {
		super();
		this.mGameName = gameName;
	}
	async onInit() {
		//
	}
	async onStart() {
		//
	}

	async deleteMemory() {
		//
	}

	async endGame() {
		//
	}
}

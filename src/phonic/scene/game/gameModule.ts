import * as PIXI from 'pixi.js';
import { Game } from './game';

export class GameModule extends PIXI.Container {
	constructor(private mGameName: string) {
		super();
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

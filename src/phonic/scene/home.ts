import gsap from 'gsap';
import { ResourceManager } from '../core/resourceManager';
import { SceneBase } from '../core/sceneBase';
import config from '../../com/util/Config';
import pixiSound from 'pixi-sound';
import { gameData } from '../core/resource/product/gameData';
import Config from '../../com/util/Config';
import { debugLine } from '../utill/gameUtil';

export class Home extends SceneBase {
	constructor() {
		super('home');
	}
	async onInit() {
		const bg = new PIXI.Graphics();
		bg.beginFill(0x000000, 1);
		bg.drawRect(0, 0, config.width, config.height);
		bg.endFill();

		const guideText = new PIXI.Text(
			`--------------------select--------------------`,
			{
				fill: 0xffffff,
				fontFamily: 'minigate Bold ver2',
				fontSize: 34,
				padding: 20,
			},
		);
		guideText.roundPixels = true;
		guideText.pivot.set(guideText.width / 2, guideText.height / 2);
		guideText.position.set(config.width / 2, 40);

		bg.addChild(guideText);
		this.addChild(bg);
	}

	async onStart() {
		// const arr = Array.from({ length: 26 }, (v, i) =>
		// 	String.fromCharCode(i + 65),
		// );

		await this.createSelectMode();
		await this.createGameList();
	}

	private createSelectMode(): Promise<void> {
		return new Promise<void>(resolve => {
			const style = {
				fill: 0xffffff,
				fontFamily: 'minigate Bold ver2',
				fontSize: 58,
				padding: 20,
			};
			const freeMode = new PIXI.Text(`자유모드`, style);
			freeMode.anchor.set(0.5);
			freeMode.position.set(config.width / 2 - 200, config.height / 2);
			freeMode.interactive = true;

			const studyMode = new PIXI.Text(`학습모드`, style);
			studyMode.anchor.set(0.5);
			studyMode.position.set(config.width / 2 + 200, config.height / 2);
			studyMode.interactive = true;

			freeMode.on('pointertap', () => {
				freeMode.tint = 0x00ff00;
				config.isFreeStudy = true;
				window['clickSnd'].play();
				gsap.delayedCall(window['clickSnd'].duration, () => {
					resolve();
				});
			});

			studyMode.on('pointertap', () => {
				studyMode.tint = 0x00ff00;
				config.isFreeStudy = false;
				window['clickSnd'].play();
				gsap.delayedCall(window['clickSnd'].duration, () => {
					resolve();
				});
			});

			this.addChild(freeMode, studyMode);
		});
	}

	private createGameList(): Promise<void> {
		return new Promise<void>(resolve => {
			let offSetX = 10;
			let offSetY = 80;

			const data = gameData;
			for (let i = 0; i < Object.keys(data).length; i++) {
				const btn = new PIXI.Graphics();
				btn.beginFill(0xffffff, 1);
				btn.drawRect(0, 0, 260, 60);
				btn.endFill();
				btn.tint = 0x000000;
				btn.position.set(offSetX, offSetY);
				btn.interactive = true;
				btn.buttonMode = true;

				const index = new PIXI.Text(`${i + 1}: `, {
					fill: 0xe660e8,
					fontFamily: 'minigate Bold ver2',
					fontSize: 30,
					padding: 20,
				});
				index.roundPixels = true;

				const title = new PIXI.Text('[ ' + data[`day${i + 1}`].title + '  ]', {
					fill: 0xffffff,
					fontFamily: 'minigate Bold ver2',
					fontSize: 40,
					padding: 20,
				});
				title.roundPixels = true;
				title.x = 100;

				this.addChild(btn);
				btn.addChild(index, title);

				(i + 1) % 5 == 0 ? (offSetX = 10) : (offSetX += 260);
				(i + 1) % 5 == 0 ? (offSetY += 60) : null;

				btn.once('pointerdown', () => {
					btn.tint = 0x0080db;
					Config.subjectNum = i + 1;
					Config.subjectName = gameData[`day${Config.subjectNum}`].title;

					console.groupCollapsed(
						`%c change_subject`,
						'background:#000; color:#fff; padding:2px;',
					);
					console.log(`subjectNum => [ ${Config.subjectNum} ]`);
					console.log(`subjectName => [ ${Config.subjectName} ]`);
					console.groupEnd();

					window['clickSnd'].play();
					gsap.delayedCall(window['clickSnd'].duration, async () => {
						await this.goScene('intro');
					});
				});
			}
			resolve();
		});
	}
}

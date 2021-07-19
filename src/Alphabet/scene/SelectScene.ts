import { SceneBase } from '../../com/core/SceneBase';
import { ViewerRscManager } from '../../com/manager/ViewerRscManager';
import { App } from '../../com/core/App';

import { Button } from '../../com/widget/Button';
import { EventType } from '../../com/core/EventType';
import { Point } from 'pixi.js';
import Config from '@/com/util/Config';

export class SelectScene extends SceneBase {
	private tempBtn: Button;
	private mRecordButton: Button;
	private mPlayButton: Button;
	private mAlphabetList: Array<PIXI.Text>;

	constructor() {
		super();
		this.name = 'SelectScene';
	}

	async onInit() {
		//
		// const style = new PIXI.TextStyle({
		// 	align: 'center',
		// 	fill: '#005729',
		// 	fontFamily: 'minigate Bold ver2',
		// 	fontWeight: 'normal',
		// 	fontSize: 64,
		// 	padding: 10,
		// });

		// const tAlphabetTxt = new PIXI.Text('ALPHABET');
		// tAlphabetTxt.style = style;
		// // this.tempTxt.text = 'ALPHABET';
		// tAlphabetTxt.anchor.set(0.5, 0.5);
		// tAlphabetTxt.position.set(App.Handle.appWidth / 2, -tAlphabetTxt.height);
		// // this.addChild(this.tempTxt);
		// App.Handle.addChilds(this, tAlphabetTxt);

		const style = new PIXI.TextStyle({
			align: 'left',
			fill: '#ffffff',
			fontFamily: 'minigate Bold ver2',
			fontWeight: 'normal',
			fontSize: 30,
			padding: 10,
		});

		const tAlphabet = [
			'A',
			'B',
			'C',
			'D',
			'E',
			'F',
			'G',
			'H',
			'I',
			'J',
			'K',
			'L',
			'M',
			'N',
			'O',
			'P',
			'Q',
			'R',
			'S',
			'T',
			'U',
			'V',
			'W',
			'X',
			'Y',
			'Z',
		];
		const tAlphabetTitle = new PIXI.Text(
			'------------------------------ Select Alphabet ------------------------------',
		);
		tAlphabetTitle.style = style;
		tAlphabetTitle.anchor.set(0.5);
		tAlphabetTitle.position.set(App.Handle.appWidth / 2, 50);

		this.addChild(tAlphabetTitle);
		this.mAlphabetList = [];
		const tLength = tAlphabet.length - 1;
		for (let i = 0; i <= tLength; i++) {
			const tAlphabetTxt = new PIXI.Text('');
			tAlphabetTxt.style = style;
			// for (const tVal in tAlphabet) {
			tAlphabetTxt.text = `Alphabet ${tAlphabet[i]}`;
			tAlphabetTxt.anchor.set(0);
			// tAlphabetTxt.position.set(50, i * 50);
			tAlphabetTxt.position.set(
				(i % 4) * 300 + 50,
				Math.floor(i / 4) * 50 + 100,
			);
			// }
			tAlphabetTxt.interactive = true;
			tAlphabetTxt.on('pointertap', (evt: PIXI.InteractionEvent) => {
				this.offInteractive();
				App.Handle.setAlphabet = tAlphabet[i].toLowerCase();
				Config.subjectNum = i + 1;
				this.dispatchEvent(EventType.ReceiveData, 'SelectScene');
			});
			this.addChild(tAlphabetTxt);
			this.mAlphabetList.push(tAlphabetTxt);
		}
	}
	async onStart() {
		//
	}
	offInteractive() {
		for (const text of this.mAlphabetList) {
			text.interactive = false;
		}
	}
}

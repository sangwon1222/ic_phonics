import { SceneBase } from '../../com/core/SceneBase';
import { ViewerRscManager } from '../../com/manager/ViewerRscManager';
import { App } from '../../com/core/App';

//Navi
import { TopBar } from './TopBar';

import { Button } from '../../com/widget/Button';
import { EventType } from '../../com/core/EventType';
import { Point } from 'pixi.js';
import Config from '@/com/util/Config';
import PhonicsConf from '../PhonicsConf';

export class SelectScene extends SceneBase {
	private tempBtn: Button;
	private mRecordButton: Button;
	private mPlayButton: Button;
	private mAlphabetList: Array<PIXI.Text>;
	private mViewOkAry: Array<number>;

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
			fontSize: 25,
			padding: 10,
		});

		const onStyle = new PIXI.TextStyle({
			align: 'left',
			fill: '#00ff00',
			fontFamily: 'minigate Bold ver2',
			fontWeight: 'normal',
			fontSize: 25,
			padding: 10,
		});

		const tAlphabetTitle = new PIXI.Text(
			'-------------------------------- Select Phonics Reading --------------------------------',
		);
		tAlphabetTitle.style = style;
		tAlphabetTitle.anchor.set(0.5);
		tAlphabetTitle.position.set(App.Handle.appWidth / 2, 50);

		this.addChild(tAlphabetTitle);
		this.mAlphabetList = [];
		this.mViewOkAry = [
			1,
			2,
			3,
			4,
			5,
			6,
			7,
			8,
			9,
			10,
			11,
			12,
			13,
			14,
			15,
			16,
			17,
			18,
			19,
			20,
			21,
			22,
			23,
			24,
			25,
			26,
			27,
			28,
			29,
			30,
			31,
			32,
			33,
			34,
			35,
			36,
			37,
			38,
			39,
			40,
			41,
			42,
			43,
			44,
			45,
			46,
			47,
			48,
			49,
			50,
			51,
			52,
		];
		const tLength = PhonicsConf.subjectData.length - 1;
		for (let i = 0; i <= tLength; i++) {
			const tAlphabetTxt = new PIXI.Text('');
			if (this.mViewOkAry.indexOf(i + 1) >= 0) {
				tAlphabetTxt.style = onStyle;
			} else {
				tAlphabetTxt.style = style;
			}
			// for (const tVal in tAlphabet) {
			tAlphabetTxt.text = `${PhonicsConf.subjectData[i]}`;
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
				App.Handle.setAlphabet = PhonicsConf.subjectData[i];
				Config.subjectNum = i + 1;
				Config.subjectName = PhonicsConf.subjectData[i];
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

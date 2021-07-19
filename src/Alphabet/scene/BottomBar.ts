import { SceneBase } from '../../com/core/SceneBase';
import { ViewerRscManager } from '../../com/manager/ViewerRscManager';
import { BtnState, NaviBtnName, SceneNum } from '../AlphabetApp';

import { Button } from '../../com/widget/Button';
import { EventType } from '../../com/core/EventType';
import { App } from '@/com/core/App';

export class BottomBar extends SceneBase {
	private mPrevBtn: Button;
	private mNextBtn: Button;
	private mSub1Btn: Button;
	private mSub2Btn: Button;

	constructor() {
		super();
		this.name = 'BottomBar';
	}

	async onInit() {
		this.y = 678;

		console.log(`BottomBar ap_view.json`);
		const tViewSheet = ViewerRscManager.Handle.getResource(
			'common',
			`ap_view.json`,
		).spritesheet;
		console.log(`BottomBar ap_view.json loaded`);
		// this.mPrevBtn = new Button(
		// 	ViewerRscManager.Handle.getResource('common', 'prevBtn.png').texture,
		// 	null,
		// 	ViewerRscManager.Handle.getResource('common', 'prevBtn_dis.png').texture,
		// );
		this.mPrevBtn = new Button(
			tViewSheet.textures['prevBtn.png'],
			null,
			tViewSheet.textures['prevBtn_dis.png'],
		);
		this.mPrevBtn.setAnchor(0.5, 0.5);
		this.mPrevBtn.position.set(38, 33);
		this.mPrevBtn.addCustomEventListener(EventType.ButtonUp, () => {
			this.dispatchEvent(EventType.ReceiveData, NaviBtnName.Prev);
		});
		this.addChild(this.mPrevBtn);

		// this.mNextBtn = new Button(
		// 	ViewerRscManager.Handle.getResource('common', 'nextBtn.png').texture,
		// 	null,
		// 	ViewerRscManager.Handle.getResource('common', 'nextBtn_dis.png').texture,
		// );
		this.mNextBtn = new Button(
			tViewSheet.textures['nextBtn.png'],
			null,
			tViewSheet.textures['nextBtn_dis.png'],
		);
		this.mNextBtn.setAnchor(0.5, 0.5);
		this.mNextBtn.position.set(1243, 33);
		this.mNextBtn.addCustomEventListener(EventType.ButtonUp, () => {
			this.dispatchEvent(EventType.ReceiveData, NaviBtnName.Next);
		});
		this.addChild(this.mNextBtn);

		// this.mSub1Btn = new Button(
		// 	ViewerRscManager.Handle.getResource('common', 'sub1btn_ori.png').texture,
		// 	ViewerRscManager.Handle.getResource('common', 'sub1btn_sel.png').texture,
		// 	ViewerRscManager.Handle.getResource('common', 'sub1btn_dis.png').texture,
		// );
		this.mSub1Btn = new Button(
			tViewSheet.textures['sub1btn_ori.png'],
			tViewSheet.textures['sub1btn_sel.png'],
			null,
		);
		this.mSub1Btn.setAnchor(0.5, 0.5);
		this.mSub1Btn.position.set(607, 44);
		// this.mSub1Btn.zIndex = -1;
		this.mSub1Btn.visible = false;
		// tSub1Btn.addCustomEventListener(EventType.ButtonUp, () => {})
		this.mSub1Btn.addCustomEventListener(EventType.ButtonUp, () => {
			this.dispatchEvent(EventType.ReceiveData, NaviBtnName.Sub1);
		});
		this.addChild(this.mSub1Btn);

		// this.mSub2Btn = new Button(
		// 	ViewerRscManager.Handle.getResource('common', 'sub2btn_ori.png').texture,
		// 	ViewerRscManager.Handle.getResource('common', 'sub2btn_sel.png').texture,
		// 	ViewerRscManager.Handle.getResource('common', 'sub2btn_dis.png').texture,
		// );
		this.mSub2Btn = new Button(
			tViewSheet.textures['sub2btn_ori.png'],
			tViewSheet.textures['sub2btn_sel.png'],
			null,
		);
		this.mSub2Btn.setAnchor(0.5, 0.5);
		this.mSub2Btn.position.set(673, 44);
		// this.mSub2Btn.zIndex = -1;
		this.mSub2Btn.visible = false;
		// this.mSub2Btn.addCustomEventListener(EventType.ButtonUp, () => {})
		this.mSub2Btn.addCustomEventListener(EventType.ButtonUp, () => {
			this.dispatchEvent(EventType.ReceiveData, NaviBtnName.Sub2);
		});
		this.addChild(this.mSub2Btn);

		// App.Handle.bottomBar = this;
		// this.addCustomEventListener(EventType.ReceiveData, (evt) => this.updateBtnSet());
	}

	settingButton(btnName: string, btnState: number) {
		// console.log(`btnName = ${btnName}, btnState = ${btnState}`);
		switch (btnName) {
			case NaviBtnName.Prev:
				this.stateButton(this.mPrevBtn, btnState);
				break;
			case NaviBtnName.Next:
				this.stateButton(this.mNextBtn, btnState);
				break;
			case NaviBtnName.Sub1:
				this.stateButton(this.mSub1Btn, btnState);
				break;
			case NaviBtnName.Sub2:
				this.stateButton(this.mSub2Btn, btnState);
				break;
			default:
		}
	}

	stateButton(btn: Button, btnState: number) {
		btn.interactive = true;
		btn.alpha = 1;
		switch (btnState) {
			case BtnState.Blink:
				btn.visible = true;
				btn.selected = false;
				btn.disabled = false;
				btn.blink(-1, 0.3);
				break;
			case BtnState.Off:
				btn.visible = true;
				btn.disabled = true;
				break;
			case BtnState.Selected:
				btn.visible = true;
				btn.selected = true;
				break;
			case BtnState.Hide:
				btn.visible = false;
				break;
			case BtnState.Clear:
				btn.interactive = false;
				btn.visible = true;
				btn.alpha = 0.1;
				// btn.visible = false;
				break;
			default:
				btn.visible = true;
				btn.selected = false;
				btn.disabled = false;
		}
	}
}

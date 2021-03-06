import gsap from 'gsap/all';
import * as PIXI from 'pixi.js';
import config from '../../com/util/Config';
import { Controller, PrevNextBtn } from '../widget/controller';
import { PhonicsApp } from './app';
import { ResourceManager, ResourceTable } from './resourceManager';

export class SceneBase extends PIXI.Container {
	private mSceneName: string;
	get sceneName(): string {
		return this.mSceneName;
	}

	get controller(): Controller {
		return PhonicsApp.Handle.controller;
	}

	get prevNextBtn(): PrevNextBtn {
		return PhonicsApp.Handle.controller.prevNextBtn;
	}

	constructor(sceneName: string) {
		super();
		this.mSceneName = sceneName;
		// this.mSceneIndex = sceneIndex;
	}

	// 각 씬에서 씬에 필요한 리소스나 데이터를 준비한다.
	async onInit() {
		//
	}

	// 게임에 필요한 데이터 및 리소스 준비가 끝나면 게임을 실행시킨다.
	async onStart() {
		//
	}

	async loadResource(rscList: ResourceTable) {
		await ResourceManager.Handle.loadCommonResource(rscList);
	}

	async goScene(sceneName: string) {
		await PhonicsApp.Handle.goScene(sceneName);
	}

	// 액티비티 씬 테두리 부분 둥글게 하는 이미지 삽입
	createDimmed(): Promise<void> {
		return new Promise<void>(resolve => {
			PhonicsApp.Handle.controllerVisible(true);

			const bg = new PIXI.Graphics();
			bg.beginFill(0x6c6c6c, 1);
			bg.drawRect(0, 0, config.width, config.height - 64);
			bg.endFill();
			bg.y = 64;

			const edge = new PIXI.NineSlicePlane(
				ResourceManager.Handle.getCommon('edge.png').texture,
				25,
				25,
				25,
				25,
			);
			edge.width = bg.width;
			edge.height = bg.height;
			edge.y = 64;

			this.addChild(bg, edge);

			this.sortableChildren = true;
			edge.zIndex = 6;

			resolve();
		});
	}

	// 버튼/가이드캐릭터 초기화
	async resetBtn() {
		await PhonicsApp.Handle.controller.reset();
	}

	// 다음 버튼이 깜빡이는 효과
	blintBtn(flag: boolean) {
		PhonicsApp.Handle.controller.prevNextBtn.blintNextBtn(flag);
	}

	// 컨트롤러 상단 액티비티 라벨의 활성/비활성화
	async completedLabel() {
		await PhonicsApp.Handle.controller.completedLabel();
	}

	async onEnd() {
		await gsap.globalTimeline.clear();
		if (window['video'] && !!window['video'].paused) {
			window['video'].pause();
		}
		window['video'] = null;

		this.removeChildren();
	}
}

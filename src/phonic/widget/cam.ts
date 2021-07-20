import * as PIXI from 'pixi.js';
import Config from '@/com/util/Config';

export class Cam extends PIXI.Container {
	private mVideo: HTMLVideoElement;
	private mStream: MediaStream;
	private mVideoSpr: PIXI.Sprite; // mVideo가 그려지는 Sprite
	private mCameraInfos: Array<any>;

	constructor() {
		super();

		// 비디오 재생을 위한 비디오 태그를 생성 한다.
		this.mVideo = document.createElement('video');

		this.mCameraInfos = [];
		this.mStream = null;

		this.mVideoSpr = new PIXI.Sprite();
		this.mVideoSpr.position.set(100, 100);
		this.addChild(this.mVideoSpr);

		this.onInit();
	}

	async onInit() {
		this.removeMediaDevices();
	}

	async onStart(
		tX: number,
		tY: number,
		tWidth: number,
		tHeight: number,
		tMask?: PIXI.Sprite,
	) {
		if (this.getIsReversedCamera()) {
			// console.log(`******* loadCameraInfos`);
			await this.loadCameraInfos();
		}
		// console.log(`setMediaDevices`);
		await this.setMediaDevices(tX, tY, tWidth, tHeight, tMask);
	}

	// N형 후면카메라가 있는 기종에선, 웹카메라가 디폴트로 후면이 잡히는 문제가 있어서 현재 프론트카메라의 인덱스를 받아 전면 카메라를 셋팅해야 합니다.
	//0415 장준팀장 메일참조
	// 후면 카메라 있는 기종인지 체크를 나타낸다.
	getIsReversedCamera(): boolean {
		if (window['Android']) {
			if (
				Config.getInitVariable.front_camera &&
				Config.getInitVariable.front_camera != '0'
			) {
				return true;
			}
		}
		return false;
	}

	// 카메라 정보를 받아오는걸 나타낸다.
	async loadCameraInfos() {
		try {
			await navigator.mediaDevices
				.enumerateDevices()
				.then(devices => {
					devices.forEach(device => {
						console.log(
							device.kind + ': ' + device.label + ' id = ' + device.deviceId,
						);
						if (device.kind === 'videoinput') {
							this.mCameraInfos.push(device);
						}
					});
				})
				.catch(function(err) {
					console.log(err.name + ': ' + err.message);
				});
		} catch (e) {
			console.log(e);
		}
	}

	// 미디어 관련 초기화를 한다.
	private removeMediaDevices() {
		this.removeChild(this.mVideoSpr);

		this.mVideo.pause();
		this.mVideo.srcObject = null;

		if (this.mStream === null) return;

		this.mStream.getTracks().forEach(function(track) {
			if (track.readyState == 'live') {
				track.stop();
			}
		});

		this.mStream = null;
	}

	// 미디어 디바이스 장치를 확인한다.
	// 카메라와 마이크가 있다면 지정한 값으로 설정한다.
	private async setMediaDevices(
		tX: number,
		tY: number,
		tWidth: number,
		tHeight: number,
		tMask?: PIXI.Sprite,
	) {
		// console.log(`devicelength = ${this.mCameraInfos.length}`);
		// if (this.mCameraInfos.length > 1) {
		// 	console.log(`deviceId = ${this.mCameraInfos[1].deviceId}`);
		// }
		const constraints = {
			audio: false,
			video: {
				width: tWidth,
				height: tHeight,
				deviceId:
					this.mCameraInfos.length > 1
						? { exact: this.mCameraInfos[1].deviceId }
						: undefined,

				// facingMode: 'user',
			},
		};

		try {
			this.mStream = await navigator.mediaDevices.getUserMedia(constraints);
			this.linkVideo(tX, tY, tMask);
		} catch (err) {
			console.log(`${err.name} : ${err.message}`);
		}
	}

	// 전면 카메라로 들어오는 영상을 캔버스에 뿌려준다.
	private async linkVideo(tX: number, tY: number, tMask?: PIXI.Sprite) {
		this.mVideo.srcObject = this.mStream;

		// 영상이 플레이중 멈추는 경우를 대비해서 처리를 나타낸다.====
		this.mVideo.setAttribute('autoplay', '');
		this.mVideo.setAttribute('muted', '');
		this.mVideo.setAttribute('playsinline', '');
		//=========================================================

		this.mVideo.onloadedmetadata = evt => {
			// this.mVideo.play();
			// console.log('onloadedmetadata');
			this.mVideoSpr = new PIXI.Sprite();
			this.mVideoSpr.position.set(tX, tY);
			this.addChild(this.mVideoSpr);
			this.mVideoSpr.texture = PIXI.Texture.from(this.mVideo);
			this.mVideoSpr.texture.rotate = 12; //기본 텍스쳐가 반전되어 있어 비디오 좌우 반전을 나타낸다.
			this.mVideoSpr.mask = tMask;
		};
	}

	async onEnd() {
		this.removeMediaDevices();

		this.mVideo = null;
		this.mVideoSpr.destroy();
	}
}

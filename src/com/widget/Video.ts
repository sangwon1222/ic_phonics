import { App } from '../core/App';
import { ObjectBase } from '../core/ObjectBase';
import gsap from 'gsap';
import { EventType } from '../core/EventType';

export class Video extends ObjectBase {
	private mVideo: HTMLVideoElement;
	private mVideoSprite: PIXI.Sprite;
	private mVolume: number;

	private mEvtCanPlay: () => void;
	private mEvtPlay: () => void;
	private mEvtTimeUpdate: () => void;
	private mEvtEnded: () => void;

	constructor(videoData: HTMLVideoElement) {
		super();

		this.mVideo = videoData;

		this.mVideoSprite = new PIXI.Sprite();
		this.mVideoSprite.texture = PIXI.Texture.from(this.mVideo);
		// this.mVideoSprite.scale.set(0);
		this.mVideoSprite.visible = false;
		// this.addChild(this.mVideoSprite);
		App.Handle.addChilds(this, this.mVideoSprite);

		App.Handle.playingVideo.push(this.mVideo);
		// let tVolume = this.mVideo.volume;
		this.mVolume = this.mVideo.volume;
		this.mVideo.volume = 0;
		// this.mVideo.pause();
		this.mVideo.play();
		this.mVideo.currentTime = 0;
		// this.mVideoSprite.visible = true;
		// this.mVideo.play();
		// gsap.delayedCall(0.5, () => {
		// 	// console.log("StartMovie");
		// 	// this.mVideoSprite.scale.set(1);
		// 	// this.mVideo.play();
		// 	if (this.mVideo === null) return;
		// 	this.mVideo.currentTime = 0;
		// 	this.mVideo.pause();
		// 	this.mVideoSprite.visible = true;
		// 	// this.mVideo.play();
		// 	// tVolume == 0 ? (tVolume = 1) : null;
		// 	this.mVideo.volume = tVolume || 1;
		// });

		this.mEvtCanPlay = () => {
			// gsap.delayedCall(1, () => {
			// 	// if (this.mVideo === null) return;
			// 	this.mVideo.currentTime = 0;
			// 	this.mVideo.pause();
			// this.mVideoSprite.visible = true;
			// 	this.mVideo.volume = tVolume || 1;
			// });
			// this.mVideo.play();
			// gsap.delayedCall( 0.1,()=>{
			//     this.mVideo.currentTime = 0;
			//     this.mVideo.pause();
			// });
			// this.mVideoSprite.scale.set(1);
			// // this.mVideoSprite.visible = true;
			// this.mVideo.currentTime = 0;
			// this.mVideo.pause();

			// this.dispatchEvent(EventType.ReceiveData, 'ShowTrueTrue');
			console.log('canplay');
			this.mVideo.removeEventListener('canplay', this.mEvtCanPlay);
		};
		this.mVideo.addEventListener('canplay', this.mEvtCanPlay);

		// this.mVideo.addEventListener('canplay', () => {
		// 	console.log('canplay');
		// 	// this.mVideoSprite.scale.set(1);
		// 	// this.mVideoSprite.visible = true;
		// });

		this.mEvtPlay = () => {
			// console.log("play");
		};
		this.mVideo.addEventListener('play', this.mEvtPlay);

		this.mEvtTimeUpdate = () => {
			this.startMotion();
			const per = (this.mVideo.currentTime / this.mVideo.duration) * 100;
			this.dispatchEvent(EventType.VideoTimeUpdata, per);
			// if (this.mVideo) {
			// const per = (this.mVideo.currentTime / this.mVideo.duration) * 100;
			// this.dispatchEvent(EventType.VideoTimeUpdata, per);
			// }
		};
		this.mVideo.addEventListener('timeupdate', this.mEvtTimeUpdate);

		this.mEvtEnded = () => {
			// console.log("end");
			// this.mVideo.currentTime = 0;
			this.dispatchEvent(EventType.VideoEnded, 'video_end');
			// this.mVideo.currentTime = 0;
		};
		this.mVideo.addEventListener('ended', this.mEvtEnded);
	}

	startMotion() {
		if (this.mVideo.currentTime >= 0.1) {
			this.mVideo.currentTime = 0;
			this.mVideo.pause();
			this.mVideoSprite.visible = true;
			this.mVideo.volume = this.mVolume || 1;
			this.startMotion = () => null;
		}
	}
	get video(): HTMLVideoElement {
		return this.mVideo;
	}

	get videoTexture(): PIXI.Texture {
		return this.mVideoSprite.texture;
	}

	onDestroy() {
		// console.log('Video onDestroy');
		this.mVideo?.removeEventListener('canplay', this.mEvtCanPlay);
		this.mVideo?.removeEventListener('play', this.mEvtPlay);
		this.mVideo?.removeEventListener('timeupdate', this.mEvtTimeUpdate);
		this.mVideo?.removeEventListener('ended', this.mEvtEnded);

		// App.Handle.removeChilds();
		this.mVideo = null;
	}
}

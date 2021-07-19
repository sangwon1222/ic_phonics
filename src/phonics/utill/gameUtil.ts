import gsap from 'gsap/all';
import { ResourceManager } from '../core/resourceManager';
import config from '../../com/util/Config';

// 좌표딸때
export function getPos(target: any) {
	target.interactive = true;
	target.buttonMode = true;
	let flag = false;
	target
		.on('pointerdown', () => {
			flag = true;
		})
		.on('pointermove', (evt: PIXI.InteractionEvent) => {
			if (flag) {
				const pos = evt.data.global;
				target.position.set(pos.x, pos.y);
				console.log(pos.x, pos.y);
			}
		})
		.on('pointerup', () => {
			flag = false;
		});
}

// 배열 섞어 주는 함수
export function shuffleArray(a: Array<any>) {
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}
// 컨테이너나 스프라이트 등 라인 그리는 함수
export function debugLine(target: any, color?: number) {
	const debug = new PIXI.Graphics();
	debug.lineStyle(2, 0xffffff, 1);
	debug.drawRect(0, 0, target.width, target.height);
	debug.endFill();
	target.addChild(debug);

	if (color) {
		debug.tint = color;
	} else {
		debug.tint = 0xff0000;
	}
}

export function getColorMap(baseTex: any) {
	if (!baseTex.resource) {
		//renderTexture
		return false;
	}
	const imgSource = baseTex.resource.source;
	let canvas = null;
	if (!imgSource) {
		return false;
	}
	let context = null;
	if (imgSource.getContext) {
		canvas = imgSource;
		context = canvas.getContext('2d');
	} else if (imgSource instanceof Image) {
		canvas = document.createElement('canvas');
		canvas.width = imgSource.width;
		canvas.height = imgSource.height;
		context = canvas.getContext('2d');
		context.drawImage(imgSource, 0, 0);
	} else {
		//unknown source;
		return false;
	}

	const w = canvas.width,
		h = canvas.height;
	baseTex.colormap = context.getImageData(0, 0, w, h);
	return true;
}

export function getColorByPoint(spr: PIXI.Sprite, globalPoint: PIXI.Point) {
	const tempPoint = new PIXI.Point();
	spr.worldTransform.applyInverse(globalPoint, tempPoint);

	const width = spr.texture.orig.width;
	const height = spr.texture.orig.height;
	const x1 = -width * spr.anchor.x;
	let y1 = 0;

	let flag = false;

	if (tempPoint.x >= x1 && tempPoint.x < x1 + width) {
		y1 = -height * spr.anchor.y;

		if (tempPoint.y >= y1 && tempPoint.y < y1 + height) {
			flag = true;
		}
	}

	if (!flag) {
		return { r: 0, g: 0, b: 0, a: 0 };
	}

	const tex = spr.texture;
	const baseTex: any = spr.texture.baseTexture;
	if (!baseTex.colormap) {
		if (!getColorMap(baseTex)) {
			return { r: 0, g: 0, b: 0, a: 0 };
		}
	}

	const colormap = baseTex.colormap;
	const data = colormap.data;
	const res = baseTex.resolution;
	// this does not account for rotation yet!!!

	const dx = Math.round((tempPoint.x - x1 + tex.frame.x) * res);
	const dy = Math.round((tempPoint.y - y1 + tex.frame.y) * res);
	const num = dx + dy * colormap.width;

	// // console.log("tempPoint:", tempPoint, "tex.frame:", tex.frame, "res:", res, "num:", num, "colormap.width:", colormap.width);
	return {
		r: data[num * 4],
		g: data[num * 4 + 1],
		b: data[num * 4 + 2],
		a: data[num * 4 + 3],
	};
}

// 모바일인지 체크를 나타낸다.
export function isMobilePlatform() {
	const filter = 'win16|win32|win64|mac';

	if (navigator.platform) {
		if (0 > filter.indexOf(navigator.platform.toLowerCase())) {
			//alert("Mobile");
			return true;
		} else {
			//alert("PC");
			return false;
		}
	}
}

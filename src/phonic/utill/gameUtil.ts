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
	for (let i = a.length - 1; i >= 0; i--) {
		const j = Math.floor(Math.random() * i);
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

export function isIOS() {
	const toMatch = [/Macintosh/i, /iPhone/i, /iPad/i, /iPod/i];
	// // console.log(navigator.userAgent)
	return toMatch.some(toMatchItem => {
		// alert( toMatchItem+":"+navigator.userAgent+":"+navigator.userAgent.match(toMatchItem) )
		return navigator.userAgent.match(toMatchItem);
	});
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

// export function shuffle(e) {
// 	const clone = [];
// 	for (const cloneObject of e) {
// 		clone.push(cloneObject);
// 	}

// 	const shuffled = [];
// 	for (let i = clone.length - 1; i >= 0; i--) {
// 		const random = Math.floor(Math.random() * clone.length);
// 		shuffled.push(clone[random]);
// 		clone.splice(random, 1);
// 	}
// 	return shuffled;
// }

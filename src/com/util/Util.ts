import WebFont from 'webfontloader';
import Config from './Config';
import AlphabetConf from '../../Alphabet/AlphabetConf';
import PhonicsConf from '../../phonics/PhonicsConf';
import WordsConf from '../../sightwords/SightWordsConf';

// Font 로딩을 나타낸다.
export function _fontLoading(): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		WebFont.load({
			custom: {
				families: [
					// 'minigate',
					// 'minigate Bold',
					'minigate Bold ver2',
					// 'BPreplay',
					// 'BPreplay:i8',
					// 'NanumGothic',
					'NanumSquareRound',
				],
				// urls: [`../fonts/fonts.css`],
				urls: [`${Config.restAPIProd}fonts/fonts.css`],
				// urls: [`${Config.fontAPI}rsc/fonts/fonts.css`],
			},
			active: () => {
				console.log(' font loaded');
				resolve();
			},
			fontloading: fontname => {
				console.log(`fontLoading ${fontname}`);
				// resolve();
			},
		});
	});
}
//--------------------End

export function shuffleArray(a: Array<any>) {
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

// 보여줘야 하는 자리수만큼 0을 붙여준다.
// 4자리가 필요한다면.. (2,4) = 0002
export function addZero(n: number, plaseValue: number): string {
	const len = String(n).length;
	let numStr = '';

	for (let i = 0; i < plaseValue - len; i++) {
		numStr += '0';
	}
	numStr += String(n);
	return numStr;
}

//각 앱별 서브제목 입력시 데이터 번호를 나타낸다.
export function getSubjectIdx(tApb: string): number {
	let result = 1;
	switch (Config.appName) {
		case 'alphabet':
			result = AlphabetConf.subjectData.indexOf(tApb.toUpperCase()) + 1;
			break;
		case 'ph_reading':
			result = PhonicsConf.subjectData.indexOf(tApb.toUpperCase()) + 1;
			break;
		case 'words':
			result = WordsConf.subjectData.indexOf(tApb.toUpperCase()) + 1;
			break;
		default:
			result = 1;
	}
	return result;
}

//각 앱별 데이터번호 입력시 서브제목을 나타낸다.
export function getSubjectStr(tIdx: number): string {
	let tDataAry = [];

	switch (Config.appName) {
		case 'alphabet':
			tDataAry = AlphabetConf.subjectData;
			break;
		case 'ph_reading':
			tDataAry = PhonicsConf.subjectData;
			break;
		case 'words':
			tDataAry = WordsConf.subjectData;
			break;
		default:
			tDataAry = [];
	}

	let tNum = tIdx - 1;
	tNum < 0 ? (tNum = 0) : null;
	tNum >= tDataAry.length ? (tNum = tDataAry.length - 1) : null;
	return tDataAry[tNum];
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

//Json 데이터를 Property 데이터로 변경을 나타낸다.
export function jsonToProperty(tSource: any, tTarget: any) {
	JSON.parse(tSource, (key, value) => {
		if (key !== '' && key !== '0' && key !== '1' && key !== '2' && key !== '3')
			tTarget[key] = value;
		return value;
	});
}

//시간을 00:00:00 형태로 나타낸다.
export function timeToString(tNum: number): string {
	const tHours = Math.floor(tNum / 1000 / 60 / 60);
	tNum -= tHours * 1000 * 60 * 60;
	let tMinutes = Math.floor(tNum / 1000 / 60);
	tNum -= tMinutes * 1000 * 60;
	const tSeconds = Math.floor(tNum / 1000);

	return `${addZero(tHours, 2)}:${addZero(tMinutes, 2)}:${addZero(
		tSeconds,
		2,
	)}`;
}

// 00:00:00 문자를 시간 형태로 나타낸다.
export function stringToTime(tStr: string): number {
	const tStrAry = tStr.split(':');
	const tHours = Number(tStrAry[0]) * 1000 * 60 * 60;
	const tMinutes = Number(tStrAry[1]) * 1000 * 60;
	const tSeconds = Number(tStrAry[2]) * 1000;

	return tHours + tMinutes + tSeconds;
}

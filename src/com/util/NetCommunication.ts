//Base Module
import { ObjectBase } from '../core/ObjectBase';
//Net Module
import * as $ from 'jquery';
import * as qs from 'qs';
import axios from 'axios';
//Pixi Module
import { utils } from 'pixi.js';
//Scene Module
import { App } from '../core/App';
import * as Util from './Util';
import Config from '@/com/util/Config';
import AlphabetConf from '../../Alphabet/AlphabetConf';
import PhonicsConf from '../../phonicsreading/PhonicsConf';
import SightWordsConf from '../../sightwords/SightWordsConf';

export class NetCommunication extends ObjectBase {
	private AppConf: any;
	private mLCMS: any;
	private mStartActivityTime: Date;
	private mSndRecAry: Array<string>;

	constructor() {
		super();
		this.mSndRecAry = [];
		switch (Config.getInitVariable.subj_viw_nm) {
			case '알파벳':
				this.AppConf = AlphabetConf;
				break;
			case '파닉스리딩':
				this.AppConf = PhonicsConf;
				break;
			case '사이트워드':
				this.AppConf = SightWordsConf;
				break;
			default:
				this.AppConf = AlphabetConf;
		}
	}

	// LCMS 데이터 가져오기를 나타낸다.
	async getLCMS() {
		const tUrl = Config.getInitVariable.xmlName;

		const tDeferred = await $.ajax({
			type: 'GET',
			url: tUrl,
			cache: false,
			async: false,
			crossDomain: true,
			dataType: 'jsonp',
			jsonpCallback: 'SGE',
		})
			.done(data => {
				const tJson = data;
				console.log(`ajax LCMS Successed = ${JSON.stringify(tJson)}`);
				this.mLCMS = { ...tJson };
				console.log(`this.mLCMS = ${JSON.stringify(this.mLCMS)}`);
				Util.jsonToProperty(JSON.stringify(tJson['main']), this.AppConf.LCMS);

				console.log(
					`AppConf.LCMS Successed = ${JSON.stringify(this.AppConf.LCMS)}`,
				);
				this.reStartStudy();
			})
			.fail(data => {
				console.log('LCMS Failed');
			});
	}

	// 학습 데이터 서버에 보내기를 나타낸다.
	async sendStudyData() {
		if (!Config.mobile) return;

		const tJson = JSON.stringify(this.AppConf.studyData);
		let reqData = {
			student_no: Config.getInitVariable.student_no,
			module_no: Config.getInitVariable.module_no,
			plan_de: Config.getInitVariable.plan_de,
			guide_no: Config.getInitVariable.guide_no,
			user_id: Config.getInitVariable.user_id,
			type: 'json',
			data: tJson,
		};

		await axios({
			withCredentials: true,
			url: this.AppConf.LCMS.uploadURL,
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			data: qs.stringify(reqData),
			method: 'POST',
		})
			.then(async res => {
				console.log(res.status);
				console.log(res.data);

				if (res.status == 200 && res.data == 'Y') {
					//저장 성공
					this.clearCache();
					console.log(`axios Post Succesed = ${res}`);
					let tType = '';
					if (this.AppConf.studyData.info.studyComplete === true) {
						console.log(`com.home_learn.broadcast.TodayStudyUpdate Called`);
						tType = Config.getInitVariable.type;

						if (window['Android']) {
							const tPlanDeAry = Config.getInitVariable.plan_de.split('|');
							console.log(
								`type=${tType}&study_state=STUDY_DONE&service_id=${Config.getInitVariable.service_id}&plan_de=${tPlanDeAry[0]}`,
							);
							window['Android'].callBroadcast(
								'com.home_learn.broadcast.TodayStudyUpdate',
								`type=${tType}&study_state=STUDY_DONE&service_id=${Config.getInitVariable.service_id}&plan_de=${tPlanDeAry[0]}`,
							);
						}

						await App.Handle.xCaliper.AssignableStudyCompleted();
					}
				} else {
					//저장 실패
					console.log('axios Post Failed...');
				}
			})
			.catch(e => {});

		console.log(`this.AppConf.LCMS.uploadURL = ${this.AppConf.LCMS.uploadURL}`);
		console.log(`qs.stringify(reqData) = ${qs.stringify(reqData)}`);
	}

	//학습 데이터 임시 저장을 나타낸다.
	async saveCache() {
		const tJson = JSON.stringify(this.AppConf.studyData);
		if (window['Android']) {
			await window['Android'].saveCache(
				Config.getInitVariable.user_id,
				Config.getInitVariable.plan_de,
				Config.getInitVariable.service_id,
				tJson,
			);
		}
	}

	//로컬에 임시 저장된 json 데이터 삭제.
	async clearCache() {
		if (window['Android']) {
			await window['Android'].clearCache(
				Config.getInitVariable.user_id,
				Config.getInitVariable.plan_de,
				Config.getInitVariable.service_id,
			);
		}
	}

	// 로컬에 저장된 학습데이터 가져오기를 나타낸다.
	getCacheData(callback) {
		if (window['Android']) {
			try {
				window['Android'].getCache(
					Config.getInitVariable.user_id,
					Config.getInitVariable.plan_de,
					Config.getInitVariable.service_id,
					'',
					callback,
				); // 비동기 일때
			} catch (e) {
				try {
					callback(
						window['Android'].getCache(
							Config.getInitVariable.user_id,
							Config.getInitVariable.plan_de,
							Config.getInitVariable.service_id,
							'',
						),
					); // 동기 일때
				} catch (e) {
					callback('');
				}
			}
		}
	}

	//학습 이어하기를 나타낸다.
	async reStartStudy() {
		let tLocalData;

		if (window['Android']) {
			await this.getCacheData(tVal => {
				console.log(`getCacheData Value = ${tVal}`);
				if (tVal === null || tVal === undefined || tVal == '') {
					tLocalData = null;
				} else {
					tLocalData = JSON.parse(tVal);
				}
			});
		}

		console.log(`!! LocalData`);
		if (tLocalData !== undefined && tLocalData !== null)
			console.log(`reStartStudy = ${JSON.stringify(tLocalData)}`);
		// const tJson = JSON.parse(this.mLCMS);
		const tServerData = this.mLCMS['main'].data;
		console.log(`!! ServerData`);
		if (tServerData !== undefined && tServerData !== null)
			console.log(`reStartStudy = ${JSON.stringify(tServerData)}`);

		if (tServerData === null || tServerData === undefined) {
			if (tLocalData === null || tLocalData === undefined) {
				// 처음 학습 시작 데이터 생성 날짜 조심
				console.log('this.resetStudyData(true);');
				this.startStudyData(true);
			} else {
				console.log('this.resetStudyData(false);');
				Util.jsonToProperty(JSON.stringify(tLocalData), this.AppConf.studyData);
				this.startStudyData(false);
			}
		} else {
			if (tLocalData === null || tLocalData === undefined) {
				// 처음 학습 시작 데이터 생성 날짜 조심
				console.log(`tLocalData is null!`);
				Util.jsonToProperty(
					JSON.stringify(tServerData),
					this.AppConf.studyData,
				);
			} else {
				if (tLocalData.info.date > tServerData.info.date) {
					console.log(`this.AppConf.studyData is tLocalData!`);
					Util.jsonToProperty(
						JSON.stringify(tLocalData),
						this.AppConf.studyData,
					);
					// this.AppConf.studyData = tLocalData;
				} else {
					console.log(`this.AppConf.studyData is tServerData!`);
					Util.jsonToProperty(
						JSON.stringify(tServerData),
						this.AppConf.studyData,
					);
					// this.AppConf.studyData = tServerData;
				}
			}
			this.startStudyData(false);
		}

		console.log(
			`this.AppConf.studyData = ${JSON.stringify(this.AppConf.studyData)}`,
		);
	}

	//학습 시작하기를 나타낸다.
	startStudyData(tFirst: boolean) {
		console.log(
			`before startStudyData = ${JSON.stringify(this.AppConf.studyData)}`,
		);
		const tCnt = this.AppConf.LCMS['content'].item.length;
		console.log(tCnt);
		for (let i = 0; i < tCnt; i++) {
			console.log(
				`this.AppConf.LCMS ${i} = ${this.AppConf.LCMS['content'].item[i].code}`,
			);
			this.AppConf.studyData['state'][i].code = String(
				this.AppConf.LCMS['content'].item[i].code,
			);
		}

		const tNowDate = new Date();
		if (tFirst) this.AppConf.studyData.info.startDate = tNowDate.toString();
		this.AppConf.studyData.info.date = tNowDate.toString();
		this.AppConf.studyData.info.startTime = `${Util.addZero(
			tNowDate.getHours(),
			2,
		)}:${Util.addZero(tNowDate.getMinutes(), 2)}:${Util.addZero(
			tNowDate.getSeconds(),
			2,
		)}`;
		this.AppConf.studyData.info.endTime = '00:00:00';
		this.AppConf.studyData.info.studyTime = '00:00:00';
		this.AppConf.studyData.info.studyComplete = false;
		this.AppConf.studyData.info.endDate = '';
		// this.AppConf.studyData.info.allStudyTime = '';
		console.log(
			`after startStudyData = ${JSON.stringify(this.AppConf.studyData)}`,
		);
	}

	// 학습 끝내기를 나타낸다.
	endStudyData() {
		console.log(
			`before endStudyData = ${JSON.stringify(this.AppConf.studyData)}`,
		);
		const tNowDate = new Date();
		const tStartDate = new Date(this.AppConf.studyData.info.date);
		const tEndDate = new Date(tNowDate.toString());
		let tResult = tEndDate.getTime() - tStartDate.getTime();
		const tTimeStr = Util.timeToString(tResult);

		this.AppConf.studyData.info.endTime = `${Util.addZero(
			tNowDate.getHours(),
			2,
		)}:${Util.addZero(tNowDate.getMinutes(), 2)}:${Util.addZero(
			tNowDate.getSeconds(),
			2,
		)}`;
		this.AppConf.studyData.info.studyTime = tTimeStr;
		this.AppConf.studyData.info.endDate = tNowDate.toString();

		let tVal = true;
		const tActCnt = this.AppConf.studyData['state'].length;
		for (let i = 0; i < tActCnt; i++) {
			if (this.AppConf.studyData['state'][i].complete === false) tVal = false;
		}
		this.AppConf.studyData.info.studyComplete = tVal;
		this.AppConf.studyData.info.allStudyTime = String(
			Number(this.AppConf.studyData.info.allStudyTime) + tResult,
		);

		console.log(
			`after endStudyData = ${JSON.stringify(this.AppConf.studyData)}`,
		);
	}

	// 액티비티 완료시 처리를 나타낸다.
	completeActivity(tActNum: number, tPageNum: number) {
		this.AppConf.studyData['state'][tActNum]['pages'][tPageNum].complete = true;
		const tPageCnt = this.AppConf.studyData['state'][tActNum].pageCount;
		console.log(
			`completeActivity tActNum = ${tActNum}, tPageNum = ${tPageNum}`,
		);
		let tVal = true;
		for (let i = 0; i < tPageCnt; i++) {
			if (
				this.AppConf.studyData['state'][tActNum]['pages'][i].complete === false
			)
				tVal = false;
		}
		this.AppConf.studyData['state'][tActNum].complete = tVal;

		this.nextVisitEnable(tActNum, tPageNum);
	}

	// 다음 액티비티의 방문 활성화를 나타낸다.
	nextVisitEnable(tActNum: number, tPageNum: number) {
		const tActCnt = this.AppConf.studyData['state'].length - 1;
		if (tActNum < 0 || tActNum >= tActCnt) return;
		const tPageCnt = this.AppConf.studyData['state'][tActNum].pageCount - 1;
		if (tPageNum === tPageCnt) {
			tActNum++;
			tPageNum = 0;
		} else {
			tPageNum++;
		}
		console.log(
			`nextVisitEnable = ${this.mStartActivityTime.toString()}, tActNum = ${tActNum}, tPageNum = ${tPageNum}`,
		);

		this.AppConf.studyData['state'][tActNum].visit = true;
		this.AppConf.studyData['state'][tActNum]['pages'][tPageNum].visit = true;
	}

	//액티비티 시작시 방문 활성화를 나타낸다.
	visitActivity(tActNum: number, tPageNum: number) {
		const tActCnt = this.AppConf.studyData['state'].length;
		if (tActNum < 0 || tActNum >= tActCnt) return;

		this.AppConf.studyData['state'][tActNum].visit = true;
		this.AppConf.studyData['state'][tActNum]['pages'][tPageNum].visit = true;
		this.mStartActivityTime = new Date();
		console.log(
			`visitActivity = ${this.mStartActivityTime.toString()}, tActNum = ${tActNum}, tPageNum = ${tPageNum}`,
		);
	}

	//액티비티 나가기시 처리를 나타낸다.
	leaveActivity(tActNum: number, tPageNum: number) {
		const tActCnt = this.AppConf.studyData['state'].length;
		console.log(
			`tActNum = ${tActNum}, tPageNum = ${tPageNum}, tActCnt = ${tActCnt}`,
		);
		if (tActNum < 0 || tActNum >= tActCnt) return;

		const tleaveTime = new Date();
		const tStudyTime = tleaveTime.getTime() - this.mStartActivityTime.getTime();

		console.log(
			`tStudyTime = ${tStudyTime}, this.mStartActivityTime = ${this.mStartActivityTime}, tleaveTime = ${tleaveTime}`,
		);

		let tLastTime = this.AppConf.studyData['state'][tActNum].studyTime;
		if (tLastTime === null || tLastTime === undefined) tLastTime = '00:00:00';
		const tLastTimeNum = Util.stringToTime(tLastTime);
		const tLastStudyTime = tStudyTime + tLastTimeNum;
		this.AppConf.studyData['state'][tActNum].studyTime = Util.timeToString(
			tLastStudyTime,
		);

		console.log(`leaveActivity = ${JSON.stringify(this.AppConf.studyData)}`);
	}

	// 가장 마지막 방문한 액티비티 정보를 나타낸다.
	getLastVisit(): Array<number> {
		let tResultAry: Array<number> = [0, 0, 0]; // 모드번호, 페이지번호, (0: 학습시작, 1: 학습진행중, 2: 학습완료)
		const tActCnt = this.AppConf.studyData['state'].length;
		for (let i = 0; i < tActCnt; i++) {
			const tPageCnt = this.AppConf.studyData['state'][i].pageCount;
			for (let j = 0; j < tPageCnt; j++) {
				if (this.AppConf.studyData['state'][i]['pages'][j].complete === false) {
					if (this.AppConf.studyData['state'][i]['pages'][j].visit === true) {
						tResultAry[0] = i;
						tResultAry[1] = j;
						tResultAry[2] = 1;
					}
					return tResultAry;
				} else {
					//액티비티를 한두개 클리어 했을 경우의 처리를 나타낸다.
					tResultAry[0] = i;
					tResultAry[1] = j;
					tResultAry[2] = 1;
				}
			}
		}
		tResultAry[2] = 2; // 액티비티를 모두 클리어 했을 경우의 처리를 나타낸다.
		return tResultAry;
	}

	//사이트워드의 프랙티스 모드 클리어시 녹음된 사운드 파일 서버 업로드를 나타낸다.
	//오늘의 학습이 아닌경우에도 파일 서버 업로드를 나타낸다.
	uploadSndFile() {
		var tJson = JSON.stringify({
			stuId: Config.getInitVariable.user_id,
			studyCourseId: Config.getInitVariable.subj_lesson_no,
			base64List: [
				{ orderNo: 1, base64String: this.mSndRecAry[0] },
				{ orderNo: 2, base64String: this.mSndRecAry[1] },
				{ orderNo: 3, base64String: this.mSndRecAry[2] },
			],
		});

		console.log(`tJson = ${tJson}`);
		const tUrl = `${Config.getInitVariable.apiUrl}/clientsvc/eng-nuri/v1/homelearnbook/records`;
		console.log(`uploadSndFile tUrl = ${tUrl}`);

		$.ajax({
			url: tUrl,
			contentType: 'application/json',
			method: 'POST',
			data: tJson,
			xhrFields: { withCredentials: true },
		})
			.done(data => {
				const tRstJson = data;
				console.log(
					`Upload Sound File Successed = ${JSON.stringify(tRstJson)}`,
				);
			})
			.fail(data => {
				console.log(`Upload Sound File Failed`);
			});
	}

	// 녹음 파일 데이터를 리스트에 추가한다.
	addSndFileData(tIdx: number, tData: string) {
		this.mSndRecAry[tIdx] = tData;
	}
}

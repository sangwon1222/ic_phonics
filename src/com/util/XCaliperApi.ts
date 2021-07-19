import { ObjectBase } from '../core/ObjectBase';
import { App } from '../core/App';
import Config from '@/com/util/Config';
import { Video } from '../widget/Video';

export enum EVENT_TYPE {
	ToolUseEvent = 'ToolUseEvent',
	NavigationEvent = 'NavigationEvent',
	AssignableEvent = 'AssignableEvent',
	ViewEvent = 'ViewEvent',
	MediaEvent = 'MediaEvent',
}

export enum ACTION_TYPE {
	Used = 'Used',
	NavigatedTo = 'NavigatedTo',
	Started = 'Started',
	Paused = 'Paused',
	Completed = 'Completed',
	Viewed = 'Viewed',
	MediaEvent = 'MediaEvent',
	Restarted = 'Restarted',
	Resumed = 'Resumed',
	Ended = 'Ended',
	JumpedTo = 'JumpedTo',
	Muted = 'Muted',
	Unmuted = 'Unmuted',
}

export enum UNIQUE_ACTION {
	AppEnded = 'AppEnded',
	ReadingNavigatedTo = 'ReadingNavigatedTo',
	AssignableStudyStarted = 'AssignableStudyStarted',
	AssignablePaused = 'AssignablePaused',
	AssignableStudyCompleted = 'AssignableStudyCompleted',
	AssignableViewed = 'AssignableViewed',
	MediaStarted = 'MediaStarted',
	MediaRestarted = 'MediaRestarted',
	MediaPaused = 'MediaPaused',
	MediaResumed = 'MediaResumed',
	MediaEnded = 'MediaEnded',
	MediaCompleted = 'MediaCompleted',
	MediaJumpedTo = 'MediaJumpedTo',
	MediaMuted = 'MediaMuted',
	MediaUnmuted = 'MediaUnmuted',
}

export class XCaliperApi extends ObjectBase {
	private mApiServer: string;
	private mOBJ_ID: string;
	private mSERVICE_ID: string;
	private mACTOR_ID: string;
	private mACTOR_GRADE: string;
	private mHomelearnUrl: string;
	private mAppName: string;
	private mAppVer: string;

	constructor() {
		super();

		this.mApiServer = Config.bigdataAPIProd;
		// this.mApiServer = 'dev';
		// if (
		// 	Config.restAPIProd ===
		// 	'https://xcdn.home-learn.com/preschool_eng/n_study/2021/ps_eng/'
		// ) {
		// 	this.mApiServer = 'ops';
		// }

		this.mOBJ_ID = Config.getInitVariable.token;
		this.mSERVICE_ID = 'Y29tLnhjYWxpcGVyLmhvbWVsZWFybg=='; // 초등
		// this.mSERVICE_ID = 'Y29tLnhjYWxpcGVyLmhvbWVsZWFybi1tcw=='; // 중등

		this.mACTOR_ID = Config.getInitVariable.user_id;
		this.mACTOR_GRADE = Config.getInitVariable.user_grade_div;
		let tSubUrl = '';
		switch (Config.getInitVariable.subj_viw_nm) {
			case '알파벳':
				tSubUrl = `Alphabet`;
				break;
			case '파닉스리딩':
				tSubUrl = `Phonics`;
				break;
			case '사이트워드':
				tSubUrl = `SightWords`;
				break;
			default:
				tSubUrl = `Alphabet`;
		}
		this.mHomelearnUrl = `${Config.getInitVariable.homelearnUrl}/${tSubUrl}`;
		this.mAppName = `리틀홈런 ${Config.getInitVariable.subj_viw_nm}`;
		this.mAppVer = '1.2';

		// window['xcaliperSend'] = false;
		// console.log(`XCaliperSend ${window['xcaliperSend']} Started~!!`);
	}

	private async CommonApi() {
		window['XCaliper'].setApiServer(this.mApiServer); // 개발 : dev, 운영 : ops 로 설정
		window['user'].set('OBJ_ID', this.mOBJ_ID); // 토큰 값
		window['user'].set('SERVICE_ID', this.mSERVICE_ID); // 홈런 서비스 정보
		window['user'].set('ACTOR_ID', this.mACTOR_ID); // 학습자의 구분 아이디
		window['user'].set('ACTOR_GRADE', this.mACTOR_GRADE); // 학습자의 학년
	}

	// 2.2 앱 종료 이벤트
	async AppEnded() {
		if (!Config.mobile || Config.devMode) return;

		await this.CommonApi();
		window['intent'].set('EVENT_TYPE', EVENT_TYPE.ToolUseEvent); // 이벤트 타입 (고정)
		window['intent'].set('ACTION_TYPE', ACTION_TYPE.Used); // 해당 이벤트의 액션 (고정)
		window['intent'].set('UNIQUE_ACTION', UNIQUE_ACTION.AppEnded); // Action별 구분을 위한 값 (고정)
		window['intent'].set('OBJ_ID', this.mHomelearnUrl); // 종료할 앱 아이디(소스 메인 URL 또는 스킴 URL)
		window['intent'].set('OBJ_NAME', this.mAppName); // 종료할 앱 이름
		// window['intent'].set('OBJ_VERSION', this.mAppVer); // 종료할 앱의 버전
		window['intent'].set('EDAPP_ID', this.mHomelearnUrl); // 앱 아이디(소스 메인 URL 또는 스킴 URL)
		// window['intent'].set('EDAPP_VERSION', this.mAppVer); // 앱 버전
		window['intent'].set('EDAPP_NAME', this.mAppName); // 앱 이름
		// window['intent'].set('EXT_LOCATION', ?); // 이벤트가 삽입된 위치 정보

		window['sendBroad'](window['intent']);
		// window['_check'].set(window['intent']);
		// console.log(`XCaliperSend Successed ${window['xcaliperSend']}`);
	}

	//=======================================================================
	// 4.1 학습 시작 이벤트
	async AssignableStudyStarted() {
		if (!Config.mobile || Config.devMode) return;

		await this.CommonApi();
		window['intent'].set('EVENT_TYPE', EVENT_TYPE.AssignableEvent); // 이벤트 타입 (고정)
		window['intent'].set('ACTION_TYPE', ACTION_TYPE.Started); // 해당 이벤트의 액션 (고정)
		window['intent'].set('UNIQUE_ACTION', UNIQUE_ACTION.AssignableStudyStarted); // Action별 구분을 위한 값 (고정)
		let tOBJ_ID = '';
		Config.isFreeStudy
			? (tOBJ_ID = Config.getInitVariable.subj_lesson_no)
			: (tOBJ_ID = Config.getInitVariable.service_id);
		window['intent'].set('OBJ_ID', tOBJ_ID); // "학습 ID - 스스로학습/기타학습 : study_course_id 또는 subj_lesson_no  - 오늘의학습 : service_id"
		let tOBJ_TYPE = '';
		Config.isFreeStudy
			? (tOBJ_TYPE = 'DigitalResource')
			: (tOBJ_TYPE = 'AssignableDigitalResource');
		window['intent'].set('OBJ_TYPE', tOBJ_TYPE); // 학습 타입(AssignableDigitalResource : 오늘의 학습, DigitalResource : 스스로 학습/기타 학습)
		const tTitle = `${Config.subjectNum}장 ${Config.subjectName}`;
		window['intent'].set('OBJ_NAME', tTitle); // 학습 제목
		window['intent'].set('OBJ_KIND', 'Chapter'); // CourseSection(교과), Chapter(비교과)  Chapter 고정
		// window['intent'].set('OBJ_KEYWORDS', this.mAppVer); // 해당 학습을 식별하는 태그
		// window['intent'].set('OBJ_VERSION', this.mAppVer); // 학습의 버전
		// window['intent'].set('OBJ_LEARN_OBJS', this.mAppVer); // 학습자가 이해하거나 달성할 것으로 예상되는 설명
		window['intent'].set('OBJ_MEDIA_TYPE', 'text/html'); // 학습콘텐츠의 타입 (text/html 고정)
		// // window['intent'].set('OBJ_MAX_ATTEMPTS', this.mAppVer); // 허용된 시도 횟수
		// // window['intent'].set('OBJ_MAX_SCORE', this.mAppVer); // 허용된 최대 점수
		// // window['intent'].set('OBJ_MAX_SUBMITS', this.mAppVer); // 허용된 제출 횟수
		if (!Config.isFreeStudy) {
			const tPlanDeAry = Config.getInitVariable.plan_de.split('|');
			window['intent'].set('OBJ_PROG_DAY', tPlanDeAry[0]); // 학습 계획일 (오늘의 학습일 때 사용)
		}
		window['intent'].set('EDAPP_ID', this.mHomelearnUrl); // 앱 아이디(소스 메인 URL 또는 스킴 URL) 알파벳, 파닉스리딩, 사이트워드가 각각 다른 ID로 들어오도록 넣어주세요.
		// window['intent'].set('EDAPP_VERSION', this.mAppVer); // 앱 버전
		window['intent'].set('EDAPP_NAME', this.mAppName); // 앱 이름
		// window['intent'].set('EXT_LOCATION', ?); // 이벤트가 삽입된 위치 정보

		window['sendBroad'](window['intent']);
		// window['_check'].set(window['intent']);
		// console.log(`XCaliperSend Successed ${window['xcaliperSend']}`);
	}

	// 4.2 학습 종료 이벤트
	async AssignablePaused() {
		if (!Config.mobile || Config.devMode) return;

		await this.CommonApi();
		window['intent'].set('EVENT_TYPE', EVENT_TYPE.AssignableEvent); // 이벤트 타입 (고정)
		window['intent'].set('ACTION_TYPE', ACTION_TYPE.Paused); // 해당 이벤트의 액션 (고정)
		window['intent'].set('UNIQUE_ACTION', UNIQUE_ACTION.AssignablePaused); // Action별 구분을 위한 값 (고정)
		let tOBJ_ID = '';
		Config.isFreeStudy
			? (tOBJ_ID = Config.getInitVariable.subj_lesson_no)
			: (tOBJ_ID = Config.getInitVariable.service_id);
		window['intent'].set('OBJ_ID', tOBJ_ID); // "학습 ID - 스스로학습/기타학습 : study_course_id 또는 subj_lesson_no  - 오늘의학습 : service_id"
		let tOBJ_TYPE = '';
		Config.isFreeStudy
			? (tOBJ_TYPE = 'DigitalResource')
			: (tOBJ_TYPE = 'AssignableDigitalResource');
		window['intent'].set('OBJ_TYPE', tOBJ_TYPE); // 학습 타입(AssignableDigitalResource : 오늘의 학습, DigitalResource : 스스로 학습/기타 학습)
		const tTitle = `${Config.subjectNum}장 ${Config.subjectName}`;
		window['intent'].set('OBJ_NAME', tTitle); // 학습 제목
		window['intent'].set('OBJ_KIND', 'Chapter'); // CourseSection(교과), Chapter(비교과)  Chapter 고정
		// window['intent'].set('OBJ_KEYWORDS', this.mAppVer); // 해당 학습을 식별하는 태그
		// window['intent'].set('OBJ_VERSION', this.mAppVer); // 학습의 버전
		// window['intent'].set('OBJ_LEARN_OBJS', this.mAppVer); // 학습자가 이해하거나 달성할 것으로 예상되는 설명
		window['intent'].set('OBJ_MEDIA_TYPE', 'text/html'); // 학습콘텐츠의 타입 (text/html 고정)
		// // window['intent'].set('OBJ_MAX_ATTEMPTS', this.mAppVer); // 허용된 시도 횟수
		// // window['intent'].set('OBJ_MAX_SCORE', this.mAppVer); // 허용된 최대 점수
		// // window['intent'].set('OBJ_MAX_SUBMITS', this.mAppVer); // 허용된 제출 횟수
		if (!Config.isFreeStudy) {
			const tPlanDeAry = Config.getInitVariable.plan_de.split('|');
			window['intent'].set('OBJ_PROG_DAY', tPlanDeAry[0]); // 학습 계획일 (오늘의 학습일 때 사용)
		}
		window['intent'].set('EDAPP_ID', this.mHomelearnUrl); // 앱 아이디(소스 메인 URL 또는 스킴 URL) 알파벳, 파닉스리딩, 사이트워드가 각각 다른 ID로 들어오도록 넣어주세요.
		// window['intent'].set('EDAPP_VERSION', this.mAppVer); // 앱 버전
		window['intent'].set('EDAPP_NAME', this.mAppName); // 앱 이름
		// window['intent'].set('EXT_LOCATION', ?); // 이벤트가 삽입된 위치 정보

		window['sendBroad'](window['intent']);
		// window['_check'].set(window['intent']);
		// console.log(`XCaliperSend Successed ${window['xcaliperSend']}`);
	}

	// 4.3 학습 완료 이벤트
	async AssignableStudyCompleted() {
		if (!Config.mobile || Config.devMode) return;

		await this.CommonApi();
		window['intent'].set('EVENT_TYPE', EVENT_TYPE.AssignableEvent); // 이벤트 타입 (고정)
		window['intent'].set('ACTION_TYPE', ACTION_TYPE.Completed); // 해당 이벤트의 액션 (고정)
		window['intent'].set(
			'UNIQUE_ACTION',
			UNIQUE_ACTION.AssignableStudyCompleted,
		); // Action별 구분을 위한 값 (고정)
		let tOBJ_ID = '';
		Config.isFreeStudy
			? (tOBJ_ID = Config.getInitVariable.subj_lesson_no)
			: (tOBJ_ID = Config.getInitVariable.service_id);
		window['intent'].set('OBJ_ID', tOBJ_ID); // "학습 ID - 스스로학습/기타학습 : study_course_id 또는 subj_lesson_no  - 오늘의학습 : service_id"
		let tOBJ_TYPE = '';
		Config.isFreeStudy
			? (tOBJ_TYPE = 'DigitalResource')
			: (tOBJ_TYPE = 'AssignableDigitalResource');
		window['intent'].set('OBJ_TYPE', tOBJ_TYPE); // 학습 타입(AssignableDigitalResource : 오늘의 학습, DigitalResource : 스스로 학습/기타 학습)
		const tTitle = `${Config.subjectNum}장 ${Config.subjectName}`;
		window['intent'].set('OBJ_NAME', tTitle); // 학습 제목
		window['intent'].set('OBJ_KIND', 'Chapter'); // CourseSection(교과), Chapter(비교과)  Chapter 고정
		// window['intent'].set('OBJ_KEYWORDS', this.mAppVer); // 해당 학습을 식별하는 태그
		// window['intent'].set('OBJ_VERSION', this.mAppVer); // 학습의 버전
		// window['intent'].set('OBJ_LEARN_OBJS', this.mAppVer); // 학습자가 이해하거나 달성할 것으로 예상되는 설명
		window['intent'].set('OBJ_MEDIA_TYPE', 'text/html'); // 학습콘텐츠의 타입 (text/html 고정)
		// // window['intent'].set('OBJ_MAX_ATTEMPTS', this.mAppVer); // 허용된 시도 횟수
		// // window['intent'].set('OBJ_MAX_SCORE', this.mAppVer); // 허용된 최대 점수
		// // window['intent'].set('OBJ_MAX_SUBMITS', this.mAppVer); // 허용된 제출 횟수
		if (!Config.isFreeStudy) {
			const tPlanDeAry = Config.getInitVariable.plan_de.split('|');
			window['intent'].set('OBJ_PROG_DAY', tPlanDeAry[0]); // 학습 계획일 (오늘의 학습일 때 사용)
		}
		window['intent'].set('EDAPP_ID', this.mHomelearnUrl); // 앱 아이디(소스 메인 URL 또는 스킴 URL) 알파벳, 파닉스리딩, 사이트워드가 각각 다른 ID로 들어오도록 넣어주세요.
		// window['intent'].set('EDAPP_VERSION', this.mAppVer); // 앱 버전
		window['intent'].set('EDAPP_NAME', this.mAppName); // 앱 이름
		// window['intent'].set('EXT_LOCATION', ?); // 이벤트가 삽입된 위치 정보

		window['sendBroad'](window['intent']);
		// window['_check'].set(window['intent']);
		// console.log(`XCaliperSend Successed ${window['xcaliperSend']}`);
	}

	//=======================================================================
	// 5.1 뷰 이벤트
	async AssignableViewed(tSceneName: string, tPageNum: number) {
		if (!Config.mobile || Config.devMode) return;

		await this.CommonApi();
		window['intent'].set('EVENT_TYPE', EVENT_TYPE.ViewEvent); // 이벤트 타입 (고정)
		window['intent'].set('ACTION_TYPE', ACTION_TYPE.Viewed); // 해당 이벤트의 액션 (고정)
		window['intent'].set('UNIQUE_ACTION', UNIQUE_ACTION.AssignableViewed); // Action별 구분을 위한 값 (고정)
		// let tOBJ_ID = '';
		// Config.isFreeStudy
		// 	? (tOBJ_ID = Config.getInitVariable.subj_lesson_no)
		// 	: (tOBJ_ID = Config.getInitVariable.service_id);
		window['intent'].set('OBJ_ID', Config.getInitVariable.subj_lesson_no); // 콘텐츠 ID (study_course_id 또는 subj_lesson_no)
		window['intent'].set('OBJ_TYPE', 'WebPage'); // 대상의 타입 (WebPage 고정)
		window['intent'].set('OBJ_NAME', tSceneName); // 콘텐츠 제목 (상단 탭 이름)
		window['intent'].set('OBJ_MEDIA_TYPE', 'text/html'); // 학습콘텐츠의 타입 (text/html 고정)
		window['intent'].set('OBJ_STUDYING', Config.getInitVariable.studying); // "Y" : 오늘의 학습, "N" : 스스로학습/기타학습
		window['intent'].set('OBJ_PAGE_NUM', tPageNum); // 페이지 번호
		window['intent'].set('OBJ_SUBJ_VIW_NAME', '영어'); // 과목명
		window['intent'].set('OBJ_PRE_SUBJ_NAME', '영어'); // 과목명
		window['intent'].set('OBJ_GRADE_DIV', Config.getInitVariable.grade_div); // 학년
		window['intent'].set('OBJ_TERM_CD', Config.getInitVariable.term_cd); // 학기
		window['intent'].set('EDAPP_ID', this.mHomelearnUrl); // 앱 아이디(소스 메인 URL 또는 스킴 URL) 알파벳, 파닉스리딩, 사이트워드가 각각 다른 ID로 들어오도록 넣어주세요.
		// window['intent'].set('EDAPP_VERSION', this.mAppVer); // 앱 버전
		window['intent'].set('EDAPP_NAME', this.mAppName); // 앱 이름
		// window['intent'].set('EXT_LOCATION', ?); // 이벤트가 삽입된 위치 정보

		window['sendBroad'](window['intent']);
		// window['_check'].set(window['intent']);
		// console.log(`XCaliperSend Successed ${window['xcaliperSend']}`);
	}

	//=======================================================================
	// 9.1 미디어(비디오) 시작 이벤트
	async MediaStarted(tVideo: Video) {
		if (!Config.mobile || Config.devMode) return;

		await this.CommonApi();
		window['intent'].set('EVENT_TYPE', EVENT_TYPE.MediaEvent); // 이벤트 타입 (고정)
		window['intent'].set('ACTION_TYPE', ACTION_TYPE.Started); // 해당 이벤트의 액션 (고정)
		window['intent'].set('UNIQUE_ACTION', UNIQUE_ACTION.MediaStarted); // Action별 구분을 위한 값 (고정)
		await this.MediaSend(tVideo);
	}

	// 9.2 미디어(비디오) 재시작 이벤트
	async MediaRestarted(tVideo: Video) {
		if (!Config.mobile || Config.devMode) return;

		await this.CommonApi();
		window['intent'].set('EVENT_TYPE', EVENT_TYPE.MediaEvent); // 이벤트 타입 (고정)
		window['intent'].set('ACTION_TYPE', ACTION_TYPE.Restarted); // 해당 이벤트의 액션 (고정)
		window['intent'].set('UNIQUE_ACTION', UNIQUE_ACTION.MediaRestarted); // Action별 구분을 위한 값 (고정)
		await this.MediaSend(tVideo);
	}

	// 9.3 미디어(비디오) 일시 정지 이벤트
	async MediaPaused(tVideo: Video) {
		if (!Config.mobile || Config.devMode) return;

		await this.CommonApi();
		window['intent'].set('EVENT_TYPE', EVENT_TYPE.MediaEvent); // 이벤트 타입 (고정)
		window['intent'].set('ACTION_TYPE', ACTION_TYPE.Paused); // 해당 이벤트의 액션 (고정)
		window['intent'].set('UNIQUE_ACTION', UNIQUE_ACTION.MediaPaused); // Action별 구분을 위한 값 (고정)
		await this.MediaSend(tVideo);
	}

	// 9.4 미디어(비디오) 재개 이벤트
	async MediaResumed(tVideo: Video) {
		if (!Config.mobile || Config.devMode) return;

		await this.CommonApi();
		window['intent'].set('EVENT_TYPE', EVENT_TYPE.MediaEvent); // 이벤트 타입 (고정)
		window['intent'].set('ACTION_TYPE', ACTION_TYPE.Resumed); // 해당 이벤트의 액션 (고정)
		window['intent'].set('UNIQUE_ACTION', UNIQUE_ACTION.MediaResumed); // Action별 구분을 위한 값 (고정)
		await this.MediaSend(tVideo);
	}

	// 9.5 미디어(비디오) 종료 이벤트
	async MediaEnded(tVideo: Video) {
		if (!Config.mobile || Config.devMode) return;

		await this.CommonApi();
		window['intent'].set('EVENT_TYPE', EVENT_TYPE.MediaEvent); // 이벤트 타입 (고정)
		window['intent'].set('ACTION_TYPE', ACTION_TYPE.Ended); // 해당 이벤트의 액션 (고정)
		window['intent'].set('UNIQUE_ACTION', UNIQUE_ACTION.MediaEnded); // Action별 구분을 위한 값 (고정)
		await this.MediaSend(tVideo);
	}

	// 9.6 미디어(비디오) 완료 이벤트
	async MediaCompleted(tVideo: Video) {
		if (!Config.mobile || Config.devMode) return;

		await this.CommonApi();
		window['intent'].set('EVENT_TYPE', EVENT_TYPE.MediaEvent); // 이벤트 타입 (고정)
		window['intent'].set('ACTION_TYPE', ACTION_TYPE.Completed); // 해당 이벤트의 액션 (고정)
		window['intent'].set('UNIQUE_ACTION', UNIQUE_ACTION.MediaCompleted); // Action별 구분을 위한 값 (고정)
		await this.MediaSend(tVideo);
	}

	// 9.8 미디어(비디오) 점프 이벤트
	async MediaJumpedTo(tVideo: Video, tPrevTime: number) {
		if (!Config.mobile || Config.devMode) return;

		await this.CommonApi();
		window['intent'].set('EVENT_TYPE', EVENT_TYPE.MediaEvent); // 이벤트 타입 (고정)
		window['intent'].set('ACTION_TYPE', ACTION_TYPE.JumpedTo); // 해당 이벤트의 액션 (고정)
		window['intent'].set('UNIQUE_ACTION', UNIQUE_ACTION.MediaJumpedTo); // Action별 구분을 위한 값 (고정)

		window['intent'].set('TG_PREVTIME', tPrevTime); // 이동 전 미디어의 시간(SEC)
		await this.MediaSend(tVideo);
	}

	// 9.17 미디어(비디오) 음소거 이벤트
	async MediaMuted(tVideo: Video) {
		if (!Config.mobile || Config.devMode) return;

		await this.CommonApi();
		window['intent'].set('EVENT_TYPE', EVENT_TYPE.MediaEvent); // 이벤트 타입 (고정)
		window['intent'].set('ACTION_TYPE', ACTION_TYPE.Muted); // 해당 이벤트의 액션 (고정)
		window['intent'].set('UNIQUE_ACTION', UNIQUE_ACTION.MediaMuted); // Action별 구분을 위한 값 (고정)
		await this.MediaSend(tVideo);
	}

	// 9.18 미디어(비디오) 음소거 해제 이벤트
	async MediaUnmuted(tVideo: Video) {
		if (!Config.mobile || Config.devMode) return;

		await this.CommonApi();
		window['intent'].set('EVENT_TYPE', EVENT_TYPE.MediaEvent); // 이벤트 타입 (고정)
		window['intent'].set('ACTION_TYPE', ACTION_TYPE.Unmuted); // 해당 이벤트의 액션 (고정)
		window['intent'].set('UNIQUE_ACTION', UNIQUE_ACTION.MediaUnmuted); // Action별 구분을 위한 값 (고정)
		await this.MediaSend(tVideo);
	}

	// 미디어 후속처리 함수를 나타낸다.
	private MediaSend(tVideo: Video) {
		const tDuration = tVideo.video.duration;
		// const tMute = tVideo.video.muted;
		const tCurTime = tVideo.video.currentTime;
		const tVolume = tVideo.video.volume;
		const tUrl = tVideo.video.currentSrc;

		// window['intent'].set('OBJ_ID', 23); // 미디어 고유 ID (cms_id)
		const tTitle = `${Config.subjectNum}장 ${Config.subjectName}`;
		window['intent'].set('OBJ_NAME', tTitle); // 미디어 제목
		window['intent'].set('OBJ_TYPE', 'VideoObject'); // 미디어 type (AudioObject, ImageObject, MediaObject, VideoObject, GameObject)
		window['intent'].set('OBJ_MEDIA_TYPE', 'video/mp4'); // 미디어 파일 타입
		window['intent'].set('OBJ_URL', tUrl); // 미디어의 URL
		// window['intent'].set('OBJ_KEYWORDS', '"4학년1학기","국어","생각","느낌"'); // 미디어 식별 태그
		// window['intent'].set('OBJ_LEARN_OBJS', '"시의 3음절","끊어읽기"'); // 학습자가 이해하거나 달성할 것으로 예상되는 설명
		// window['intent'].set('OBJ_DATE_PUBLISHED', '2018-08-01T06:00:00.000Z'); // object 공개 시점 (yyyy-MM-dd’T’HH:mm:ss.SSS’Z’)
		// window['intent'].set('OBJ_DATE_MODIFIED', '2018-08-01T06:00:00.000Z'); // object 변경 시점 (yyyy-MM-dd’T’HH:mm:ss.SSS’Z’)
		window['intent'].set('OBJ_DURATION', tDuration); // 미디어 전체 시간(SEC)
		// window['intent'].set('OBJ_VOLUME_LEVEL', tVolume); // 현재 볼륨 단계
		// window['intent'].set('OBJ_VOLUME_MIN', '0'); // 최소 볼륨 단계
		// window['intent'].set('OBJ_VOLUME_MAX', '1'); // 최대 볼륨 단계
		window['intent'].set('OBJ_MUTED', tVolume === 0 ? true : false); // 음소거 여부 (true : 음소거)
		window['intent'].set('TG_CURTIME', tCurTime); // 미디어의 현재 시간(SEC)
		window['intent'].set('EDAPP_ID', this.mHomelearnUrl); // 앱 아이디(소스 메인 URL 또는 스킴 URL) 알파벳, 파닉스리딩, 사이트워드가 각각 다른 ID로 들어오도록 넣어주세요.
		// window['intent'].set('EDAPP_VERSION', this.mAppVer); // 앱 버전
		window['intent'].set('EDAPP_NAME', this.mAppName); // 앱 이름
		// window['intent'].set('EXT_LOCATION', ?); // 이벤트가 삽입된 위치 정보

		window['sendBroad'](window['intent']);
		// window['_check'].set(window['intent']);
		// console.log(`XCaliperSend Successed ${window['xcaliperSend']}`);
	}
}

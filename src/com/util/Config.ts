const devMode = false; // ******* 주의! 개발자 모드일 경우 true, 실서비스 모드일 경우 flase 로 바꿔줄것! *******

export default {
	devMode: devMode, // 개발자 모드, 실서비스 모드 구분을 나타낸다.
	// restAPIProd: devMode
	// 	? 'https://imestudy.smartdoodle.net/ictest/rsc/'
	// 	: 'https://xcdn.home-learn.com/preschool_eng/n_study_test/2021/ps_eng/',
	// bigdataAPIProd: devMode ? 'dev' : 'dev',
	restAPIProd: devMode
		? 'https://xcdn.home-learn.com/preschool_eng/n_study_test/2021/ps_eng/'
		: 'https://xcdn.home-learn.com/preschool_eng/n_study/2021/ps_eng/',
	bigdataAPIProd: devMode ? 'dev' : 'ops',
	// restAPI: './rsc/',
	restAPI: 'https://imestudy.smartdoodle.net/ic_phonics/ic_phonics/rsc/',
	width: 1280,
	height: 752,
	mobile: false, // 모바일인지 PC인지 구분을 나타낸다.
	appName: 'alphabet', //alphabet, ph_reading, words
	subjectName: '', // 이전 선택 목록에서 선택된 항목명 ex) A, B, C...
	subjectNum: 1, // 이전 선택 목록에서 선택된 항목번호 ex) 1, 2, 3...
	isFreeStudy: true, //오늘의 학습 모드 설정
	currentMode: 0, // 현재 학습 모드 번호
	currentIdx: 0, // 현재 서브 학습 모드 번호

	getInitVariable: {
		debug: '0',
		cache: '1',
		ssl: '1',
		protocol: 'https',
		device: 'N',
		IsPenOnly: 'true',
		token: '',
		device_model: '',
		grade_div: '0',
		term_cd: '1',
		user_grade_div: '0',
		user_term_cd: '1',
		student_no: '',
		user_id: '2028519',
		student_nm: '',
		apiUrl: 'https://dev-api.home-learn.com',
		examUrl: 'https://dev-exam.home-learn.com',
		xmlName:
			'https://dev-api.home-learn.com/schoolStudy/SchoolStudyTypeD.json?subj_lesson_no=21383&user_id=2028519&plan_de=2021-03-08&module_no=400353',
		system: '3',
		xmlType: 'H',
		studying: 'N',
		adminmode: 'N',
		testMode: 'N',
		plan_de: '',
		module_no: '',
		subj_lesson_no: '21390',
		study_course_id: '',
		subj_no: '',
		subj_viw_nm: '파닉스', //알파벳, 파닉스리딩, 사이트워드 , 파닉스
		pre_subj_nm: '예비초영어',
		movieLimit: 'N',
		busyServer: 'N',
		guide_no: '',
		service_id: '',
		studentNo: '',
		userId: '',
		gradeGbn: '0',
		homelearnUrl: 'https://dev-stu.home-learn.com',
		schoolingApiUrl: 'https://dev-api.schooling.co.kr',
		character: '',
		characterUrl: '',
		isSchoolingUser: 'false',
		semesterGbn: '1',
		nameKor: '',
		loginId: '',
		type: 'POINT_STUDY_CONE2',
		studyState: 'STUDY_DONE',
		teacherId: '0',
		isEnterMiddleApp: 'N',
		front_camera: '0',
	},
};

export default {
	studyData: {
		state: [
			{
				type: 'al_unit1',
				code: '',
				visit: false,
				complete: false,
				pageCount: 1,
				pages: [
					{
						n: 1,
						visit: false,
						complete: false,
						movie: [0],
					},
				],
				studyTime: '00:00:00',
			},
			{
				type: 'al_unit2',
				code: '',
				visit: false,
				complete: false,
				pageCount: 2,
				pages: [
					{
						n: 1,
						visit: false,
						complete: false,
						movie: [0],
					},
					{
						n: 2,
						visit: false,
						complete: false,
						movie: [0],
					},
				],
				studyTime: '00:00:00',
			},
			{
				type: 'al_unit3',
				code: '',
				visit: false,
				complete: false,
				pageCount: 2,
				pages: [
					{
						n: 1,
						visit: false,
						complete: false,
						movie: [0],
					},
					{
						n: 2,
						visit: false,
						complete: false,
						movie: [0],
					},
				],
				studyTime: '00:00:00',
			},
			{
				type: 'al_unit4',
				code: '',
				visit: false,
				complete: false,
				pageCount: 1,
				pages: [
					{
						n: 1,
						visit: false,
						complete: false,
						movie: [0],
					},
				],
				studyTime: '00:00:00',
			},
		],
		info: {
			version: '1.2',
			startDate: '', // 초기 포맷생성시 한번 입력
			date: '', // 학습 오픈시마다 갱신
			startTime: `00:00:00`, // 학습 오픈시마다 갱신
			endTime: '00:00:00', // 학습 종료시마다 갱신
			studyTime: '00:00:00', // startTime 에서 endTime 까지 시간
			studyComplete: false, // 전체 학습완료 여부
			endDate: '', // 학습 종료시마다 갱신
			allStudyTime: '', // 학습 오픈종료마다 학습시간 누적
		},
	},

	LCMS: {
		httpMovieURL: '',
		movie: '',
		scheme: '',
		uploadImageURL: '',
		content: {
			title: '1장. A a',
			item: [
				{
					tabGroups: [''],
					code: 0,
					tabIcons: [''],
					page: 0,
					type: 'al_unit1',
				},
				{
					tabGroups: [''],
					code: 0,
					tabIcons: [''],
					page: 0,
					type: 'al_unit2',
				},
				{
					tabGroups: [''],
					code: 0,
					tabIcons: [''],
					page: 0,
					type: 'al_unit3',
				},
				{
					tabGroups: [''],
					code: 0,
					tabIcons: [''],
					page: 0,
					type: 'al_unit4',
				},
			],
		},
		rootURL: 'https://xcdn.home-learn.com',
		dictionary: [],
		uploadURL: '',
		cdn_url: '/preschool_eng/n_study/2021/ps_eng/ps_alphabet/ps_alphabet_01',
		httpURL: '',
		intro: {
			term_cd: '',
			grade_div: '',
			unit: '1장. A a',
			subject: '알파벳',
			title: '',
			full_unit: '1',
		},
		rtmpMovieURL: '',
		studyCourseNmPrev: '',
		stepInfo: [
			{
				order_no: 1,
				study_course_nm: 'A a',
				lv_nm: '장',
			},
		],
		studyCourseNmNext: '',
		allStudyStateURL: '',
	},

	subjectData: [
		'A',
		'B',
		'C',
		'D',
		'E',
		'F',
		'G',
		'H',
		'I',
		'J',
		'K',
		'L',
		'M',
		'N',
		'O',
		'P',
		'Q',
		'R',
		'S',
		'T',
		'U',
		'V',
		'W',
		'X',
		'Y',
		'Z',
	],
	LoadingColor: [
		'0xb6dd4d',
		'0xffb8aa',
		'0xe6c2ff',
		'0xffd13d',
		'0xdccdbb',
		'0xffe873',
		'0xff6c99',
		'0xffd13d',
		'0x75deff',
		'0xffb8aa',
		'0xb3e463',
		'0xffe873',
		'0x70a6ff',
		'0xffcce0',
		'0xd15c7d',
		'0xffd13d',
		'0x8ce4a6',
		'0x75deff',
		'0xffcce0',
		'0xb7b1c7',
		'0x75deff',
		'0xe6c2ff',
		'0xffd13d',
		'0xb7b1c7',
		'0x75deff',
		'0x8ce4a6',
	],
	gameActbg: '',
};
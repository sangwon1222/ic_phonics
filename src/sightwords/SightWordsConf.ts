export default {
	studyData: {
		state: [
			{
				type: `sw_unit1`,
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
				studyTime: `00:00:00`,
			},
			{
				type: `sw_unit2`,
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
				studyTime: `00:00:00`,
			},
			{
				type: `sw_unit3`,
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
				studyTime: `00:00:00`,
			},
		],
		info: {
			version: `1.2`,
			startDate: ``, // 초기 포맷생성시 한번 입력
			date: ``, // 학습 오픈시마다 갱신
			startTime: `00:00:00`, // 학습 오픈시마다 갱신
			endTime: `00:00:00`, // 학습 종료시마다 갱신
			studyTime: `00:00:00`, // startTime 에서 endTime 까지 시간
			studyComplete: false, // 전체 학습완료 여부
			endDate: ``, // 학습 종료시마다 갱신
			allStudyTime: ``, // 학습 오픈종료마다 학습시간 누적
		},
	},

	LCMS: {
		httpMovieURL: ``,
		movie: ``,
		scheme: ``,
		uploadImageURL: ``,
		content: {
			title: `1장. I, am|`,
			item: [
				{
					tabGroups: [``],
					code: 0,
					tabIcons: [``],
					page: 0,
					type: `sw_unit1`,
				},
				{
					tabGroups: [``],
					code: 0,
					tabIcons: [``],
					page: 0,
					type: `sw_unit2`,
				},
				{
					tabGroups: [``],
					code: 0,
					tabIcons: [``],
					page: 0,
					type: `sw_unit3`,
				},
			],
		},
		rootURL: `https://xcdn.home-learn.com`,
		dictionary: [],
		uploadURL: ``,
		cdn_url: `/preschool_eng/n_study/2021/ps_eng/ps_words/ps_words_01`,
		httpURL: ``,
		intro: {
			term_cd: ``,
			grade_div: ``,
			unit: `1장. I, am`,
			subject: `사이트워드`,
			title: `0-3`,
			full_unit: `1`,
		},
		rtmpMovieURL: ``,
		studyCourseNmPrev: ``,
		stepInfo: [
			{
				order_no: 1,
				study_course_nm: `I, am`,
				lv_nm: `장`,
			},
		],
		studyCourseNmNext: ``,
		allStudyStateURL: ``,
	},

	subjectData: [
		`I, am`,
		`you, look`,
		`this, is, my`,
		`we, have, a`,
		`he, is, years, old`,
		`she, has, a`,
		`they, want, some`,
		`he, is, a`,
		`it, looks, like, a`,
		`I, can, see, the`,
		`this, is, yours`,
		`there, are, cars`,
		`I, like, to, play`,
		`it, is`,
		`we, go, there, by`,
		`they, went, to, the`,
		`we, will, play, in, the`,
		`I, am, from`,
		`I, play, with, my`,
		`let's, go`,
		`it, is, on, the`,
		`it, is, under, the`,
		`we, need, some`,
		`I, don't, like`,
		`she, goes, to, the`,
		`we, love, our`,
		`he, likes, the, most`,
		`I, did, it, after`,
		`she, said, be`,
		`the, goes, up, and, down`,
	],
	skinblocks: [
		{
			first: {
				nineslice: [30, 30, 30, 30],
				startblank: 20,
				endblank: 30,
				combineX: 18.5,
			},
			middle: {
				nineslice: [30, 30, 30, 30],
				startblank: 40,
				endblank: 40,
				combineX: 18.5,
			},
			last: {
				nineslice: [30, 30, 30, 30],
				startblank: 30,
				endblank: 30,
				combineX: 18.5,
			},
			back: {
				nineslice: [30, 30, 30, 30],
				startblank: 30,
				endblank: 30,
				combineX: 18.5,
			},
		},
		{
			first: {
				nineslice: [50, 50, 50, 50],
				startblank: 50,
				endblank: 50,
				combineX: 35.5,
			},
			middle: {
				nineslice: [50, 50, 50, 50],
				startblank: 50,
				endblank: 50,
				combineX: 36,
			},
			last: {
				nineslice: [50, 50, 50, 50],
				startblank: 50,
				endblank: 50,
				combineX: 37,
			},
			back: {
				nineslice: [50, 50, 50, 50],
				startblank: 50,
				endblank: 50,
				combineX: 35.5,
			},
		},
		{
			first: {
				nineslice: [50, 30, 10, 30],
				startblank: 40,
				endblank: 20,
				combineX: 0,
			},
			middle: {
				nineslice: [10, 30, 50, 30],
				startblank: 40,
				endblank: 40,
				combineX: 0,
			},
			last: {
				nineslice: [10, 30, 50, 30],
				startblank: 20,
				endblank: 40,
				combineX: 0,
			},
			back: {
				nineslice: [50, 30, 50, 30],
				startblank: 30,
				endblank: 30,
				combineX: 0,
			},
		},
	],
};

export default {
	studyData: {
		state: [
			{
				type: `ph_unit1`,
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
				type: `ph_unit2`,
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
				type: `ph_unit3`,
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
				type: `ph_unit4`,
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
			title: `1장. B`,
			item: [
				{
					tabGroups: [``],
					code: 0,
					tabIcons: [``],
					page: 0,
					type: `ph_unit1`,
				},
				{
					tabGroups: [``],
					code: 0,
					tabIcons: [``],
					page: 0,
					type: `ph_unit2`,
				},
				{
					tabGroups: [``],
					code: 0,
					tabIcons: [``],
					page: 0,
					type: `ph_unit3`,
				},
				{
					tabGroups: [``],
					code: 0,
					tabIcons: [``],
					page: 0,
					type: `ph_unit4`,
				},
			],
		},
		rootURL: `https://xcdn.home-learn.com`,
		dictionary: [],
		uploadURL: ``,
		cdn_url: `/pheschool_eng/n_study/2021/ps_eng/ps_phonics/ps_phonics_01`,
		httpURL: ``,
		intro: {
			term_cd: ``,
			grade_div: ``,
			unit: `1단계. 파닉스`,
			subject: `파닉스`,
			title: `0-3`,
			full_unit: `1-1`,
		},
		rtmpMovieURL: ``,
		studyCourseNmphev: ``,
		stepInfo: [
			{
				order_no: 1,
				study_course_nm: `기초 파닉스`,
				lv_nm: `단계`,
			},
			{
				order_no: 1,
				study_course_nm: `B`,
				lv_nm: `장`,
			},
		],
		studyCourseNmNext: ``,
		allStudyStateURL: ``,
	},

	subjectData: [
		`B`, //1
		`P`, //2
		`F`, //3
		`V`, //4
		`S`, //5
		`Z`, //6
		`D`, //7
		`T`, //8
		`L`, //9
		`R`, //10
		`K`, //11
		`C`, //12
		`N`, //13
		`M`, //14
		`G`, //15
		`W`, //16
		`H`, //17
		`X`, //18
		`J`, //19
		`Qu`, //20
		`Y`, //21
		`I`, //22
		`A`, //23
		`E`, //24
		`O`, //25
		`U`, //26
		`a_e`, //27
		`i_e`, //28
		`o_e`, //29
		`u_e`, //30
		`TH`, //31
		`Sh`, //32
		`NG`, //33
		`Ch`, //34
		`CK`, //35
		`NK`, //36
		`PH`, //37
		`EE`, //38
		`EA`, //39
		`AI`, //40
		`OO`, //41
		`AU`, //42
		`EA`, //43
		`AY`, //44
		`OA`, //45
		`OU`, //46
		`Y`, //47
		`ER`, //48
		`OR`, //49
		`UR`, //50
		`C`, //51
		`G`, //52
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
				combineX: 35.5,
			},
			last: {
				nineslice: [50, 50, 50, 50],
				startblank: 50,
				endblank: 50,
				combineX: 35,
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
	// wordsActBg: '',
	// activityTwoBg: '',
};

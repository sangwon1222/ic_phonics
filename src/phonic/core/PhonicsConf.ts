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
		`b`, //1
		`p`, //2
		`f`, //3
		`v`, //4
		`s`, //5
		`z`, //6
		`d`, //7
		`t`, //8
		`l`, //9
		`r`, //10
		`k`, //11
		`c`, //12
		`n`, //13
		`m`, //14
		`g`, //15
		`w`, //16
		`h`, //17
		`x`, //18
		`j`, //19
		`qu`, //20
		`y`, //21
		`i`, //22
		`a`, //23
		`e`, //24
		`o`, //25
		`u`, //26
		`a_e`, //27
		`i_e`, //28
		`o_e`, //29
		`u_e`, //30
		`th`, //31
		`sh`, //32
		`ng`, //33
		`ch`, //34
		`ck`, //35
		`nk`, //36
		`ph`, //37
		`ee`, //38
		`ea`, //39
		`ai`, //40
		`oo`, //41
		`au`, //42
		`ea`, //43
		`ay`, //44
		`oa`, //45
		`ou`, //46
		`y`, //47
		`er`, //48
		`or`, //49
		`ur`, //50
		`c`, //51
		`g`, //52
	],
};

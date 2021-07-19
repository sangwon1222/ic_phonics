export default {
	studyData: {
		state: [
			{
				type: `pr_unit1`,
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
				type: `pr_unit2`,
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
				type: `pr_unit3`,
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
				type: `pr_unit4`,
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
			title: `1장. Big ball`,
			item: [
				{
					tabGroups: [``],
					code: 0,
					tabIcons: [``],
					page: 0,
					type: `pr_unit1`,
				},
				{
					tabGroups: [``],
					code: 0,
					tabIcons: [``],
					page: 0,
					type: `pr_unit2`,
				},
				{
					tabGroups: [``],
					code: 0,
					tabIcons: [``],
					page: 0,
					type: `pr_unit3`,
				},
				{
					tabGroups: [``],
					code: 0,
					tabIcons: [``],
					page: 0,
					type: `pr_unit4`,
				},
			],
		},
		rootURL: `https://xcdn.home-learn.com`,
		dictionary: [],
		uploadURL: ``,
		cdn_url: `/preschool_eng/n_study/2021/ps_eng/ps_ph_reading/ps_ph_reading_01`,
		httpURL: ``,
		intro: {
			term_cd: ``,
			grade_div: ``,
			unit: `1단계. 기초 파닉스`,
			subject: `파닉스리딩`,
			title: `0-3`,
			full_unit: `1-1`,
		},
		rtmpMovieURL: ``,
		studyCourseNmPrev: ``,
		stepInfo: [
			{
				order_no: 1,
				study_course_nm: `기초 파닉스`,
				lv_nm: `단계`,
			},
			{
				order_no: 1,
				study_course_nm: `Big ball`,
				lv_nm: `장`,
			},
		],
		studyCourseNmNext: ``,
		allStudyStateURL: ``,
	},

	subjectData: [
		`Big ball`,
		`Puppy on a pot`,
		`Fat fish`,
		`Vet in a vest`,
		`The sun and the star`,
		`Zero, a zebra`,
		`Dirty dog`,
		`Toy tiger`,
		`Lazy lion`,
		`Red rose`,
		`Kiwi king`,
		`Cute cat`,
		`Nice navy net`,
		`Magic map`,
		`Gray gorilla`,
		`In the water`,
		`Hen in a hat`,
		`Fox in the box`,
		`Jelly jam`,
		`Queen's quilt`,
		`Yellow yo-yo`,
		`Big pink pig`,
		`Bad rat`,
		`Red hen`,
		`Golden tomato`,
		`Ugly bug`,
		`Snake with cake`,
		`I ride a bike`,
		`Mole with a nose`,
		`Cute tube`,
		`Thief in the theater`,
		`Shy shark`,
		`Ring with a wing`,
		`Child and a chicken`,
		`Black duck`,
		`Skunk with a tank`,
		`Dolphin`,
		`Deer under the tree`,
		`Meal`,
		`Snail in the jail`,
		`Gloomy goose`,
		`Dinosaur sausage`,
		`Healthy breakfast`,
		`Gray birds`,
		`Goat in a coat`,
		`House of a mouse`,
		`Shy fly`,
		`Tiger and a lobster`,
		`Short fork`,
		`Purple turtle`,
		`Cereal and juice`,
		`Giant giraffe`,
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
	wordsActBg: '',
	activityTwoBg: '',
};
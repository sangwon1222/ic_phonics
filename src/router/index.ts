import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
	// {
	// 	path: '/',
	// 	name: 'home',
	// 	component: () => import('@/Alphabet/alphabetPlayer.vue'),
	// },
	// {
	//   path: "/about",
	//   name: "about",
	//   // route level code-splitting
	//   // this generates a separate chunk (about.[hash].js) for this route
	//   // which is lazy-loaded when the route is visited.
	//   component: () => import(/* webpackChunkName: "about" */ "@/pages/about.vue")
	// }
	{
		// path: '/ictest/alphabet',
		path: '/alphabet',
		name: 'alphabet',
		// route level code-splitting
		// this generates a separate chunk (about.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		component: () => import('@/Alphabet/alphabetPlayer.vue'),
	},
	{
		// path: '/ictest/phonics',
		path: '/phonics',
		name: 'phonics',
		// route level code-splitting
		// this generates a separate chunk (about.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		component: () => import('@/phonics/phonicsPlayer.vue'),
	},
	{
		// path: '/ictest/phonics',
		path: '/phonic',
		name: 'phonic',
		// route level code-splitting
		// this generates a separate chunk (about.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		component: () => import('@/phonic/phonicsPlayer.vue'),
	},
	{
		// path: '/ictest/phonics',
		path: '/sightwords',
		name: 'sightwords',
		// route level code-splitting
		// this generates a separate chunk (about.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		component: () => import('@/sightwords/sightwordsPlayer.vue'),
	},
];

const router = new VueRouter({
	mode: 'history',
	// eslint-disable-next-line no-undef
	base: process.env.BASE_URL,
	routes,
});

export default router;

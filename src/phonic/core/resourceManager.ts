import { PhonicsApp } from '@/phonic/core/app';
import Config from '../../com/util/Config';

export interface ResourceTable {
	images?: Array<string>;
	sounds?: Array<string>;
	spine?: Array<string>;
	video?: Array<string>;
}

export class ResourceManager {
	// singletone
	private static _handle: ResourceManager;
	static get Handle(): ResourceManager {
		ResourceManager._handle
			? ResourceManager._handle
			: (ResourceManager._handle = new ResourceManager());

		return ResourceManager._handle;
	}

	private mURLRoot: string;
	//공통 리소스
	private mCommon: {};
	// 몇 권의 액티비티와 상관없이 게임에 공통으로 들어가는 리소스
	private mViewer: {};
	// 권마다 바뀌는 리소스
	private mProduct: {};

	constructor() {
		// this.mURLRoot = Config.restAPI;
		this.mURLRoot = `${Config.restAPIProd}ps_phonics/`;
		this.mCommon = {};
		this.mViewer = {};
		this.mProduct = {};
	}

	getCommon(fname: string): PIXI.LoaderResource {
		return this.mCommon[`${fname}`];
	}
	getViewer(fname: string): PIXI.LoaderResource {
		return this.mViewer[`${fname}`];
	}
	getProduct(fname: string): PIXI.LoaderResource {
		const sceneName = PhonicsApp.Handle.currectSceneName;
		return this.mProduct[`${sceneName}/${fname}`];
	}

	private resetLoader(): Promise<void> {
		return new Promise<void>(resolve => {
			PIXI.utils.clearTextureCache();
			PIXI.utils.destroyTextureCache();
			PIXI.Loader.shared.destroy();
			PIXI.Loader.shared.reset();
			resolve();
		});
	}

	public async loadCommonResource(rscList: ResourceTable) {
		await this.resetLoader();

		for (const [category, fnamelist] of Object.entries(rscList)) {
			for (const fname of fnamelist) {
				if (this.mCommon[`${fname}`] === undefined) {
					PIXI.Loader.shared.add(
						`${fname}`,
						`${this.mURLRoot}viewer/${category.toLowerCase()}/${fname}`,
					);
				}
			}
		}

		await this.commonLoad();
	}

	private commonLoad(): Promise<void> {
		return new Promise<void>(resolve => {
			PIXI.Loader.shared.load((loader, resource) => {
				for (const [key, value] of Object.entries(resource)) {
					if (!this.mCommon[key]) this.mCommon[key] = value;
				}
				resolve();
			});
		});
	}

	/**프로덕트 리소스 */
	public async loadProductResource(rscList: ResourceTable): Promise<void> {
		return new Promise<void>(resolve => {
			// const product = new PIXI.Loader()
			const index = Config.subjectNum;
			let day = index.toString();
			if (index < 10) {
				day = `0${Config.subjectNum}`;
			}

			const sceneName = PhonicsApp.Handle.currectSceneName;
			PIXI.utils.clearTextureCache();
			PIXI.Loader.shared.destroy();
			PIXI.Loader.shared.reset();
			for (const [category, fnamelist] of Object.entries(rscList)) {
				for (const fname of fnamelist) {
					if (this.mProduct[`${sceneName}/${fname}`] == undefined) {
						PIXI.Loader.shared.add(
							`${sceneName}/${fname}`,
							`${
								this.mURLRoot
							}ps_phonics_${day}/${sceneName}/${category.toLowerCase()}/${fname}`,
						);
					}
				}
			}

			PIXI.Loader.shared.load((loader, resource) => {
				for (const [key, value] of Object.entries(resource)) {
					if (this.mProduct[key] == undefined) {
						this.mProduct[key] = value;
					}
				}
				resolve();
			});
		});
	}
}

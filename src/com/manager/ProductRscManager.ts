// Pixi Module
import * as PIXI from 'pixi.js';
import PIXISound from 'pixi-sound';
// Net Module
import Axios from 'axios';
// Link Module
import { App } from '../../com/core/App';
import Config from '../util/Config';
import * as Util from '../util/Util';

export interface ResourceTable {
	images?: Array<string>;
	spines?: Array<string>;
	// sounds?: Array<string>;
	videos?: Array<string>;
}

export class ProductRscManager {
	//-----------------------------------
	// singleton
	private static _handle: ProductRscManager;
	static get Handle(): ProductRscManager {
		if (ProductRscManager._handle === undefined) {
			ProductRscManager._handle = new ProductRscManager();
		}
		return ProductRscManager._handle;
	}
	//-----------------------------------

	private mURLRoot = Config.restAPIProd;
	private mResource: { [name: string]: PIXI.LoaderResource };

	constructor() {
		this.mResource = {};
	}

	async getJSON(phase: number) {
		const getJSON = await Axios.get(
			`${this.mURLRoot}ps_${Config.appName}/ps_${Config.appName}_${Util.addZero(
				phase,
				2,
			)}/index.json`,
		);
		// await this.loadResource(getJSON.data);
		return getJSON;
	}

	getResource(sceneName: string, fname: string): PIXI.LoaderResource {
		return this.mResource[`${sceneName.toLowerCase()}:${fname}`];
	}

	loadResource(rscList: any): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			// PIXI.Loader.shared;
			const rscLoader = new PIXI.Loader();
			// PIXI.Loader.shared.destroy();
			// PIXI.Loader.shared.reset();

			for (const viewer in rscList) {
				for (const [category, fnamelist] of Object.entries(
					rscList[viewer] as ResourceTable,
				)) {
					for (const fname of fnamelist) {
						const fullPath = `${this.mURLRoot}ps_${Config.appName}/ps_${
							Config.appName
						}_${Util.addZero(
							Config.subjectNum,
							2,
						)}/${viewer.toLowerCase()}/${category.toLowerCase()}/${fname}`;
						// console.log(fullPath);

						if (
							category != 'tracing' &&
							category != 'matrix' &&
							category != 'queststr' &&
							category != 'correctstr' &&
							category != 'wrongstr' &&
							category != 'bgcolor' &&
							category != 'studywords' &&
							category != 'points' &&
							category != 'alphabet'
						) {
							// if (category != "data") {

							if (this.mResource[`${viewer}:${fname}`] === undefined) {
								// if (category === "videos") {
								//     fullPath = fname;
								// }
								rscLoader.add(`${viewer}:${fname}`, fullPath);

								// console.log(`${viewer}:${fname}, ${fullPath}`);
							}
						} else {
							if (this.mResource[`${viewer}:${fname}`] === undefined) {
								// console.log(`${viewer}:${category}, ${fnamelist}`);

								this.mResource[`${viewer}:${category}`] = fnamelist;
							}
						}
					}
				}
			}

			rscLoader.load((loader, resource) => {
				for (const [key, value] of Object.entries(resource)) {
					this.mResource[key] = value;
				}
				// console.log(this.mResource);
				resolve();
			});
		});
	}
}

// Pixi Module
import * as PIXI from 'pixi.js';
import PIXISound from 'pixi-sound';

export interface ResourceTable {
	images?: Array<string>;
	// sounds?: Array<string>;
	spines?: Array<string>;
}

import Axios from 'axios';
import Config from '../util/Config';
import * as Util from '../util/Util';

export class ViewerRscManager {
	//-----------------------------------
	// singleton
	private static _handle: ViewerRscManager;
	static get Handle(): ViewerRscManager {
		if (ViewerRscManager._handle === undefined) {
			ViewerRscManager._handle = new ViewerRscManager();
		}
		return ViewerRscManager._handle;
	}
	//-----------------------------------

	private mURLRoot = Config.restAPIProd;
	private mResource: { [name: string]: PIXI.LoaderResource };

	constructor() {
		this.mResource = {};
	}

	async getJSON() {
		const getJSON = await Axios.get(
			`${this.mURLRoot}ps_${Config.appName}/viewer/index.json`,
		);
		// await this.loadResource(getJSON.data);
		return getJSON;
	}

	getResource(sceneName: string, fname: string): PIXI.LoaderResource {
		// console.log(`!!!!!!!!!!!!!!!!! ${sceneName}, ${fname}`);
		// console.log(this.mResource[`${sceneName.toLowerCase()}:${fname}`]);
		return this.mResource[`${sceneName.toLowerCase()}:${fname}`];
	}

	loadResource(rscList: any): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			const rscLoader = new PIXI.Loader();

			for (const viewer in rscList) {
				for (const [category, fnamelist] of Object.entries(
					rscList[viewer] as ResourceTable,
				)) {
					for (const fname of fnamelist) {
						const fullPath = `${this.mURLRoot}ps_${
							Config.appName
						}/viewer/${viewer.toLowerCase()}/${category.toLowerCase()}/${fname}`;

						// console.log(fullPath);
						if (this.mResource[`${viewer}:${fname}`] === undefined) {
							rscLoader.add(`${viewer}:${fname}`, fullPath);
						}
					}
				}
			}

			rscLoader.load((loader, resource) => {
				for (const [key, value] of Object.entries(resource)) {
					this.mResource[key] = value;
				}
				resolve();
			});
		});
	}
}

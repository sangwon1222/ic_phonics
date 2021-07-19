// import { SceneBase } from '../../com/core/SceneBase';
// // import { App } from '../../com/core/App';
// // import { ViewerRscManager } from '../../com/manager/ViewerRscManager';
// // import gsap from 'gsap';

// export class Splash extends PIXI.Container{

//     private mSpine: PIXI.spine.Spine;
//     private mSpineData: PIXI.spine.core.SkeletonData;
//     private mAnimationName: string;
//     private mRepeat: boolean;

//     constructor(source: PIXI.spine.core.SkeletonData , animationName?: string , repeat?: boolean){
//         super()
//         this.mSpineData = source

//         this.mSpine = new PIXI.spine.Spine(this.mSpineData);
//         this.mSpine.scale.set(1);
//         this.addChild(this.mSpine);

//         this.mAnimationName = animationName
//         if(repeat){
//             this.mRepeat = repeat
//         }else{
//             this.mRepeat  = false;
//         }
//         console.log(this.mAnimationName)
//     }

//     start(delay?: number): Promise<void>{
//         // "animation"
//         return new Promise<void>( (resolve, reject )=>{

//             this.mSpine.state.setAnimation(0,this.mAnimationName, this.mRepeat)

//             if(delay){
//                 gsap.delayedCall(delay,()=>{
//                     // gsap.to(this , {alpha:0, duration:0.5})
//                     // .eventCallback("onComplete",()=>{  resolve();   })
//                     resolve();
//                 })
//             }else{
//                 this.mSpine.state.addListener({
//                     complete: ()=>{
//                         resolve();
//                     }
//                 })
//             }
//         })
//     }
// }

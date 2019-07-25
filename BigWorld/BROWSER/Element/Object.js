BigWorld.Object = CLASS({
	
	preset : () => {
		return SkyEngine.Node;
	},
	
	params : () => {
		return {
			isY2ZIndex : true
		};
	},
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.objectData
		//REQUIRED: params.kind
		//REQUIRED: params.state
		//REQUIRED: params.direction
		//OPTIONAL: params.items
		//OPTIONAL: params.isReverse
		
		let objectData = params.objectData;
		let kind = params.kind;
		let state = params.state;
		let direction = params.direction;
		let isReverse = params.isReverse;
		
		let sprites = [];
		let items = {};
		
		// 오브젝트 새로고침
		let refresh = RAR(() => {
			
			EACH(sprites, (sprite) => {
				sprite.remove();
			});
			sprites = [];
			
			let stateInfo = objectData.states[state];
			if (stateInfo !== undefined) {
				
				EACH(stateInfo.parts, (partInfo, partIndex) => {
					
					let partDirectionInfo = partInfo[direction];
					if (partDirectionInfo !== undefined) {
						
						let frameImageId = partDirectionInfo.frames[kind];
						if (frameImageId !== undefined) {
							
							sprites.push(SkyEngine.Sprite({
								src : BigWorld.RF(frameImageId),
								fps : partDirectionInfo.fps,
								frameCount : partDirectionInfo.frameCount,
								zIndex : partDirectionInfo.zIndex,
								x : partDirectionInfo.x,
								y : partDirectionInfo.y
							}).appendTo(self));
						}
					}
				});
			}
			
			EACH(items, (item) => {
				
				EXTEND({
					origin : sprites,
					extend : item.draw({
						object : self,
						state : state,
						direction : direction
					})
				});
			});
		});
		
		if (isReverse === true) {
			self.flipX();
		}
		
		let reverse = self.reverse = () => {
			isReverse = isReverse !== true;
			self.flipX();
		};
		
		let attachItem = self.attachItem = (params) => {
			//REQUIRED: params
			//REQUIRED: params.id
			//REQUIRED: params.item
			
			let id = params.id;
			let item = params.item;
			
			items[id] = item;
			
			refresh();
		};
	}
});
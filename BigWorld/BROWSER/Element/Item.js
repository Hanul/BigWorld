BigWorld.Item = CLASS({
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.itemData
		//REQUIRED: params.kind
		
		let itemData = params.itemData;
		let kind = params.kind;
		
		// 아이템 그리기
		let draw = self.draw = (params) => {
			//REQUIRED: params
			//REQUIRED: params.object
			//REQUIRED: params.state
			//REQUIRED: params.direction
			
			let object = params.object;
			let state = params.state;
			let direction = params.direction;
			
			if (state !== undefined && direction !== undefined) {
				
				let stateInfo = itemData.states[state];
				if (stateInfo !== undefined) {
					
					EACH(stateInfo.parts, (partInfo, partIndex) => {
						
						let partDirectionInfo = partInfo[direction];
						if (partDirectionInfo !== undefined) {
							
							let frameImageId = partDirectionInfo.frames[kind];
							if (frameImageId !== undefined) {
								
								SkyEngine.Sprite({
									src : BigWorld.RF(frameImageId),
									fps : partDirectionInfo.fps,
									frameCount : partDirectionInfo.frameCount,
									zIndex : partDirectionInfo.zIndex,
									x : partDirectionInfo.x,
									y : partDirectionInfo.y
								}).appendTo(object);
							}
						}
					});
				}
			}
		};
	}
});
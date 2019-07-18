BigWorld.Object = CLASS({
	
	preset : () => {
		return SkyEngine.Node;
	},
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.objectData
		//REQUIRED: params.kind
		//REQUIRED: params.state
		//REQUIRED: params.direction
		
		let objectData = params.objectData;
		let kind = params.kind;
		let state = params.state;
		let direction = params.direction;
		
		// 오브젝트 새로고침
		let refresh = RAR(() => {
			self.empty();
			
			let stateInfo = objectData.states[state];
			if (stateInfo !== undefined) {
				
				EACH(stateInfo.parts, (partInfo, partIndex) => {
					
					let frameImageIds = partInfo.frames[kind];
					if (frameImageIds !== undefined) {
						
						let frameImageId = frameImageIds[direction + 'ImageId'];
						if (frameImageId !== undefined) {
							
							SkyEngine.Sprite({
								src : BigWorld.RF(frameImageId),
								fps : partInfo.fps,
								frameCount : partInfo.frameCount,
								zIndex : partInfo.zIndex,
								x : partInfo.x,
								y : partInfo.y
							}).appendTo(self);
						}
					}
				});
			}
		});
	}
});
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
		
		let stateData = objectData.states[state];
		
		if (stateData !== undefined) {
			
			EACH(stateData.parts, (part) => {
				
				if (part.frames !== undefined) {
					
					let kindFrames = part.frames[kind];
					
					if (kindFrames !== undefined && kindFrames !== TO_DELETE) {
						
						let fileId = kindFrames[direction];
						
						if (fileId !== undefined) {
							
							SkyEngine.Sprite({
								src : BigWorld.RF(fileId),
								fps : part.fps,
								frameCount : part.frameCount,
								zIndex : part.zIndex,
								x : part.x,
								y : part.y
							}).appendTo(self);
						}
					}
				}
			});
		}
	}
});

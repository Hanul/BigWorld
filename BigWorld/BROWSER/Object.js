BigWorld.Object = CLASS({
	
	preset : () => {
		return SkyEngine.Node;
	},
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.objectData
		//REQUIRED: params.itemDataSet
		//REQUIRED: params.kind
		//REQUIRED: params.state
		//REQUIRED: params.direction
		
		let objectData = params.objectData;
		let itemDataSet = params.itemDataSet;
		let kind = params.kind;
		let state = params.state;
		let direction = params.direction;
		
		if (objectData.states !== undefined) {
			
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
		
		// 아이템을 추가합니다.
		let addItem = self.addItem = (itemData) => {
			
		};
		
		if (itemDataSet !== undefined) {
			EACH(itemDataSet, addItem);
		}
	}
});

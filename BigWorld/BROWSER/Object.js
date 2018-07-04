BigWorld.Object = CLASS({
	
	preset : () => {
		return SkyEngine.Node;
	},
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.objectData
		//OPTIONAL: params.kind
		//REQUIRED: params.state
		
		let objectData = params.objectData;
		let kind = params.kind;
		let state = params.state;
		
		// 종류가 선택되지 않으면 맨 첫 종류
		if (kind === undefined) {
			kind = 0;
		}
		
		
	}
});

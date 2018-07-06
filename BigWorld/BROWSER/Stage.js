BigWorld.Stage = CLASS({
	
	preset : () => {
		return SkyEngine.Node;
	},
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.stageData
		
		let stageData = params.stageData;
		
		// 배경 색 지정
		let background;
		SkyEngine.FixedNode({
			c : background = SkyEngine.Rect({
				width : WIN_WIDTH(),
				height : WIN_HEIGHT(),
				color : '#333'
			})
		}).appendTo(self);
		
		let resizeEvent = EVENT('resize', () => {
			background.setWidth(WIN_WIDTH());
			background.setHeight(WIN_HEIGHT());
		});
		
		self.on('remove', () => {
			resizeEvent.remove();
		});
	}
});

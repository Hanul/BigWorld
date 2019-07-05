BigWorld.SectionEditor = CLASS({
	
	preset : () => {
		return DIV;
	},
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.sectionMap
		
		// 스크린 뷰 생성
		self.append(SkyEngine.SubScreen({
			style : {
				marginRight : 10,
				backgroundColor : '#666',
				color : '#fff'
			},
			width : 400,
			height : 400,
			y : 100,
			c : []
		}));
	}
});
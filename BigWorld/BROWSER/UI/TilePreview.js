BigWorld.TilePreview = CLASS({
	
	preset : () => {
		return DIV;
	},
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//OPITONAL: params.y
		//REQUIRED: params.changeDirectionHandler
		//REQUIRED: params.refreshHandler
		
		let y = params.y;
		
		if (y === undefined) {
			y = 0;
		}
		
		let changeDirectionHandler = params.changeDirection;
		let refreshHandler = params.refresh;
		
		let direction = 'down';
		
		let previewScreen;
		
		// 프리뷰 스크린 생성
		self.append(previewScreen = SkyEngine.SubScreen({
			style : {
				backgroundColor : '#666',
				color : '#fff'
			},
			width : 414,
			height : 414,
			y : y
		}));
		
		self.addStyle({
			position : 'relative'
		});
		
		self.append(DIV({
			style : {
				position : 'absolute',
				left : 10,
				top : 7,
				fontSize : 12
			},
			c : '타일 미리보기'
		}));
		
		let refresh = self.refresh = RAR(() => {
			
			previewScreen.empty();
			
			refreshHandler(previewScreen, direction);
		});
		
		let setScale = self.setScale = (scale) => {
			previewScreen.setScale(scale);
			refresh();
		};
		
		let getDirection = self.getDirection = () => {
			return direction;
		};
	}
});
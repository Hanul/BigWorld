BigWorld.StageEditor = CLASS({
	
	preset : () => {
		return VIEW;
	},
	
	init : (inner, self) => {
		
		TITLE('BigWorld Stage Editor');
		
		// 배경 색 지정
		let background = SkyEngine.Rect({
			width : WIN_WIDTH(),
			height : WIN_HEIGHT(),
			color : '#333'
		}).appendTo(SkyEngine.Screen);
		
		let resizeEvent = EVENT('resize', () => {
			background.setWidth(WIN_WIDTH());
			background.setHeight(WIN_HEIGHT());
		});
		
		let stage;
		let wrapper;
		let touchstartEvent;
		inner.on('paramsChange', (params) => {
			
			BigWorld.StageModel.get(params.stageId, (stageData) => {
				
				stage = BigWorld.Stage({
					stageData : stageData,
					isToShowGrid : true
				}).appendTo(SkyEngine.Screen);
				
				wrapper = DIV({
					style : {
						position : 'fixed',
						left : 0,
						top : 0,
						padding : 10
					},
					c : ['맵 이름: ' + MSG(stageData.name), UUI.BUTTON_H({
						style : {
							marginTop : 10
						},
						icon : IMG({
							src : BigWorld.R('stageeditor/object.png')
						}),
						spacing : 10,
						title : '객체 선택',
						on : {
							tap : () => {
								BigWorld.CreateSelectObjectPopup();
							}
						}
					})]
				}).appendTo(BODY);
				
				touchstartEvent = EVENT('touchstart', (e) => {
					
					let startLeft = e.getLeft();
					let startTop = e.getTop();
					
					let originX = stage.getX();
					let originY = stage.getY();
					
					let touchmoveEvent = EVENT('touchmove', (e) => {
						stage.setPosition({
							x : originX + e.getLeft() - startLeft,
							y : originY + e.getTop() - startTop
						});
					});
					
					EVENT_ONCE('touchend', () => {
						touchmoveEvent.remove();
					});
				});
			});
		});
		
		inner.on('close', () => {
			background.remove();
			resizeEvent.remove();
			
			if (stage !== undefined) {
				stage.remove();
			}
			if (wrapper !== undefined) {
				wrapper.remove();
			}
			if (touchstartEvent !== undefined) {
				touchstartEvent.remove();
			}
		});
	}
});
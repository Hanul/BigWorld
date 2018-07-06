BigWorld.StageEditor = CLASS({
	
	preset : () => {
		return VIEW;
	},
	
	init : (inner, self) => {
		
		TITLE('BigWorld Stage Editor');
		
		let stage;
		let wrapper;
		let touchstartEvent;
		inner.on('paramsChange', (params) => {
			
			BigWorld.StageModel.get(params.stageId, (stageData) => {
				
				stage = BigWorld.Stage({
					stageData : stageData
				}).appendTo(SkyEngine.Screen);
				
				wrapper = DIV({
					style : {
						position : 'fixed',
						left : 0,
						top : 0
					},
					c : MSG(stageData.name)
				}).appendTo(BODY);
				
				stage.append(SkyEngine.Line({
					startX : -CONFIG.BigWorld.sectionWidth,
					startY : 0,
					endX : CONFIG.BigWorld.sectionWidth,
					endY : 0,
					border : '1px solid #fff'
				}));
				
				stage.append(SkyEngine.Line({
					startX : 0,
					startY : -CONFIG.BigWorld.sectionHeight,
					endX : 0,
					endY : CONFIG.BigWorld.sectionHeight,
					border : '1px solid #fff'
				}));
				
				touchstartEvent = EVENT('touchstart', (e) => {
					
					let startLeft = e.getLeft();
					let startTop = e.getTop();
					
					let originX = SkyEngine.Screen.getX();
					let originY = SkyEngine.Screen.getY();
					
					let touchmoveEvent = EVENT('touchmove', (e) => {
						SkyEngine.Screen.setX(originX + e.getLeft() - startLeft);
						SkyEngine.Screen.setY(originY + e.getTop() - startTop);
					});
					
					EVENT_ONCE('touchend', () => {
						touchmoveEvent.remove();
					});
				});
			});
		});
		
		inner.on('close', () => {
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
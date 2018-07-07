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
				
				let tileWidth = CONFIG.BigWorld.sectionHeight * CONFIG.BigWorld.tileSectionLevel;
				let tileHeight = CONFIG.BigWorld.sectionHeight * CONFIG.BigWorld.tileSectionLevel;
				
				REPEAT(21, (i) => {
					REPEAT(41, (j) => {
						stage.append(SkyEngine.Rect({
							x : (j - 41 / 2 + 0.5) * tileWidth,
							y : (i - 21 / 2 + 0.5) * tileHeight,
							width : tileWidth,
							height : tileHeight,
							border : '1px solid #666'
						}));
					});
				});
				
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
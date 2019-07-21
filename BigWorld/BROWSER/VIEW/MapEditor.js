BigWorld.MapEditor = CLASS({
	
	preset : () => {
		return VIEW;
	},
	
	init : (inner, self) => {
		
		TITLE('BigWorld 맵 에디터');
		
		let mapEditorStore = BigWorld.STORE('mapEditorStore');
		
		let nowMapId;
		let nowMapData;
		
		let map;
		
		let menuPanel;
		let namePanel;
		let scaleInput;
		let wrapper = DIV({
			c : [menuPanel = DIV({
				style : {
					position : 'fixed',
					left : 0,
					top : 0,
					padding : 10
				},
				c : [
				
				namePanel = DIV(),
				
				DIV({
					style : {
						marginTop : 10
					},
					c : ['스케일: ', scaleInput = INPUT({
						style : {
							width : 30,
							textAlign : 'right'
						}
					})]
				}),
				
				SkyDesktop.Button({
					style : {
						marginTop : 10,
						padding : '5px 10px'
					},
					icon : IMG({
						src : BigWorld.R('mapeditor/tile.png')
					}),
					spacing : 5,
					title : '타일 선택',
					on : {
						tap : () => {
							
							BigWorld.SelectTilePopup((tileId, tileName) => {
								console.log(tileId, tileName);
							});
						}
					}
				}),
				
				SkyDesktop.Button({
					style : {
						marginTop : 10,
						padding : '5px 10px'
					},
					icon : IMG({
						src : BigWorld.R('mapeditor/object.png')
					}),
					spacing : 5,
					title : '오브젝트 선택',
					on : {
						tap : () => {
							
							BigWorld.SelectObjectPopup((objectId, objectName) => {
								console.log(objectId, objectName);
							});
						}
					}
				})]
			})]
		}).appendTo(BODY);
		
		inner.on('paramsChange', (params) => {
			nowMapId = params.mapId;
			
			// 초기화
			if (map !== undefined) {
				map.remove();
				map = undefined;
			}
			
			// 맵 데이터를 불러옵니다.
			BigWorld.MapModel.get(nowMapId, (mapData) => {
				nowMapData = mapData;
				
				map = BigWorld.Map({
					mapData : mapData,
					isMovable : true,
					isZoomable : true,
					isToShowGrid : true,
					changeScale : (scale) => {
						scaleInput.setValue(scale.toFixed(2));
					}
				}).appendTo(SkyEngine.Screen);
				
				namePanel.empty();
				namePanel.append(MSG(mapData.name));
				
				scaleInput.setValue(map.getScaleX());
			});
		});
		
		inner.on('close', () => {
			
			if (map !== undefined) {
				map.remove();
			}
			
			touchstartEvent.remove();
			
			wrapper.remove();
		});
	}
});
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
					isToShowGrid : true
				}).appendTo(SkyEngine.Screen);
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
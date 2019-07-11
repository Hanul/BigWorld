BigWorld.Tile = CLASS({
	
	preset : () => {
		return SkyEngine.Node;
	},
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.tileData
		//OPTIONAL: params.leftTileId
		//OPTIONAL: params.rightTileId
		//OPTIONAL: params.upTileId
		//OPTIONAL: params.downTileId
		//REQUIRED: params.kind
		
		let tileData = params.tileData;
		let leftTileId = params.leftTileId;
		let rightTileId = params.rightTileId;
		let upTileId = params.upTileId;
		let downTileId = params.downTileId;
		let kind = params.kind;
		
		let drawState = (stateInfo, x, y) => {
			
			EACH(stateInfo.parts, (partInfo) => {
				
				let frameImageId = partInfo.frames[RANDOM(partInfo.frames.length)];
				if (frameImageId !== undefined) {
					
					SkyEngine.Sprite({
						src : BigWorld.RF(frameImageId),
						fps : partInfo.fps,
						frameCount : partInfo.frameCount,
						zIndex : partInfo.zIndex,
						x : partInfo.x + x,
						y : partInfo.y + y
					}).appendTo(self);
				}
			});
		};
		
		// 타일 새로고침
		let refresh = RAR(() => {
			self.empty();
			
			let stateInfos = tileData.states;
			
			if (stateInfos.center !== undefined) {
				drawState(stateInfos.center, 0, 0);
			}
			
			if (leftTileId !== tileData.id && stateInfos.left !== undefined) {
			}
			
			/*tileData.states.center
			
			let stateInfo = tileData.states[state];
			if (stateInfo !== undefined) {
				
				EACH(stateInfo.parts, (partInfo) => {
					
					let frameImageId = partInfo.frames[kind];
					if (frameImageId !== undefined) {
						
						SkyEngine.Sprite({
							src : BigWorld.RF(frameImageId),
							fps : partInfo.fps,
							frameCount : partInfo.frameCount,
							zIndex : partInfo.zIndex,
							x : partInfo.x,
							y : partInfo.y
						}).appendTo(self);
					}
				});
			}*/
		});
	}
});
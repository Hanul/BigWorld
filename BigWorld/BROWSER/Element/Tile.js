BigWorld.Tile = CLASS((cls) => {
	
	// 타일의 크기
	let tileWidth = CONFIG.BigWorld.sectionWidth * CONFIG.BigWorld.tileSectionLevel;
	let tileHeight = CONFIG.BigWorld.sectionHeight * CONFIG.BigWorld.tileSectionLevel;
	
	let initSectionMap = [];
	REPEAT(CONFIG.BigWorld.tileSectionLevel, () => {
		let initSections = [];
		REPEAT(CONFIG.BigWorld.tileSectionLevel, () => {
			initSections.push({
				z : 0
			});
		});
		initSectionMap.push(initSections);
	});
	
	let getInitSectionMap = cls.getInitSectionMap = () => {
		return initSectionMap;
	};
	
	return {
		
		preset : () => {
			return SkyEngine.Node;
		},
		
		init : (inner, self, params) => {
			//REQUIRED: params
			//REQUIRED: params.col
			//REQUIRED: params.row
			//REQUIRED: params.tileData
			//REQUIRED: params.kindMap
			//OPTIONAL: params.leftTileId
			//OPTIONAL: params.leftTopTileId
			//OPTIONAL: params.topTileId
			//OPTIONAL: params.rightTopTileId
			//OPTIONAL: params.rightTileId
			//OPTIONAL: params.rightBottomTileId
			//OPTIONAL: params.bottomTileId
			//OPTIONAL: params.leftBottomTileId
			
			let col = params.col;
			let row = params.row;
			
			let tileData = params.tileData;
			let kindMap = params.kindMap;
			
			let leftTileId = params.leftTileId;
			let leftTopTileId = params.leftTopTileId;
			let topTileId = params.topTileId;
			let rightTopTileId = params.rightTopTileId;
			let rightTileId = params.rightTileId;
			let rightBottomTileId = params.rightBottomTileId;
			let bottomTileId = params.bottomTileId;
			let leftBottomTileId = params.leftBottomTileId;
			
			self.setX(col * tileWidth);
			self.setY(row * tileHeight);
			
			let drawState = (state, x, y) => {
				
				let stateInfo = tileData.states[state];
				if (stateInfo !== undefined) {
					
					EACH(stateInfo.parts, (partInfo, partIndex) => {
						
						let frameImageId = partInfo.frames[kindMap[state][partIndex]];
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
				}
			};
			
			// 타일 새로고침
			let refresh = RAR(() => {
				self.empty();
				
				drawState('center', 0, 0);
				
				// 왼쪽의 타일이 다른 경우
				if (leftTileId !== tileData.id) {
					
					// 왼쪽 위와 아래가 같은 타일인 경우
					if (leftTopTileId === tileData.id && leftBottomTileId === tileData.id) {
						// 그냥 center를 그립니다.
						drawState('center', -tileWidth, 0);
					}
					
					// 왼쪽 위가 같은 타일인 경우
					else if (leftTopTileId === tileData.id) {
						drawState('fillRightTop', -tileWidth, 0);
					}
					
					// 왼쪽 아래가 같은 타일인 경우
					else if (leftBottomTileId === tileData.id) {
						drawState('fillRightBottom', -tileWidth, 0);
					}
					
					else {
						drawState('left', -tileWidth, 0);
					}
				}
				
				if (leftTileId !== tileData.id && leftTopTileId !== tileData.id && topTileId !== tileData.id) {
					drawState('leftTop', -tileWidth, -tileHeight);
				}
				
				// 위 타일이 다른 경우
				if (topTileId !== tileData.id) {
					
					// 위 왼쪽과 위 오른쪽이 같은 타일인 경우
					if (leftTopTileId === tileData.id && rightTopTileId === tileData.id) {
						// 그냥 center를 그립니다.
						drawState('center', 0, -tileHeight);
					}
					
					// 위 왼쪽이 같은 타일인 경우
					else if (leftTopTileId === tileData.id) {
						drawState('fillLeftBottom', 0, -tileHeight);
					}
					
					// 위 오른쪽이 같은 타일인 경우
					else if (rightTopTileId === tileData.id) {
						// 이미 존재합니다.
					}
					
					else {
						drawState('top', 0, -tileHeight);
					}
				}
				
				if (topTileId !== tileData.id && rightTopTileId !== tileData.id && rightTileId !== tileData.id) {
					drawState('rightTop', tileWidth, -tileHeight);
				}
				
				// 오른쪽의 타일이 다른 경우
				if (rightTileId !== tileData.id) {
					
					// 오른쪽 위와 아래가 같은 타일인 경우
					if (rightTopTileId === tileData.id && rightBottomTileId === tileData.id) {
						// 그냥 center를 그립니다.
						drawState('center', tileWidth, 0);
					}
					
					// 오른쪽 위와 같은 타일인 경우
					else if (rightTopTileId === tileData.id) {
						drawState('fillLeftTop', tileWidth, 0);
					}
					
					// 오른쪽 아래가 같은 타일인 경우
					else if (rightBottomTileId === tileData.id) {
						// 이미 존재합니다.
					}
					
					else {
						drawState('right', tileWidth, 0);
					}
				}
				
				if (rightTileId !== tileData.id && rightBottomTileId !== tileData.id && bottomTileId !== tileData.id) {
					drawState('rightBottom', tileWidth, tileHeight);
				}
				
				// 아래 타일이 다른 경우
				if (bottomTileId !== tileData.id) {
					
					// 아래 왼쪽과 아래 오른쪽이 같은 타일인 경우
					if (leftBottomTileId === tileData.id && rightBottomTileId === tileData.id) {
						// 그냥 center를 그립니다.
						drawState('center', 0, tileHeight);
					}
					
					// 아래 왼쪽이 같은 타일인 경우
					else if (leftBottomTileId === tileData.id) {
						// 이미 존재합니다.
					}
					
					// 아래 오른쪽이 같은 타일인 경우
					else if (rightBottomTileId === tileData.id) {
						// 이미 존재합니다.
					}
					
					else {
						drawState('bottom', 0, tileHeight);
					}
				}
				
				if (bottomTileId !== tileData.id && leftBottomTileId !== tileData.id && leftTileId !== tileData.id) {
					drawState('leftBottom', -tileWidth, tileHeight);
				}
			});
		}
	};
});
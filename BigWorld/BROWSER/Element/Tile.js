BigWorld.Tile = CLASS((cls) => {
	
	// 타일의 크기
	const TILE_WIDTH = CONFIG.BigWorld.sectionWidth * CONFIG.BigWorld.tileSectionLevel;
	const TILE_HEIGHT = CONFIG.BigWorld.sectionHeight * CONFIG.BigWorld.tileSectionLevel;
	
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
	
	let getTileWidth = cls.getTileWidth = (x, y) => {
		return TILE_WIDTH;
	};
	
	let getTileHeight = cls.getTileHeight = (x, y) => {
		return TILE_HEIGHT;
	};
	
	let getTileCol = cls.getTileCol = (x, y) => {
		return Math.round(x / TILE_WIDTH);
	};
	
	let getTileRow = cls.getTileRow = (x, y) => {
		return Math.round(y / TILE_WIDTH);
	};
	
	let getTileX = cls.getTileX = (col, row) => {
		return col * TILE_WIDTH;
	};
	
	let getTileY = cls.getTileY = (col, row) => {
		return row * TILE_HEIGHT;
	};
	
	return {
		
		preset : () => {
			return SkyEngine.Node;
		},
		
		init : (inner, self, params) => {
			//REQUIRED: params
			//OPTIONAL: params.alpha
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
			
			let alpha = params.alpha;
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
			
			self.setX(col * TILE_WIDTH);
			self.setY(row * TILE_HEIGHT);
			
			let drawState = (state, x, y) => {
				
				let sprites = [];
				
				let stateInfo = tileData.states[state];
				if (stateInfo !== undefined) {
					
					EACH(stateInfo.parts, (partInfo, partIndex) => {
						
						let frameImageId = partInfo.frames[kindMap[state][partIndex]];
						if (frameImageId !== undefined) {
							
							sprites.push(SkyEngine.Sprite({
								alpha : alpha,
								src : BigWorld.RF(frameImageId),
								fps : partInfo.fps,
								frameCount : partInfo.frameCount,
								zIndex : partInfo.zIndex,
								x : self.getX() + partInfo.x + x,
								y : self.getY() + partInfo.y + y
							}).appendTo(self.getParent()));
						}
					});
				}
				
				return sprites;
			};
			
			let centerSprites = [];
			let leftSprites = [];
			let leftTopSprites = [];
			let topSprites = [];
			let rightTopSprites = [];
			let rightSprites = [];
			let rightBottomSprites = [];
			let bottomSprites = [];
			let leftBottomSprites = [];
			
			let clearSprites = (sprites) => {
				sprites.forEach((sprite) => {
					sprite.remove();
				});
			};
			
			// 왼쪽 그리기
			let drawLeft = () => {
				clearSprites(leftSprites);
				
				// 왼쪽의 타일이 다른 경우
				if (leftTileId !== tileData.id) {
					
					// 왼쪽 위와 아래가 같은 타일인 경우
					if (leftTopTileId === tileData.id && leftBottomTileId === tileData.id) {
						// 그냥 center를 그립니다.
						leftSprites = drawState('center', -TILE_WIDTH, 0);
					}
					
					// 왼쪽 위가 같은 타일인 경우
					else if (leftTopTileId === tileData.id) {
						leftSprites = drawState('fillRightTop', -TILE_WIDTH, 0);
					}
					
					// 왼쪽 아래가 같은 타일인 경우
					else if (leftBottomTileId === tileData.id) {
						leftSprites = drawState('fillRightBottom', -TILE_WIDTH, 0);
					}
					
					else {
						leftSprites = drawState('left', -TILE_WIDTH, 0);
					}
				}
				
				else {
					leftSprites = [];
				}
			};
			
			// 왼쪽 위 그리기
			let drawLeftTop = () => {
				clearSprites(leftTopSprites);
				
				// 왼쪽 위
				if (leftTileId !== tileData.id && leftTopTileId !== tileData.id && topTileId !== tileData.id) {
					leftTopSprites = drawState('leftTop', -TILE_WIDTH, -TILE_HEIGHT);
				}
				
				else {
					leftTopSprites = [];
				}
			};
			
			// 위쪽 그리기
			let drawTop = () => {
				clearSprites(topSprites);
				
				// 위 타일이 다른 경우
				if (topTileId !== tileData.id) {
					
					// 위 왼쪽과 위 오른쪽이 같은 타일인 경우
					if (leftTopTileId === tileData.id && rightTopTileId === tileData.id) {
						// 그냥 center를 그립니다.
						topSprites = drawState('center', 0, -TILE_HEIGHT);
					}
					
					// 위 왼쪽이 같은 타일인 경우
					else if (leftTopTileId === tileData.id) {
						topSprites = drawState('fillLeftBottom', 0, -TILE_HEIGHT);
					}
					
					// 위 오른쪽이 같은 타일인 경우
					else if (rightTopTileId === tileData.id) {
						// 이미 존재합니다.
						topSprites = [];
					}
					
					else {
						topSprites = drawState('top', 0, -TILE_HEIGHT);
					}
				}
				
				else {
					topSprites = [];
				}
			};
			
			// 오른쪽 위 그리기
			let drawRightTop = () => {
				clearSprites(rightTopSprites);
				
				// 오른쪽 위
				if (topTileId !== tileData.id && rightTopTileId !== tileData.id && rightTileId !== tileData.id) {
					rightTopSprites = drawState('rightTop', TILE_WIDTH, -TILE_HEIGHT);
				}
				
				else {
					rightTopSprites = [];
				}
			};
			
			// 오른쪽 그리기
			let drawRight = () => {
				clearSprites(rightSprites);
				
				// 오른쪽의 타일이 다른 경우
				if (rightTileId !== tileData.id) {
					
					// 오른쪽 위와 아래가 같은 타일인 경우
					if (rightTopTileId === tileData.id && rightBottomTileId === tileData.id) {
						// 그냥 center를 그립니다.
						rightSprites = drawState('center', TILE_WIDTH, 0);
					}
					
					// 오른쪽 위와 같은 타일인 경우
					else if (rightTopTileId === tileData.id) {
						rightSprites = drawState('fillLeftTop', TILE_WIDTH, 0);
					}
					
					// 오른쪽 아래가 같은 타일인 경우
					else if (rightBottomTileId === tileData.id) {
						// 이미 존재합니다.
						rightSprites = [];
					}
					
					else {
						rightSprites = drawState('right', TILE_WIDTH, 0);
					}
				}
				
				else {
					rightSprites = [];
				}
			};
			
			// 오른쪽 아래 그리기
			let drawRightBottom = () => {
				clearSprites(rightBottomSprites);
				
				// 오른쪽 아래
				if (rightTileId !== tileData.id && rightBottomTileId !== tileData.id && bottomTileId !== tileData.id) {
					rightBottomSprites = drawState('rightBottom', TILE_WIDTH, TILE_HEIGHT);
				}
				
				else {
					rightBottomSprites = [];
				}
			};
			
			// 아래 그리기
			let drawBottom = () => {
				clearSprites(bottomSprites);
				
				// 아래 타일이 다른 경우
				if (bottomTileId !== tileData.id) {
					
					// 아래 왼쪽과 아래 오른쪽이 같은 타일인 경우
					if (leftBottomTileId === tileData.id && rightBottomTileId === tileData.id) {
						// 그냥 center를 그립니다.
						bottomSprites = drawState('center', 0, TILE_HEIGHT);
					}
					
					// 아래 왼쪽이 같은 타일인 경우
					else if (leftBottomTileId === tileData.id) {
						// 이미 존재합니다.
						bottomSprites = [];
					}
					
					// 아래 오른쪽이 같은 타일인 경우
					else if (rightBottomTileId === tileData.id) {
						// 이미 존재합니다.
						bottomSprites = [];
					}
					
					else {
						bottomSprites = drawState('bottom', 0, TILE_HEIGHT);
					}
				}
				
				else {
					bottomSprites = [];
				}
			};
			
			// 왼쪽 아래 그리기
			let drawLeftBottom = () => {
				clearSprites(leftBottomSprites);
				
				// 왼쪽 아래
				if (bottomTileId !== tileData.id && leftBottomTileId !== tileData.id && leftTileId !== tileData.id) {
					leftBottomSprites = drawState('leftBottom', -TILE_WIDTH, TILE_HEIGHT);
				}
				
				else {
					leftBottomSprites = [];
				}
			};
			
			// 타일 그리기
			let draw = self.draw = () => {
				clearSprites(centerSprites);
				
				// 가운데 그리기
				centerSprites = drawState('center', 0, 0);
				
				// 주변 그리기
				drawLeft();
				drawLeftTop();
				drawTop();
				drawRightTop();
				drawRight();
				drawRightBottom();
				drawBottom();
				drawLeftBottom();
			};
			
			self.on('remove', () => {
				clearSprites(centerSprites);
				clearSprites(leftSprites);
				clearSprites(leftTopSprites);
				clearSprites(topSprites);
				clearSprites(rightTopSprites);
				clearSprites(rightSprites);
				clearSprites(rightBottomSprites);
				clearSprites(bottomSprites);
				clearSprites(leftBottomSprites);
			});
			
			let setLeftTileId = self.setLeftTileId = (_leftTileId) => {
				//REQUIRED: leftTileId
				
				leftTileId = _leftTileId;
				
				drawLeft();
				drawLeftTop();
				drawLeftBottom();
			};
			
			let setLeftTopTileId = self.setLeftTopTileId = (_leftTopTileId) => {
				//REQUIRED: leftTopTileId
				
				leftTopTileId = _leftTopTileId;
				
				drawLeft();
				drawLeftTop();
				drawTop();
			};
			
			let setTopTileId = self.setTopTileId = (_topTileId) => {
				//REQUIRED: topTileId
				
				topTileId = _topTileId;
				
				drawLeftTop();
				drawTop();
				drawRightTop();
			};
			
			let setRightTopTileId = self.setRightTopTileId = (_rightTopTileId) => {
				//REQUIRED: rightTopTileId
				
				rightTopTileId = _rightTopTileId;
				
				drawTop();
				drawRightTop();
				drawRight();
			};
			
			let setRightTileId = self.setRightTileId = (_rightTileId) => {
				//REQUIRED: rightTileId
				
				rightTileId = _rightTileId;
				
				drawRightTop();
				drawRight();
				drawRightBottom();
			};
			
			let setRightBottomTileId = self.setRightBottomTileId = (_rightBottomTileId) => {
				//REQUIRED: rightBottomTileId
				
				rightBottomTileId = _rightBottomTileId;
				
				drawRight();
				drawRightBottom();
				drawBottom();
			};
			
			let setBottomTileId = self.setBottomTileId = (_bottomTileId) => {
				//REQUIRED: bottomTileId
				
				bottomTileId = _bottomTileId;
				
				drawRightBottom();
				drawBottom();
				drawLeftBottom();
			};
			
			let setLeftBottomTileId = self.setLeftBottomTileId = (_leftBottomTileId) => {
				//REQUIRED: leftBottomTileId
				
				leftBottomTileId = _leftBottomTileId;
				
				drawBottom();
				drawLeftBottom();
				drawLeft();
			};
			
			let getId = self.getId = () => {
				return tileData.id;
			};
			
			let setData = self.setData = (_tileData) => {
				//REQUIRED: tileData
				
				tileData = _tileData;
				
				draw();
			};
		}
	};
});
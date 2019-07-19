BigWorld.Map = CLASS(() => {
	
	const BASE_MIN_SCALE = 0.3;
	const BASE_MAX_SCALE = 10;
	
	return {
		
		preset : () => {
			return SkyEngine.Node;
		},
		
		init : (inner, self, params) => {
			//REQUIRED: params
			//REQUIRED: params.mapData
			//REQUIRED: params.isMovable
			//OPTIONAL: params.isZoomable
			//OPTIONAL: params.minScale
			//OPTIONAL: params.maxScale
			//OPTIONAL: params.isToShowGrid
			
			let mapData = params.mapData;
			let isMovable = params.isMovable;
			let isZoomable = params.isZoomable;
			let minScale = params.minScale;
			let maxScale = params.maxScale;
			let isToShowGrid = params.isToShowGrid;
			
			if (minScale === undefined) {
				minScale = BASE_MIN_SCALE;
			}
			if (maxScale === undefined) {
				maxScale = BASE_MAX_SCALE;
			}
			
			// 타일의 크기
			let tileWidth = CONFIG.BigWorld.sectionWidth * CONFIG.BigWorld.tileSectionLevel;
			let tileHeight = CONFIG.BigWorld.sectionHeight * CONFIG.BigWorld.tileSectionLevel;
			
			let gridWrapper;
			let drawGridDelay;
			
			if (isToShowGrid === true) {
				gridWrapper = SkyEngine.Node().appendTo(self);
			}
			
			let zones = {};
			
			let loadElements = RAR(() => {
				
				let boundaryWidth = WIN_WIDTH() / 2 / self.getScaleX();
				let boundaryHeight = WIN_HEIGHT() / 2 / self.getScaleY();
				
				let startTileRow = INTEGER((-self.getY() / self.getScaleY() - boundaryHeight) / tileHeight) - 1;
				let endTileRow = INTEGER((-self.getY() / self.getScaleY() + boundaryHeight) / tileHeight) + 1;
				
				let startTileCol = INTEGER((-self.getX() / self.getScaleX() - boundaryWidth) / tileWidth) - 1;
				let endTileCol = INTEGER((-self.getX() / self.getScaleX() + boundaryWidth) / tileWidth) + 1;
				
				let zoneRangeMap = {};
				
				// 타일의 범위를 파악합니다.
				for (let row = startTileRow; row <= endTileRow; row += 1) {
					for (let col = startTileCol; col <= endTileCol; col += 1) {
						
						zoneRangeMap[row + ',' + col] = {
							row : row,
							col : col
						};
					}
				}
				
				EACH(zones, (zone, key) => {
					
					// 이미 존재하는 존인 경우 범위에서 제거합니다.
					if (zoneRangeMap[key] !== undefined) {
						delete zoneRangeMap[key];
					}
					
					// 범위를 벗어난 존은 제거합니다.
					else {
						zone.remove();
						delete zones[key];
					}
				});
				
				// 부족한 존을 채웁니다.
				EACH(zoneRangeMap, (range, key) => {
					
					let zone = zones[key] = SkyEngine.Node({
						x : range.col * tileWidth,
						y : range.row * tileHeight
					}).appendTo(self);
					
					//TODO:
				});
				
				// 격자 표시
				if (isToShowGrid === true) {
					
					if (drawGridDelay !== undefined) {
						drawGridDelay.remove();
					}
					
					drawGridDelay = DELAY(0.3, () => {
						drawGridDelay = undefined;
						
						gridWrapper.empty();
						
						// 타일의 범위를 파악합니다.
						for (let row = startTileRow; row <= endTileRow; row += 1) {
							for (let col = startTileCol; col <= endTileCol; col += 1) {
								
								SkyEngine.Rect({
									x : col * tileWidth,
									y : row * tileHeight,
									width : tileWidth,
									height : tileHeight,
									border : (1 / self.getScaleX()) + 'px solid #000666',
									color : '#000333'
								}).appendTo(gridWrapper)
							}
						}
						
						// 가운데 점과 선을 그립니다.
						EACH([SkyEngine.Rect({
							width : 3 / self.getScaleX(),
							height : 3 / self.getScaleX(),
							color : '#000FFF'
						}), SkyEngine.Line({
							startX : -200,
							endX : 200,
							border : (1 / self.getScaleX()) + 'px solid #000FFF'
						}), SkyEngine.Line({
							startY : -200,
							endY : 200,
							border : (1 / self.getScaleX()) + 'px solid #000FFF'
						})], gridWrapper.append);
					});
				}
			});
			
			let setScale;
			OVERRIDE(self.setScale, (origin) => {
				
				setScale = self.setScale = (scale) => {
					//REQUIRED: scale
					
					if (scale < minScale) {
						scale = minScale;
					}
					if (scale > maxScale) {
						scale = maxScale;
					}
					origin(scale);
				};
			});
			
			let setPosition;
			OVERRIDE(self.setPosition, (origin) => {
				
				setPosition = self.setPosition = (params) => {
					//REQUIRED: params
					//REQUIRED: params.x
					//REQUIRED: params.y
					
					origin(params);
					
					loadElements();
				};
			});
			
			let resizeEvent = EVENT('resize', loadElements);
			
			// 마우스 휠 이벤트
			let wheelEvent;
			
			if (isZoomable === true) {
				
				wheelEvent = EVENT('wheel', (e) => {
					
					let originX = self.getX() / self.getScaleX();
					let originY = self.getY() / self.getScaleY();
					
					setScale(self.getScaleX() + e.getWheelDelta() / 1000);
					
					setPosition({
						x : originX * self.getScaleX(),
						y : originY * self.getScaleY()
					});
				});
			}
			
			// 마우스를 이용하여 맵 위치를 이동하는 이벤트
			let mousedownEvent;
			
			if (isMovable === true) {
				
				mousedownEvent = EVENT_LOW('mousedown', (e) => {
					
					let startLeft = e.getLeft();
					let startTop = e.getTop();
					
					let originX = self.getX();
					let originY = self.getY();
					
					let mousemoveEvent = EVENT_LOW('mousemove', (e) => {
						
						setPosition({
							x : originX + e.getLeft() - startLeft,
							y : originY + e.getTop() - startTop
						});
					});
					
					let mouseupEvent = EVENT_LOW('mouseup', () => {
						mousemoveEvent.remove();
						mouseupEvent.remove();
					});
				});
			}
			
			// 이하 터치를 이용해 줌과 위치 이동을 처리하는 이벤트들
			
			let lastZoomScale;
			
			let lastLeft;
			let lastTop;
			
			let touchstartEvent = EVENT_LOW('touchstart', (e) => {
				
				lastZoomScale = undefined;
				
				lastLeft = undefined;
				lastTop = undefined;
			});
			
			let touchmoveEvent = EVENT_LOW('touchmove', (e) => {
				
				if (isZoomable === true && e.getPositions().length >= 2) {
					
					let point1 = e.getPositions()[0];
					let point2 = e.getPositions()[1];
					
					let zoomScale = Math.sqrt(Math.pow(point2.left - point1.left, 2) + Math.pow(point2.top - point1.top, 2));
					
					if (lastZoomScale !== undefined) {
						
						let originX = self.getX() / self.getScaleX();
						let originY = self.getY() / self.getScaleY();
						
						setScale(self.getScaleX() + (zoomScale - lastZoomScale) / 100);
						
						setPosition({
							x : originX * self.getScaleX(),
							y : originY * self.getScaleY()
						});
					}
					
					lastZoomScale = zoomScale;
				}
				
				else if (isMovable === true && lastZoomScale === undefined) {
					
					let left = e.getLeft();
					let top = e.getTop();
					
					if (
					lastLeft !== undefined &&
					lastTop !== undefined &&
					Math.abs(left - lastLeft) < 50 &&
					Math.abs(top - lastTop) < 50) {
						
						setPosition({
							x : self.getX() + left - lastLeft,
							y : self.getY() + top - lastTop
						});
					}
					
					lastLeft = left;
					lastTop = top;
				}
			});
			
			self.on('remove', () => {
				
				resizeEvent.remove();
				
				if (wheelEvent !== undefined) {
					wheelEvent.remove();
				}
				if (mousedownEvent !== undefined) {
					mousedownEvent.remove();
				}
				
				if (touchstartEvent !== undefined) {
					touchstartEvent.remove();
				}
				if (touchmoveEvent !== undefined) {
					touchmoveEvent.remove();
				}
			});
		}
	};
});
BigWorld.Map = CLASS(() => {
	
	const BASE_MIN_SCALE = 0.3;
	const BASE_MAX_SCALE = 9.99;
	
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
			//OPTIONAL: params.changeScale
			//OPTIONAL: params.movePosition
			//OPTIONAL: params.pickPosition
			//OPTIONAL: params.pickSectionPosition
			//OPTIONAL: params.pickTilePosition
			
			let mapData = params.mapData;
			
			let isMovable = params.isMovable;
			let isZoomable = params.isZoomable;
			let minScale = params.minScale;
			let maxScale = params.maxScale;
			
			let isToShowGrid = params.isToShowGrid;
			
			let changeScaleHandler = params.changeScale;
			let movePositionsHandler = params.movePosition;
			
			let pickPositionHandler = params.pickPosition;
			let pickSectionPositionHandler = params.pickSectionPosition;
			let pickTilePositionHandler = params.pickTilePosition;
			
			if (minScale === undefined) {
				minScale = BASE_MIN_SCALE;
			}
			if (maxScale === undefined) {
				maxScale = BASE_MAX_SCALE;
			}
			
			// 타일의 크기
			let tileWidth = CONFIG.BigWorld.sectionWidth * CONFIG.BigWorld.tileSectionLevel;
			let tileHeight = CONFIG.BigWorld.sectionHeight * CONFIG.BigWorld.tileSectionLevel;
			let halfTileWidth = tileWidth / 2;
			let halfTileHeight = tileHeight / 2;
			
			let zoneRooms = {};
			let zoneMapTileIds = {};
			let zoneMapObjectIdMap = {};
			
			let tiles = {};
			let objects = {};
			
			let mapTileDataSet = {};
			let mapTileRooms = {};
			
			let mapObjectDataSet = {};
			let mapObjectRooms = {};
			
			let tileDataSet = {};
			let tileRooms = {};
			let tileCounts = {};
			let tileCallbackMap = {};
			
			let objectDataSet = {};
			let objectRooms = {};
			let objectCounts = {};
			let objectCallbackMap = {};
			
			let itemDataSet = {};
			let itemRooms = {};
			let itemCounts = {};
			let itemCallbackMap = {};
			
			let gridWrapper;
			let drawGridDelay;
			
			if (isToShowGrid === true) {
				gridWrapper = SkyEngine.Node({
					zIndex : -999999
				}).appendTo(self);
			}
			
			// 타일 데이터를 초기화합니다.
			let initTileData = (tileId, callback) => {
				
				if (tileCounts[tileId] === undefined) {
					tileCounts[tileId] = 0;
					
					BigWorld.TileModel.get(tileId, (tileData) => {
						if (tileCounts[tileId] !== undefined) {
							tileDataSet[tileId] = tileData;
							
							// 저장된 콜백 함수를 실행합니다.
							EACH(tileCallbackMap[tileId], (callback) => {
								callback(tileData);
							});
							
							delete tileCallbackMap[tileId];
						}
					});
					
					let tileRoom = BigWorld.ROOM('Tile/' + tileId);
					
					tileRoom.on('update', (tileData) => {
						tileDataSet[tileId] = tileData;
					});
					
					tileRoom.on('remove', () => {
						removeTileData(tileId);
					});
					
					tileRooms[tileId] = tileRoom;
				}
				
				// 이미 데이터가 존재한다면 즉시 콜백 함수를 실행합니다.
				if (tileDataSet[tileId] !== undefined) {
					callback(tileDataSet[tileId]);
				}
				
				// 데이터가 아직 존재하지 않는다면 콜백 함수를 저장합니다.
				else {
					if (tileCallbackMap[tileId] === undefined) {
						tileCallbackMap[tileId] = [];
					}
					tileCallbackMap[tileId].push(callback);
				}
				
				tileCounts[tileId] += 1;
			};
			
			// 타일 데이터를 제거합니다.
			let removeTileData = (tileId) => {
				
				tileCounts[tileId] -= 1;
				
				if (tileCounts[tileId] === 0) {
					
					tileRooms[tileId].exit();
					
					delete tileDataSet[tileId];
					delete tileRooms[tileId];
					delete tileCounts[tileId];
				}
			};
			
			// 오브젝트 데이터를 초기화합니다.
			let initObjectData = (objectId, callback) => {
				
				if (objectCounts[objectId] === undefined) {
					objectCounts[objectId] = 0;
					
					BigWorld.ObjectModel.get(objectId, (objectData) => {
						if (objectCounts[objectId] !== undefined) {
							objectDataSet[objectId] = objectData;
							
							// 저장된 콜백 함수를 실행합니다.
							EACH(objectCallbackMap[objectId], (callback) => {
								callback(objectData);
							});
							
							delete objectCallbackMap[objectId];
						}
					});
					
					let objectRoom = BigWorld.ROOM('Object/' + objectId);
					
					objectRoom.on('update', (objectData) => {
						objectDataSet[objectId] = objectData;
					});
					
					objectRoom.on('remove', () => {
						removeObjectData(objectId);
					});
					
					objectRooms[objectId] = objectRoom;
				}
				
				// 이미 데이터가 존재한다면 즉시 콜백 함수를 실행합니다.
				if (objectDataSet[objectId] !== undefined) {
					callback(objectDataSet[objectId]);
				}
				
				// 데이터가 아직 존재하지 않는다면 콜백 함수를 저장합니다.
				else {
					if (objectCallbackMap[objectId] === undefined) {
						objectCallbackMap[objectId] = [];
					}
					objectCallbackMap[objectId].push(callback);
				}
				
				objectCounts[objectId] += 1;
			};
			
			// 오브젝트 데이터를 제거합니다.
			let removeObjectData = (objectId) => {
				
				objectCounts[objectId] -= 1;
				
				if (objectCounts[objectId] === 0) {
					
					objectRooms[objectId].exit();
					
					delete objectDataSet[objectId];
					delete objectRooms[objectId];
					delete objectCounts[objectId];
				}
			};
			
			// 아이템 데이터를 초기화합니다.
			let initItemData = (itemId, callback) => {
				
				if (itemCounts[itemId] === undefined) {
					itemCounts[itemId] = 0;
					
					BigWorld.ItemModel.get(itemId, (itemData) => {
						if (itemCounts[itemId] !== undefined) {
							itemDataSet[itemId] = itemData;
							
							// 저장된 콜백 함수를 실행합니다.
							EACH(itemCallbackMap[itemId], (callback) => {
								callback(itemData);
							});
							
							delete itemCallbackMap[itemId];
						}
					});
					
					let itemRoom = BigWorld.ROOM('Item/' + itemId);
					
					itemRoom.on('update', (itemData) => {
						itemDataSet[itemId] = itemData;
					});
					
					itemRoom.on('remove', () => {
						removeItemData(itemId);
					});
					
					itemRooms[itemId] = itemRoom;
				}
				
				// 이미 데이터가 존재한다면 즉시 콜백 함수를 실행합니다.
				if (itemDataSet[itemId] !== undefined) {
					callback(itemDataSet[itemId]);
				}
				
				// 데이터가 아직 존재하지 않는다면 콜백 함수를 저장합니다.
				else {
					if (itemCallbackMap[itemId] === undefined) {
						itemCallbackMap[itemId] = [];
					}
					itemCallbackMap[itemId].push(callback);
				}
				
				itemCounts[itemId] += 1;
			};
			
			// 아이템 데이터를 제거합니다.
			let removeItemData = (itemId) => {
				
				itemCounts[itemId] -= 1;
				
				if (itemCounts[itemId] === 0) {
					
					itemRooms[itemId].exit();
					
					delete itemDataSet[itemId];
					delete itemRooms[itemId];
					delete itemCounts[itemId];
				}
			};
			
			// 맵 타일 데이터를 제거합니다.
			let removeMapTileData = (mapTileId) => {
				
				let mapTileData = mapTileDataSet[mapTileId];
				
				let zoneKey = mapTileData.col + ',' + mapTileData.row;
				delete zoneMapTileIds[zoneKey];
				
				removeTileData(mapTileData.tileId);
				
				delete mapTileDataSet[mapTileId];
				
				mapTileRooms[mapTileId].exit();
				delete mapTileRooms[mapTileId];
				
				// 타일 제거
				if (tiles[mapTileId] !== undefined) {
					tiles[mapTileId].remove();
					delete tiles[mapTileId];
				}
			};
			
			// 맵 오브젝트 데이터를 제거합니다.
			let removeMapObjectData = (mapObjectId) => {
				
				let mapObjectData = mapObjectDataSet[mapObjectId];
				
				let zoneKey = Math.round(mapObjectData.x / tileWidth) + ',' + Math.round(mapObjectData.y / tileHeight);
				REMOVE({
					array : zoneMapObjectIdMap[zoneKey],
					value : mapObjectId
				});
				
				removeObjectData(mapObjectData.objectId);
				
				EACH(mapObjectData.items, (itemInfo) => {
					removeItemData(itemInfo.id);
				});
				
				delete mapObjectDataSet[mapObjectId];
				
				mapObjectRooms[mapObjectId].exit();
				delete mapObjectRooms[mapObjectId];
				
				// 오브젝트 제거
				if (objects[mapObjectId] !== undefined) {
					objects[mapObjectId].remove();
					delete objects[mapObjectId];
				}
			};
			
			// 타일을 놓습니다.
			let putTile = (mapTileData) => {
				
				let zoneKey = mapTileData.col + ',' + mapTileData.row;
				if (zoneRooms[zoneKey] !== undefined) {
					zoneMapTileIds[zoneKey] = mapTileData.id;
					
					initTileData(mapTileData.tileId, (tileData) => {
						console.log(tileData);
					});
					
					let mapTileRoom = BigWorld.ROOM('MapTile/' + mapTileData.id);
					
					mapTileRoom.on('update', (newMapTileData) => {
						
						// 다른 타일이 놓이는 경우
						if (newMapTileData.tileId !== mapTileData.tileId) {
							removeTileData(mapTileData.tileId);
							initTileData(newMapTileData.tileId, (tileData) => {
								console.log(tileData);
							});
						}
						
						mapTileDataSet[mapTileData.id] = newMapTileData;
						mapTileData = newMapTileData;
					});
					
					mapTileRoom.on('remove', () => {
						removeMapTileData(mapTileData.id);
					});
					
					mapTileDataSet[mapTileData.id] = mapTileData;
					mapTileRooms[mapTileData.id] = mapTileRoom;
				}
			};
			
			// 오브젝트를 놓습니다.
			let putObject = (mapObjectData) => {
				
				let zoneKey = Math.round(mapObjectData.x / tileWidth) + ',' + Math.round(mapObjectData.y / tileHeight);
				if (zoneRooms[zoneKey] !== undefined) {
					zoneMapObjectIdMap[zoneKey].push(mapObjectData.id);
					
					initObjectData(mapObjectData.objectId, (objectData) => {
						console.log(objectData);
					});
					
					EACH(mapObjectData.items, (itemInfo) => {
						initItemData(itemInfo.id, (itemData) => {
							console.log(itemData);
						});
					});
					
					let mapObjectRoom = BigWorld.ROOM('MapObject/' + mapObjectData.id);
					
					mapObjectRoom.on('update', (newMapObjectData) => {
						
						// 다른 오브젝트가 놓이는 경우
						if (newMapObjectData.objectId !== mapObjectData.objectId) {
							removeObjectData(mapObjectData.objectId);
							initObjectData(newMapObjectData.objectId, (objectData) => {
								console.log(objectData);
							});
						}
						
						// 빠진 아이템 체크
						EACH(mapObjectData.items, (itemInfo) => {
							
							let isRemoved = true;
							
							EACH(newMapObjectData.items, (newItemInfo) => {
								if (itemInfo.id === newItemInfo.id) {
									isRemoved = false;
									return false;
								}
							});
							
							if (isRemoved === true) {
								removeItemData(itemInfo.id);
							}
						});
						
						// 새로 추가된 아이템 체크
						EACH(newMapObjectData.items, (itemInfo) => {
							
							let isNew = true;
							
							EACH(mapObjectData.items, (oldItemInfo) => {
								if (itemInfo.id === oldItemInfo.id) {
									isNew = false;
									return false;
								}
							});
							
							if (isNew === true) {
								initItemData(itemInfo.id, (itemData) => {
									console.log(itemData);
								});
							}
						});
						
						mapObjectDataSet[mapObjectData.id] = newMapObjectData;
						mapObjectData = newMapObjectData;
					});
					
					mapObjectRoom.on('remove', () => {
						removeMapObjectData(mapObjectData.id);
					});
					
					mapObjectDataSet[mapObjectData.id] = mapObjectData;
					mapObjectRooms[mapObjectData.id] = mapObjectRoom;
				}
			};
			
			// 존을 제거합니다.
			let removeZone = (zoneKey) => {
				
				zoneRooms[zoneKey].exit();
				
				// 존에 존재하는 타일을 제거합니다.
				let mapTileId = zoneMapTileIds[zoneKey];
				if (mapTileId !== undefined) {
					removeMapTileData(mapTileId);
				}
				
				// 존에 존재하는 모든 오브젝트를 제거합니다.
				EACH(zoneMapObjectIdMap[zoneKey], removeMapObjectData);
				
				delete zoneRooms[zoneKey];
				delete zoneMapTileIds[zoneKey];
				delete zoneMapObjectIdMap[zoneKey];
			};
			
			// 화면에 표기되는 모든 요소들을 불러옵니다.
			let loadElements = RAR(() => {
				
				let boundaryWidth = WIN_WIDTH() / 2 / self.getScaleX();
				let boundaryHeight = WIN_HEIGHT() / 2 / self.getScaleY();
				
				let startX = -self.getX() / self.getScaleX() - boundaryWidth;
				let startY = -self.getY() / self.getScaleY() - boundaryHeight;
				let startTileCol = BigWorld.Tile.getTileCol(startX, startY) - 1;
				let startTileRow = BigWorld.Tile.getTileRow(startX, startY) - 1;
				
				let endX = -self.getX() / self.getScaleX() + boundaryWidth;
				let endY = -self.getY() / self.getScaleY() + boundaryHeight;
				let endTileCol = BigWorld.Tile.getTileCol(endX, endY) + 1;
				let endTileRow = BigWorld.Tile.getTileRow(endX, endY) + 1;
				
				let tilePositions = {};
				
				// 타일 범위를 파악합니다.
				for (let row = startTileRow; row <= endTileRow; row += 1) {
					for (let col = startTileCol; col <= endTileCol; col += 1) {
						tilePositions[col + ',' + row] = {
							col : col,
							row : row
						};
					}
				}
				
				EACH(zoneRooms, (zoneRoom, zoneKey) => {
					
					// 이미 존재하는 타일 영역인 경우 범위에서 제거합니다.
					if (tilePositions[zoneKey] !== undefined) {
						delete tilePositions[zoneKey];
					}
					
					// 범위를 벗어난 타일 영역은 제거합니다.
					else {
						removeZone(zoneKey);
					}
				});
				
				let toLoadTileFilters = [];
				let toLoadObjectFilters = [];
				
				// 부족한 존을 채웁니다.
				EACH(tilePositions, (range, zoneKey) => {
					
					let zoneRoom = BigWorld.ROOM('Zone/' + zoneKey);
					
					// 타일이 놓아지면
					zoneRoom.on('putTile', putTile);
					
					// 오브젝트가 놓아지면
					zoneRoom.on('putObject', putObject);
					
					zoneRooms[zoneKey] = zoneRoom;
					zoneMapObjectIdMap[zoneKey] = [];
					
					let col = range.col;
					let row = range.row;
					
					toLoadTileFilters.push({
						mapId : mapData.id,
						col : col,
						row : row
					});
					
					let tileX = BigWorld.Tile.getTileX(col, row);
					let tileY = BigWorld.Tile.getTileY(col, row);
					
					toLoadObjectFilters.push({
						mapId : mapData.id,
						x : {
							$gt : tileX - halfTileWidth,
							$lte : tileX + halfTileWidth
						},
						y : {
							$gt : tileY - halfTileHeight,
							$lte : tileY + halfTileHeight
						}
					});
				});
				
				// 맵 타일을 불러옵니다.
				if (toLoadTileFilters.length > 0) {
					
					BigWorld.MapTileModel.find({
						filter : {
							$or : toLoadTileFilters
						}
					}, EACH(putTile));
				}
				
				// 맵 오브젝트를 불러옵니다.
				if (toLoadObjectFilters.length > 0) {
					
					BigWorld.MapObjectModel.find({
						filter : {
							$or : toLoadObjectFilters
						}
					}, EACH(putObject));
				}
				
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
					
					if (changeScaleHandler !== undefined) {
						changeScaleHandler(scale);
					}
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
					
					if (movePositionsHandler !== undefined) {
						movePositionsHandler(self.getX(), self.getY());
					}
				};
			});
			
			let cursorNode;
			let cursorNodeMoveType;
			
			let setCursorNode = self.setCursorNode = (params) => {
				//REQUIRED: params
				//REQUIRED: params.node
				//REQUIRED: params.moveType
				
				let node = params.node;
				let moveType = params.moveType;
				
				if (cursorNode !== undefined) {
					cursorNode.remove();
				}
				
				cursorNode = node;
				cursorNodeMoveType = moveType;
				
				node.appendTo(self);
			};
			
			let setCursorNodeMoveType = self.setCursorNodeMoveType = (moveType) => {
				//REQUIRED: moveType
				
				cursorNodeMoveType = moveType;
			};
			
			let removeCursorNode = self.removeCursorNode = () => {
				if (cursorNode !== undefined) {
					cursorNode.remove();
					cursorNode = undefined;
				}
			};
			
			let resizeEvent = EVENT('resize', loadElements);
			
			let controller = DIV({
				style : {
					position : 'fixed',
					left : 0,
					top : 0,
					width : '100%',
					height: '100%',
					zIndex : -1
				},
				on : {
					
					touchmove : (e) => {
						
						if (cursorNode !== undefined) {
							
							let x = (e.getLeft() - WIN_WIDTH() / 2 - self.getX()) / self.getScaleX();
							let y = (e.getTop() - WIN_HEIGHT() / 2 - self.getY()) / self.getScaleY();
							
							if (cursorNodeMoveType === 'tile') {
								x = Math.round(x / BigWorld.Tile.getTileWidth()) * BigWorld.Tile.getTileWidth();
								y = Math.round(y / BigWorld.Tile.getTileHeight()) * BigWorld.Tile.getTileHeight();
							} else if (cursorNodeMoveType === 'section') {
								x = Math.round(x / CONFIG.BigWorld.sectionWidth) * CONFIG.BigWorld.sectionWidth;
								y = Math.round(y / CONFIG.BigWorld.sectionHeight) * CONFIG.BigWorld.sectionHeight;
							}
							
							cursorNode.setPosition({
								x : x,
								y : y
							});
						}
					},
					
					touchstart : (e) => {
						
						let startLeft = e.getLeft();
						let startTop = e.getTop();
						
						let touchendEvent = EVENT_ONCE('touchend', (e) => {
							if (Math.sqrt(Math.pow(e.getLeft() - startLeft, 2) + Math.pow(e.getTop() - startTop, 2)) < 5) {
								
								let x = (e.getLeft() - WIN_WIDTH() / 2 - self.getX()) / self.getScaleX();
								let y = (e.getTop() - WIN_HEIGHT() / 2 - self.getY()) / self.getScaleY();
								
								let sectionCol = Math.round(x / CONFIG.BigWorld.sectionWidth);
								let sectionRow = Math.round(y / CONFIG.BigWorld.sectionHeight);
								
								let tileCol = Math.round(x / BigWorld.Tile.getTileWidth());
								let tileRow = Math.round(y / BigWorld.Tile.getTileHeight());
								
								if (pickPositionHandler !== undefined) {
									pickPositionHandler(x, y);
								}
								
								if (pickSectionPositionHandler !== undefined) {
									pickSectionPositionHandler(sectionCol, sectionRow);
								}
								
								if (pickTilePositionHandler !== undefined) {
									pickTilePositionHandler(tileCol, tileRow);
								}
							}
						});
					}
				}
			}).appendTo(BODY);
			
			let getController = self.getController = () => {
				return controller;
			};
			
			// 마우스 휠 이벤트
			let wheelEvent;
			
			if (isZoomable === true) {
				
				controller.on('wheel', (e) => {
					
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
			let mousedownEventLow;
			
			if (isMovable === true) {
				
				EVENT_LOW({
					name : 'mousedown',
					node : controller
				}, (e) => {
					
					let startLeft = e.getLeft();
					let startTop = e.getTop();
					
					let originX = self.getX();
					let originY = self.getY();
					
					let mousemoveEventLow = EVENT_LOW('mousemove', (e) => {
						
						setPosition({
							x : originX + e.getLeft() - startLeft,
							y : originY + e.getTop() - startTop
						});
					});
					
					let mouseupEventLow = EVENT_LOW('mouseup', () => {
						mousemoveEventLow.remove();
						mouseupEventLow.remove();
					});
				});
			}
			
			// 이하 터치를 이용해 줌과 위치 이동을 처리하는 이벤트들
			
			let lastZoomScale;
			
			let lastLeft;
			let lastTop;
			
			EVENT_LOW({
				name : 'touchstart',
				node : controller
			}, (e) => {
				
				lastZoomScale = undefined;
				
				lastLeft = undefined;
				lastTop = undefined;
			});
			
			EVENT_LOW({
				name : 'touchmove',
				node : controller
			}, (e) => {
				
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
				
				controller.remove();
				
				resizeEvent.remove();
			});
		}
	};
});
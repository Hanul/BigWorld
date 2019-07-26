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
			//OPTIONAL: params.contextmenu
			
			let mapData = params.mapData;
			
			let isMovable = params.isMovable;
			let isZoomable = params.isZoomable;
			let minScale = params.minScale;
			let maxScale = params.maxScale;
			
			let isToShowGrid = params.isToShowGrid;
			
			let changeScaleHandler = params.changeScale;
			let movePositionsHandler = params.movePosition;
			
			let pickPositionHandler = params.pickPosition;
			let contextmenuHandler = params.contextmenu;
			
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
			let toLoadTileIds = [];
			
			let objectDataSet = {};
			let objectRooms = {};
			let objectCounts = {};
			let objectCallbackMap = {};
			let toLoadObjectIds = [];
			
			let itemDataSet = {};
			let itemRooms = {};
			let itemCounts = {};
			let itemCallbackMap = {};
			let toLoadItemIds = [];
			
			let gridWrapper;
			let drawGridDelay;
			
			if (isToShowGrid === true) {
				gridWrapper = SkyEngine.Node({
					zIndex : -999999
				}).appendTo(self);
			}
			
			let tileWrapper = SkyEngine.Node({
				zIndex : -999998
			}).appendTo(self);
			
			let getTileId = (col, row) => {
				let mapTileId = zoneMapTileIds[col + ',' + row];
				if (mapTileId !== undefined) {
					return mapTileDataSet[mapTileId].tileId;
				}
			};
			
			let getTile = (col, row) => {
				let mapTileId = zoneMapTileIds[col + ',' + row];
				if (mapTileId !== undefined) {
					return tiles[mapTileId];
				}
			};
			
			let setTileIdToAround = (tileId, col, row) => {
				
				let aroundTile;
				
				// 주변 타일들에 정보 주입
				aroundTile = getTile(col - 1, row);
				if (aroundTile !== undefined) {
					aroundTile.setRightTileId(tileId);
				}
				
				aroundTile = getTile(col - 1, row - 1);
				if (aroundTile !== undefined) {
					aroundTile.setRightBottomTileId(tileId);
				}
				
				aroundTile = getTile(col, row - 1);
				if (aroundTile !== undefined) {
					aroundTile.setBottomTileId(tileId);
				}
				
				aroundTile = getTile(col + 1, row - 1);
				if (aroundTile !== undefined) {
					aroundTile.setLeftBottomTileId(tileId);
				}
				
				aroundTile = getTile(col + 1, row);
				if (aroundTile !== undefined) {
					aroundTile.setLeftTileId(tileId);
				}
				
				aroundTile = getTile(col + 1, row + 1);
				if (aroundTile !== undefined) {
					aroundTile.setLeftTopTileId(tileId);
				}
				
				aroundTile = getTile(col, row + 1);
				if (aroundTile !== undefined) {
					aroundTile.setTopTileId(tileId);
				}
				
				aroundTile = getTile(col - 1, row + 1);
				if (aroundTile !== undefined) {
					aroundTile.setRightTopTileId(tileId);
				}
			};
			
			// 타일을 생성합니다.
			let createTile = (mapTileData, tileData) => {
				
				let col = mapTileData.col;
				let row = mapTileData.row;
				
				let tile = BigWorld.Tile({
					
					col : col,
					row : row,
					tileData : tileData,
					kindMap : mapTileData.kindMap,
					
					leftTileId : getTileId(col - 1, row),
					leftTopTileId : getTileId(col - 1, row - 1),
					topTileId : getTileId(col, row - 1),
					rightTopTileId : getTileId(col + 1, row - 1),
					rightTileId : getTileId(col + 1, row),
					rightBottomTileId : getTileId(col + 1, row + 1),
					bottomTileId : getTileId(col, row + 1),
					leftBottomTileId : getTileId(col - 1, row + 1)
					
				}).appendTo(tileWrapper);
				
				tile.draw();
				
				tiles[mapTileData.id] = tile;
				
				setTileIdToAround(tileData.id, col, row);
			};
			
			// 타일을 제거합니다.
			let removeTile = (mapTileId, col, row) => {
				
				if (tiles[mapTileId] !== undefined) {
					tiles[mapTileId].remove();
					delete tiles[mapTileId];
				}
				
				setTileIdToAround(undefined, col, row);
			};
			
			// 오브젝트를 생성합니다.
			let createObject = (mapObjectData, objectData) => {
				
				let object = BigWorld.Object({
					objectData : objectData,
					kind : mapObjectData.kind,
					state : mapObjectData.state,
					direction : mapObjectData.direction,
					x : mapObjectData.x,
					y : mapObjectData.y,
					isReverse : mapObjectData.isReverse
				}).appendTo(self);
				
				objects[mapObjectData.id] = object;
			};
			
			// 오브젝트를 제거합니다.
			let removeObject = (mapObjectId) => {
				if (objects[mapObjectId] !== undefined) {
					objects[mapObjectId].remove();
					delete objects[mapObjectId];
				}
			};
			
			// 아이템을 생성합니다.
			let createItem = (mapObjectId, itemData, kind) => {
				
				// 오브젝트를 찾습니다.
				let object = objects[mapObjectId];
				if (object !== undefined) {
					
					// 아이템을 부착합니다.
					object.attachItem({
						id : itemData.id,
						item : BigWorld.Item({
							itemData : itemData,
							kind : kind
						})
					});
				}
			};
			
			// 아이템을 제거합니다.
			let removeItem = (mapObjectId, itemId) => {
				
				// 오브젝트를 찾습니다.
				let object = objects[mapObjectId];
				if (object !== undefined) {
					
					// 아이템을 제거합니다.
					object.removeItem(itemData.id);
				}
			};
			
			// 타일 데이터를 불러옵니다..
			let loadTileData = (tileId, callback, isToNotLoad) => {
				
				if (tileCounts[tileId] === undefined) {
					tileCounts[tileId] = 0;
					
					// 나중에 로드함
					if (isToNotLoad === true) {
						toLoadTileIds.push(tileId);
					}
					
					else {
						
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
					}
					
					let tileRoom = BigWorld.ROOM('Tile/' + tileId);
					
					tileRoom.on('update', (tileData) => {
						tileDataSet[tileId] = tileData;
						
						// 모든 타일을 변경합니다.
						EACH(tiles, (tile) => {
							if (tile.getId() === tileId) {
								tile.setData(tileData);
							}
						});
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
			
			// 오브젝트 데이터를 불러옵니다..
			let loadObjectData = (objectId, callback, isToNotLoad) => {
				
				if (objectCounts[objectId] === undefined) {
					objectCounts[objectId] = 0;
					
					// 나중에 로드함
					if (isToNotLoad === true) {
						toLoadObjectIds.push(objectId);
					}
					
					else {
						
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
					}
					
					let objectRoom = BigWorld.ROOM('Object/' + objectId);
					
					objectRoom.on('update', (objectData) => {
						objectDataSet[objectId] = objectData;
						
						// 모든 오브젝트를 변경합니다.
						EACH(objects, (object) => {
							if (object.getId() === objectId) {
								object.setData(objectData);
							}
						});
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
			
			// 아이템 데이터를 불러옵니다..
			let loadItemData = (itemId, callback, isToNotLoad) => {
				
				if (itemCounts[itemId] === undefined) {
					itemCounts[itemId] = 0;
					
					// 나중에 로드함
					if (isToNotLoad === true) {
						toLoadItemIds.push(itemId);
					}
					
					else {
						
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
					}
					
					let itemRoom = BigWorld.ROOM('Item/' + itemId);
					
					itemRoom.on('update', (itemData) => {
						itemDataSet[itemId] = itemData;
						
						// 모든 부착된 아이템을 변경합니다.
						EACH(objects, (object) => {
							if (object.getId() === itemData.objectId) {
								
								let item = object.getItem(itemData.id);
								if (item !== undefined) {
									
									item.setData(itemData);
									
									object.refresh();
								}
							}
						});
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
				removeTile(mapTileId, mapTileData.col, mapTileData.row);
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
				
				mapObjectData.items.forEach((itemInfo) => {
					removeItemData(itemInfo.id);
				});
				
				delete mapObjectDataSet[mapObjectId];
				
				mapObjectRooms[mapObjectId].exit();
				delete mapObjectRooms[mapObjectId];
				
				// 오브젝트 제거
				removeObject(mapObjectId);
			};
			
			// 타일을 놓습니다.
			let putTile = (mapTileData) => {
				
				let zoneKey = mapTileData.col + ',' + mapTileData.row;
				if (zoneRooms[zoneKey] !== undefined) {
					zoneMapTileIds[zoneKey] = mapTileData.id;
					
					// 타일 데이터를 불러옵니다.
					loadTileData(mapTileData.tileId, (tileData) => {
						
						// 타일을 생성합니다.
						createTile(mapTileData, tileData);
						
					}, true);
					
					// 타일 정보를 한번에 불러옵니다.
					if (toLoadTileIds.length > 0) {
						
						BigWorld.TileModel.find({
							filter : {
								id : {
									$in : toLoadTileIds
								}
							}
						}, EACH((tileData) => {
							if (tileCounts[tileData.id] !== undefined) {
								tileDataSet[tileData.id] = tileData;
								
								// 저장된 콜백 함수를 실행합니다.
								EACH(tileCallbackMap[tileData.id], (callback) => {
									callback(tileData);
								});
								
								delete tileCallbackMap[tileData.id];
							}
						}));
					}
					toLoadTileIds = [];
					
					let mapTileRoom = BigWorld.ROOM('MapTile/' + mapTileData.id);
					
					mapTileRoom.on('update', (newMapTileData) => {
						
						// 다른 타일이 놓이는 경우
						if (newMapTileData.tileId !== mapTileData.tileId) {
							
							// 기존 타일 데이터를 제거합니다.
							removeTileData(mapTileData.tileId);
							
							// 새 타일 데이터를 불러옵니다.
							loadTileData(newMapTileData.tileId, (tileData) => {
								
								// 기존 타일을 제거합니다.
								removeTile(mapTileData.id, mapTileData.col, mapTileData.row);
								
								// 새 타일을 생성합니다.
								createTile(newMapTileData, tileData);
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
					
					// 오브젝트 데이터를 불러옵니다.
					loadObjectData(mapObjectData.objectId, (objectData) => {
						
						// 오브젝트를 생성합니다.
						createObject(mapObjectData, objectData);
						
					}, true);
					
					// 오브젝트 정보를 한번에 불러옵니다.
					if (toLoadObjectIds.length > 0) {
						
						BigWorld.ObjectModel.find({
							filter : {
								id : {
									$in : toLoadObjectIds
								}
							}
						}, EACH((objectData) => {
							if (objectCounts[objectData.id] !== undefined) {
								objectDataSet[objectData.id] = objectData;
								
								// 저장된 콜백 함수를 실행합니다.
								EACH(objectCallbackMap[objectData.id], (callback) => {
									callback(objectData);
								});
								
								delete objectCallbackMap[objectData.id];
							}
						}));
					}
					toLoadObjectIds = [];
					
					mapObjectData.items.forEach((itemInfo) => {
						
						// 아이템 데이터를 불러옵니다.
						loadItemData(itemInfo.id, (itemData) => {
							
							// 아이템을 생성합니다.
							createItem(mapObjectData.id, itemData, itemInfo.kind);
							
						}, true);
					});
					
					// 아이템 정보를 한번에 불러옵니다.
					if (toLoadItemIds.length > 0) {
						
						BigWorld.ItemModel.find({
							filter : {
								id : {
									$in : toLoadItemIds
								}
							}
						}, EACH((itemData) => {
							if (itemCounts[itemData.id] !== undefined) {
								itemDataSet[itemData.id] = itemData;
								
								// 저장된 콜백 함수를 실행합니다.
								EACH(itemCallbackMap[itemData.id], (callback) => {
									callback(itemData);
								});
								
								delete itemCallbackMap[itemData.id];
							}
						}));
					}
					toLoadItemIds = [];
					
					let mapObjectRoom = BigWorld.ROOM('MapObject/' + mapObjectData.id);
					
					mapObjectRoom.on('update', (newMapObjectData) => {
						
						// 다른 오브젝트가 놓이는 경우
						if (newMapObjectData.objectId !== mapObjectData.objectId) {
							
							// 기존 오브젝트 데이터를 제거합니다.
							removeObjectData(mapObjectData.objectId);
							
							// 새 오브젝트 데이터를 불러옵니다.
							loadObjectData(newMapObjectData.objectId, (objectData) => {
								
								// 기존 오브젝트를 제거합니다.
								removeObject(mapObjectData.id);
								
								// 새 오브젝트를 생성합니다.
								createObject(newMapObjectData, objectData);
							});
						}
						
						// 빠진 아이템 체크
						mapObjectData.items.forEach((itemInfo) => {
							
							let isRemoved = true;
							
							newMapObjectData.items.forEach((newItemInfo) => {
								if (itemInfo.id === newItemInfo.id) {
									isRemoved = false;
									return false;
								}
							});
							
							if (isRemoved === true) {
								
								// 기존 아이템 데이터를 제거합니다.
								removeItemData(itemInfo.id);
								
								// 기존 아이템을 제거합니다.
								removeItem(mapObjectData.id, itemInfo.id);
							}
						});
						
						// 새로 추가된 아이템 체크
						newMapObjectData.items.forEach((itemInfo) => {
							
							let isNew = true;
							
							mapObjectData.items.forEach((oldItemInfo) => {
								if (itemInfo.id === oldItemInfo.id) {
									isNew = false;
									return false;
								}
							});
							
							if (isNew === true) {
								
								// 새 아이템 데이터를 불러옵니다.
								loadItemData(itemInfo.id, (itemData) => {
									
									// 새 아이템을 생성합니다.
									createItem(newMapObjectData.id, itemData, itemInfo.kind);
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
				zoneMapObjectIdMap[zoneKey].forEach(removeMapObjectData);
				
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
				for (let col = startTileCol; col <= endTileCol; col += 1) {
					for (let row = startTileRow; row <= endTileRow; row += 1) {
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
						for (let col = startTileCol; col <= endTileCol; col += 1) {
							for (let row = startTileRow; row <= endTileRow; row += 1) {
								
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
						[SkyEngine.Rect({
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
						})].forEach(gridWrapper.append);
					});
				}
			});
			
			// 맵 타일 ID를 찾습니다.
			let findMapTileId = self.findMapTileId = (params) => {
				//REQUIRED: params
				//REQUIRED: params.col
				//REQUIRED: params.row
				
				let col = params.col;
				let row = params.row;
				
				return zoneMapTileIds[col + ',' + row];
			};
			
			// 맵 오브젝트 ID를 찾습니다.
			let findMapObjectId = self.findMapObjectId = (params) => {
				//REQUIRED: params
				//REQUIRED: params.x
				//REQUIRED: params.y
				
				let x = params.x;
				let y = params.y;
				
				let tileCol = Math.round(x / BigWorld.Tile.getTileWidth());
				let tileRow = Math.round(y / BigWorld.Tile.getTileHeight());
				
				let maxZIndex = -999999;
				let resultMapObjectId;
				
				// 위 아래 2타일을 검사합니다.
				for (let col = tileCol - 2; col <= tileCol + 2; col += 1) {
					for (let row = tileRow - 2; row <= tileRow + 2; row += 1) {
						
						let mapObjectIds = zoneMapObjectIdMap[col + ',' + row];
						if (mapObjectIds !== undefined) {
							
							mapObjectIds.forEach((mapObjectId) => {
								
								let object = objects[mapObjectId];
								let touchArea = objectDataSet[mapObjectDataSet[mapObjectId].objectId].touchArea;
								
								if (
									x >= object.getX() + touchArea.x - touchArea.width / 2 &&
									x <= object.getX() + touchArea.x + touchArea.width / 2 &&
									y >= object.getY() + touchArea.y - touchArea.height / 2 &&
									y <= object.getY() + touchArea.y + touchArea.height / 2
								) {
									
									if (maxZIndex < object.getZIndex()) {
										maxZIndex = object.getZIndex();
										resultMapObjectId = mapObjectId;
									}
								}
							});
						}
					}
				}
				
				return resultMapObjectId;
			};
			
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
						
						if (e.getButtonIndex() === 0 && pickPositionHandler !== undefined) {
							
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
									
									pickPositionHandler(x, y, sectionCol, sectionRow, tileCol, tileRow);
								}
							});
						}
					},
					
					contextmenu : (e) => {
						
						if (contextmenuHandler !== undefined) {
							
							let x = (e.getLeft() - WIN_WIDTH() / 2 - self.getX()) / self.getScaleX();
							let y = (e.getTop() - WIN_HEIGHT() / 2 - self.getY()) / self.getScaleY();
							
							let sectionCol = Math.round(x / CONFIG.BigWorld.sectionWidth);
							let sectionRow = Math.round(y / CONFIG.BigWorld.sectionHeight);
							
							let tileCol = Math.round(x / BigWorld.Tile.getTileWidth());
							let tileRow = Math.round(y / BigWorld.Tile.getTileHeight());
							
							contextmenuHandler(e, x, y, sectionCol, sectionRow, tileCol, tileRow);
						}
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
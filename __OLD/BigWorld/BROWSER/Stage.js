BigWorld.Stage = CLASS({
	
	preset : () => {
		return SkyEngine.Node;
	},
	
	init : (inner, self, params, touchObjectHandler) => {
		//REQUIRED: params
		//REQUIRED: params.stageData
		//REQUIRED: params.isToShowGrid
		//OPTIONAL: touchObjectHandler
		
		let stageData = params.stageData;
		let isToShowGrid = params.isToShowGrid;
		
		let stateObjects = {};
		
		// 타일의 크기
		let tileWidth = CONFIG.BigWorld.sectionWidth * CONFIG.BigWorld.tileSectionLevel;
		let tileHeight = CONFIG.BigWorld.sectionHeight * CONFIG.BigWorld.tileSectionLevel;
		
		let boundaryWidth;
		let boundaryHeight;
		
		let resizeEvent = EVENT('resize', RAR(() => {
			boundaryWidth = WIN_WIDTH() / 2 / self.getScaleX();
			boundaryHeight = WIN_HEIGHT() / 2 / self.getScaleY();
		}));
		
		self.on('remove', () => {
			resizeEvent.remove();
		});
		
		// 중점 표시
		if (isToShowGrid === true) {
			
			self.append(SkyEngine.Line({
				zIndex : -999999,
				startX : -CONFIG.BigWorld.sectionWidth,
				startY : 0,
				endX : CONFIG.BigWorld.sectionWidth,
				endY : 0,
				border : '1px solid #fff'
			}));
			
			self.append(SkyEngine.Line({
				zIndex : -999999,
				startX : 0,
				startY : -CONFIG.BigWorld.sectionHeight,
				endX : 0,
				endY : CONFIG.BigWorld.sectionHeight,
				border : '1px solid #fff'
			}));
		}
		
		let tileMap = {};
		
		let loadObjects = RAR(() => {

			let startTileRow = INTEGER((-self.getY() / self.getScaleY() - boundaryHeight) / tileHeight) - 1;
			let endTileRow = INTEGER((-self.getY() / self.getScaleY() + boundaryHeight) / tileHeight) + 1;
			
			let startTileCol = INTEGER((-self.getX() / self.getScaleX() - boundaryWidth) / tileWidth) - 1;
			let endTileCol = INTEGER((-self.getX() / self.getScaleX() + boundaryWidth) / tileWidth) + 1;
			
			let tileRangeMap = {};
			
			// 타일의 범위를 파악합니다.
			for (let i = startTileRow; i <= endTileRow; i += 1) {
				for (let j = startTileCol; j <= endTileCol; j += 1) {
					tileRangeMap[i + ',' + j] = {
						row : i,
						col : j
					};
				}
			}
			
			EACH(tileMap, (tile, key) => {
				
				// 이미 존재하는 타일인 경우 범위에서 제거합니다.
				if (tileRangeMap[key] !== undefined) {
					delete tileRangeMap[key];
				}
				
				// 범위를 벗어난 타일은 제거합니다.
				else {
					tile.remove();
					delete tileMap[key];
				}
			});
			
			// 부족한 타일을 채웁니다.
			EACH(tileRangeMap, (range, key) => {
				
				let tile = tileMap[key] = SkyEngine.Node({
					zIndex : -999999,
					x : range.col * tileWidth,
					y : range.row * tileHeight
				}).appendTo(self);
				
				// 격자 표시
				if (isToShowGrid === true) {
					
					tile.append(SkyEngine.Rect({
						width : tileWidth,
						height : tileHeight,
						border : '1px solid #666'
					}));
				}
			});
		});
		
		let setPosition = self.setPosition = (params) => {
			//REQUIRED: params
			//REQUIRED: params.x
			//REQUIRED: params.y
			
			self.setX(params.x);
			self.setY(params.y);
			
			loadObjects();
		};
		
		let removeObject = (stageObjectId) => {
			if (stateObjects[stageObjectId] !== undefined) {
				stateObjects[stageObjectId].remove();
				delete stateObjects[stageObjectId];
			}
		}
		
		let createObject = (stageObjectData) => {
			
			BigWorld.ObjectModel.get(stageObjectData.objectId, (objectData) => {
				
				let itemDataSet = [];
				let itemKinds = [];
				
				PARALLEL(stageObjectData.itemInfos, [
				(itemInfo, done) => {
					
					itemKinds.push(itemInfo.kind);
					
					BigWorld.ItemModel.get(itemInfo.id, (itemData) => {
						itemDataSet.push(itemData);
						done();
					});
				},
				
				() => {
					
					let object = BigWorld.Object({
						id : stageObjectData.id,
						x : stageObjectData.tileCol * tileWidth + stageObjectData.sectionCol * CONFIG.BigWorld.sectionWidth,
						y : stageObjectData.tileRow * tileHeight + stageObjectData.sectionRow * CONFIG.BigWorld.sectionHeight,
						objectData : objectData,
						kind : stageObjectData.kind,
						state : stageObjectData.state,
						direction : stageObjectData.direction,
						itemDataSet : itemDataSet,
						itemKinds : itemKinds,
						isReverse : stageObjectData.isReverse,
						on : {
							tap : () => {
								if (touchObjectHandler !== undefined) {
									touchObjectHandler(object);
								}
							}
						}
					}).appendTo(self);
					
					removeObject(stageObjectData.id);
					stateObjects[stageObjectData.id] = object;
				}]);
			});
		};
		
		BigWorld.StageObjectModel.onNewAndFindWatching({
			properties : {
				stageId : stageData.id
			}
		}, (stageObjectData, addUpdateHandler, addRemoveHandler) => {
			createObject(stageObjectData);
			
			addUpdateHandler((newStageObjectData) => {
				createObject(newStageObjectData);
			});
			
			addRemoveHandler(() => {
				removeObject(stageObjectData.id);
			});
		});
	}
});

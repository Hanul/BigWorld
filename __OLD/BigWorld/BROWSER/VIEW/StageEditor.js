
		let resizeEvent = EVENT('resize', () => {
			background.setWidth(WIN_WIDTH());
			background.setHeight(WIN_HEIGHT());
		});
		
		let stage;
		let objectMenu;
		let selectedObject;
		let selectedTile;
		
		let wrapper;
		let touchstartEvent;
		let touchmoveEvent;
		let tapEvent;
		let keydownEvent;
		inner.on('paramsChange', (params) => {
			
			BigWorld.StageModel.get(params.stageId, (stageData) => {
				
				stage = BigWorld.Stage({
					stageData : stageData,
					isToShowGrid : true
				},
				// 오브젝트를 터치한 경우
				(object) => {
					
					if (objectMenu !== undefined) {
						objectMenu.remove();
					}
					
					objectMenu = SkyEngine.Node({
						x : object.getX(),
						y : object.getY(),
						dom : DIV({
							style : {
								backgroundColor : '#fff',
								color : '#000',
								borderRadius : 5
							},
							on : {
								touchstart : (e) => {
									e.stop();
								}
							},
							c : [UUI.BUTTON_H({
								style : {
									padding : 5
								},
								icon : IMG({
									src : BigWorld.R('stageeditor/delete.png')
								}),
								spacing : 10,
								title : '삭제하기',
								on : {
									tap : (e) => {
										
										BigWorld.StageObjectModel.remove(object.getId());
										
										objectMenu.remove();
										objectMenu = undefined;
										
										e.stop();
									}
								}
							})]
						})
					}).appendTo(stage);
					
				}).appendTo(SkyEngine.Screen);
				
				let deselect = () => {
					
					if (touchmoveEvent !== undefined) {
						touchmoveEvent.remove();
						touchmoveEvent = undefined;
					}
					
					if (tapEvent !== undefined) {
						tapEvent.remove();
						tapEvent = undefined;
					}
					
					if (selectedObject !== undefined) {
						selectedObject.remove();
						selectedObject = undefined;
					}
					
					if (selectedTile !== undefined) {
						selectedTile.remove();
						selectedTile = undefined;
					}
					
					kindList.empty();
					stateList.empty();
					itemList.empty();
				};
				
				let kindList;
				let stateList;
				let itemList;
				wrapper = DIV({
					style : {
						position : 'fixed',
						left : 0,
						top : 0,
						padding : 10
					},
					c : [DIV({
						c : '맵 이름: ' + MSG(stageData.name)
					}), DIV({
						c : ['확대:', A({
							style : {
								marginLeft : 5
							},
							c : 'x1',
							on : {
								tap : () => {
									stage.setScale(1);
								}
							}
						}), A({
							style : {
								marginLeft : 5
							},
							c : 'x2',
							on : {
								tap : () => {
									stage.setScale(2);
								}
							}
						}), A({
							style : {
								marginLeft : 5
							},
							c : 'x4',
							on : {
								tap : () => {
									stage.setScale(4);
								}
							}
						}), A({
							style : {
								marginLeft : 5
							},
							c : 'x8',
							on : {
								tap : () => {
									stage.setScale(8);
								}
							}
						})]
					}), UUI.BUTTON_H({
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
								
								deselect();
								
								BigWorld.CreateSelectObjectPopup((objectData, left, top) => {
									
									let state;
									EACH(objectData.states, (stateData, _state) => {
										state = _state;
									});
									
									selectedObject = BigWorld.Object({
										x : (left - WIN_WIDTH() / 2) / SkyEngine.Screen.getRatio() - stage.getX(),
										y : (top - WIN_HEIGHT() / 2) / SkyEngine.Screen.getRatio() - stage.getY(),
										objectData : objectData,
										kind : 0,
										state : state,
										direction : 'down'
									}).appendTo(stage);
									
									touchmoveEvent = EVENT('touchmove', (e) => {
										selectedObject.setX((e.getLeft() - WIN_WIDTH() / 2) / SkyEngine.Screen.getRatio() - stage.getX());
										selectedObject.setY((e.getTop() - WIN_HEIGHT() / 2) / SkyEngine.Screen.getRatio() - stage.getY());
									});
									
									tapEvent = EVENT('tap', (e) => {
										
										let tileRow = INTEGER(selectedObject.getY() < 0 ? selectedObject.getY() / tileHeight - 0.5 : selectedObject.getY() / tileHeight + 0.5);
										let tileCol = INTEGER(selectedObject.getX() < 0 ? selectedObject.getX() / tileWidth - 0.5 : selectedObject.getX() / tileWidth + 0.5);
										
										let sectionRow = INTEGER(selectedObject.getY() < 0 ? selectedObject.getY() / CONFIG.BigWorld.sectionHeight - 0.5 : selectedObject.getY() / CONFIG.BigWorld.sectionHeight + 0.5);
										let sectionCol = INTEGER(selectedObject.getX() < 0 ? selectedObject.getX() / CONFIG.BigWorld.sectionWidth - 0.5 : selectedObject.getX() / CONFIG.BigWorld.sectionWidth + 0.5);
										
										sectionRow -= tileRow * CONFIG.BigWorld.tileSectionLevel;
										sectionCol -= tileCol * CONFIG.BigWorld.tileSectionLevel;
										
										BigWorld.StageObjectModel.create({
											stageId : stageData.id,
											objectId : objectData.id,
											kind : selectedObject.getKind(),
											state : selectedObject.getState(),
											itemInfos : selectedObject.getItemInfos(),
											direction : selectedObject.getDirection(),
											tileRow : tileRow,
											tileCol : tileCol,
											sectionRow : sectionRow,
											sectionCol : sectionCol,
											isReverse : selectedObject.checkIsReverse() === true ? true : undefined
										});
									});
									
									kindList.empty();
									stateList.empty();
									itemList.empty();
									
									// 좌우 반전 버튼
									EACH(objectData.kinds, (kindData, kind) => {
										
										itemList.append(UUI.BUTTON_H({
											style : {
												marginTop : 10
											},
											icon : IMG({
												src : BigWorld.R('stageeditor/reverse.png')
											}),
											spacing : 10,
											title : '좌우 반전',
											on : {
												tap : (e) => {
													selectedObject.reverse();
													e.stop();
												}
											}
										}));
									});
									
									// 종류들을 불러옵니다.
									EACH(objectData.kinds, (kindData, kind) => {
										
										itemList.append(UUI.BUTTON_H({
											style : {
												marginTop : 10
											},
											icon : IMG({
												src : BigWorld.R('stageeditor/kind.png')
											}),
											spacing : 10,
											title : MSG(kindData.name),
											on : {
												tap : (e) => {
													selectedObject.changeKind(kind);
													e.stop();
												}
											}
										}));
									});
									
									// 상태들을 불러옵니다.
									EACH(objectData.states, (stateData, state) => {
										
										itemList.append(UUI.BUTTON_H({
											style : {
												marginTop : 10
											},
											icon : IMG({
												src : BigWorld.R('stageeditor/state.png')
											}),
											spacing : 10,
											title : MSG(stateData.name),
											on : {
												tap : (e) => {
													selectedObject.changeState(state);
													e.stop();
												}
											}
										}));
									});
									
									// 아이템을 불러옵니다.
									BigWorld.ItemModel.find({
										filter : {
											objectId : objectData.id
										}
									}, EACH((itemData) => {
										
										itemList.append(SkyDesktop.Folder({
											style : {
												marginTop : 10
											},
											spacing : 10,
											title : MSG(itemData.name),
											on : {
												tap : (e) => {
													e.stop();
												},
												open : (e, itemFolder) => {
													
													// 아이템 종류들을 불러옵니다.
													EACH(itemData.kinds, (kindData, kind) => {
														
														itemFolder.addItem({
															key : kind,
															item : UUI.BUTTON_H({
																style : {
																	marginTop : 10
																},
																icon : IMG({
																	src : BigWorld.R('stageeditor/kind.png')
																}),
																spacing : 10,
																title : MSG(kindData.name),
																on : {
																	tap : (e) => {
																		
																		if (selectedObject.checkItemExists({
																			itemId : itemData.id,
																			kind : kind
																		}) === true) {
																			selectedObject.removeItem(itemData.id);
																		}
																		
																		else {
																			selectedObject.addItem({
																				itemData : itemData,
																				kind : kind
																			});
																		}
																		
																		e.stop();
																	}
																}
															})
														});
													});
												},
												close : (e, itemFolder) => {
													itemFolder.removeAllItems();
												}
											}
										}));
									}));
								});
							}
						}
					}),
					
					UUI.BUTTON_H({
						style : {
							marginTop : 10
						},
						icon : IMG({
							src : BigWorld.R('stageeditor/tile.png')
						}),
						spacing : 10,
						title : '타일 선택',
						on : {
							tap : () => {
								
								deselect();
								
								BigWorld.CreateSelectTilePopup((tileData, left, top) => {
									
									let state;
									EACH(tileData.states, (stateData, _state) => {
										state = _state;
									});
									
									selectedTile = BigWorld.Tile({
										x : (left - WIN_WIDTH() / 2) / SkyEngine.Screen.getRatio() - stage.getX(),
										y : (top - WIN_HEIGHT() / 2) / SkyEngine.Screen.getRatio() - stage.getY(),
										tileData : tileData,
										kind : 0,
										state : state
									}).appendTo(stage);
									
									touchmoveEvent = EVENT('touchmove', (e) => {
										selectedTile.setX((e.getLeft() - WIN_WIDTH() / 2) / SkyEngine.Screen.getRatio() - stage.getX());
										selectedTile.setY((e.getTop() - WIN_HEIGHT() / 2) / SkyEngine.Screen.getRatio() - stage.getY());
									});
									
									tapEvent = EVENT('tap', (e) => {
										
										let tileRow = INTEGER(selectedTile.getY() < 0 ? selectedTile.getY() / tileHeight - 0.5 : selectedTile.getY() / tileHeight + 0.5);
										let tileCol = INTEGER(selectedTile.getX() < 0 ? selectedTile.getX() / tileWidth - 0.5 : selectedTile.getX() / tileWidth + 0.5);
										
										let sectionRow = INTEGER(selectedTile.getY() < 0 ? selectedTile.getY() / CONFIG.BigWorld.sectionHeight - 0.5 : selectedTile.getY() / CONFIG.BigWorld.sectionHeight + 0.5);
										let sectionCol = INTEGER(selectedTile.getX() < 0 ? selectedTile.getX() / CONFIG.BigWorld.sectionWidth - 0.5 : selectedTile.getX() / CONFIG.BigWorld.sectionWidth + 0.5);
										
										sectionRow -= tileRow * CONFIG.BigWorld.tileSectionLevel;
										sectionCol -= tileCol * CONFIG.BigWorld.tileSectionLevel;
										
										BigWorld.StageTileModel.create({
											stageId : stageData.id,
											tileId : tileData.id,
											kind : selectedTile.getKind(),
											tileRow : tileRow,
											tileCol : tileCol
										});
									});
									
									kindList.empty();
									stateList.empty();
									itemList.empty();
									
									// 종류들을 불러옵니다.
									EACH(tileData.kinds, (kindData, kind) => {
										
										itemList.append(UUI.BUTTON_H({
											style : {
												marginTop : 10
											},
											icon : IMG({
												src : BigWorld.R('stageeditor/kind.png')
											}),
											spacing : 10,
											title : MSG(kindData.name),
											on : {
												tap : (e) => {
													selectedTile.changeKind(kind);
													e.stop();
												}
											}
										}));
									});
								});
							}
						}
					}),
					
					kindList = DIV(),
					stateList = DIV(),
					itemList = DIV()]
				}).appendTo(BODY);
				
				touchstartEvent = EVENT('touchstart', (e) => {
					
					let startLeft = e.getLeft();
					let startTop = e.getTop();
					
					let originX = stage.getX();
					let originY = stage.getY();
					
					let touchmoveEvent = EVENT('touchmove', (e) => {
						stage.setPosition({
							x : originX + e.getLeft() - startLeft,
							y : originY + e.getTop() - startTop
						});
					});
					
					EVENT_ONCE('touchend', () => {
						touchmoveEvent.remove();
					});
					
					if (objectMenu !== undefined) {
						objectMenu.remove();
						objectMenu = undefined;
					}
				});
				
				keydownEvent = EVENT('keydown', (e) => {
					
					// 선택 취소
					if (e.getKey() === 'Escape') {
						
						if (objectMenu !== undefined) {
							objectMenu.remove();
							objectMenu = undefined;
						}
						
						deselect();
					}
				});
			});
		});
		
		inner.on('close', () => {
			background.remove();
			resizeEvent.remove();
			
			if (stage !== undefined) {
				stage.remove();
			}
			if (objectMenu !== undefined) {
				objectMenu.remove();
			}
			if (wrapper !== undefined) {
				wrapper.remove();
			}
			if (touchstartEvent !== undefined) {
				touchstartEvent.remove();
			}
			if (touchmoveEvent !== undefined) {
				touchmoveEvent.remove();
			}
			if (keydownEvent !== undefined) {
				keydownEvent.remove();
			}
		});
	}
});
BigWorld.MapEditor = CLASS({
	
	preset : () => {
		return VIEW;
	},
	
	init : (inner, self) => {
		
		TITLE('BigWorld 맵 에디터');
		
		let mapEditorStore = BigWorld.STORE('mapEditorStore');
		
		let nowMapId;
		let nowMapData;
		
		let nowTileId;
		let nowObjectId;
		let nowItemInfos = {};
		
		let nowKind;
		let nowState;
		let nowDirection = 'down';
		
		let reverseType = mapEditorStore.get('reverseType');
		
		let map;
		
		let menuPanel;
		let namePanel;
		let scaleInput;
		
		let tilePanel;
		let objectPanel;
		let wrapper = DIV({
			c : [menuPanel = UUI.PANEL({
				style : {
					position : 'fixed',
					left : 0,
					top : 0,
					height : '100%',
					overflowY : 'auto',
					backgroundColor : 'rgba(0, 0, 0, 0.3)'
				},
				contentStyle : {
					width : 200,
					padding : 10,
					paddingBottom : 200
				},
				c : [
				namePanel = H1(),
				
				DIV({
					style : {
						marginTop : 10
					},
					c : ['스케일: ', scaleInput = INPUT({
						style : {
							width : 30,
							textAlign : 'right'
						},
						on : {
							change : (e, input) => {
								
								let scale = REAL(input.getValue());
								
								mapEditorStore.save({
									name : nowMapId + '.scale',
									value : scale
								});
							}
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
							BigWorld.SelectTilePopup(selectTile);
						}
					}
				}),
				
				tilePanel = DIV({
					style : {
						marginTop : 10
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
							BigWorld.SelectObjectPopup(selectObject);
						}
					}
				}),
				
				objectPanel = DIV({
					style : {
						marginTop : 10
					}
				}),
				
				SkyDesktop.Button({
					style : {
						marginTop : 10,
						padding : '5px 10px'
					},
					title : '선택 해제',
					on : {
						tap : () => {
							deselect();
						}
					}
				})]
			})]
		}).appendTo(BODY);
		
		let deselect = () => {
			
			tilePanel.empty();
			objectPanel.empty();
			
			nowTileId = undefined;
			nowObjectId = undefined;
			nowItemInfos = {};
			
			nowKind = undefined;
			nowState = undefined;
			nowDirection = 'down';
			
			if (map !== undefined) {
				map.removeCursorNode();
			}
		};
		
		let selectTile = (tileId, tileName) => {
			deselect();
			
			nowTileId = tileId;
			
			let previewScreen;
			let rootKind;
			
			let brushSize = mapEditorStore.get(nowMapId + '.brushSize') == undefined ? 1 : mapEditorStore.get(nowMapId + '.brushSize');
			
			let createCursorNode = () => {
				
				if (map !== undefined) {
					
					map.setCursorNode({
						node : SkyEngine.Rect({
							x : -999999,
							y : -999999,
							centerX : brushSize % 2 === 0 ? -BigWorld.Tile.getTileWidth() / 2 : 0,
							centerY : brushSize % 2 === 0 ? -BigWorld.Tile.getTileHeight() / 2 : 0,
							width : BigWorld.Tile.getTileWidth() * brushSize,
							height : BigWorld.Tile.getTileHeight() * brushSize,
							border : '5px solid #FF0000'
						}),
						moveType : 'tile'
					});
				}
			};
			
			tilePanel.append(DIV({
				c : [
				H2({
					c : tileName
				}),
				
				previewScreen = SkyEngine.SubScreen({
					style : {
						marginTop : 10,
						backgroundColor : '#666',
						color : '#fff'
					},
					width : 200,
					height : 200,
					scale : 200 / BigWorld.Tile.getTileWidth() / 3
				}),
				
				DIV({
					style : {
						marginTop : 10
					},
					c : ['브러쉬 크기: ', INPUT({
						style : {
							width : 30,
							textAlign : 'right'
						},
						value : brushSize,
						on : {
							keyup : (e, input) => {
								
								brushSize = INTEGER(input.getValue());
								if (brushSize < 1) {
									brushSize = 1;
								}
								
								mapEditorStore.save({
									name : nowMapId + '.brushSize',
									value : brushSize
								});
								
								createCursorNode();
							}
						}
					})]
				}),
				
				// 종류 목록
				SkyDesktop.Tab({
					style : {
						marginTop : 10
					},
					c : SkyDesktop.FileTree({
						items : {
							
							// root 종류
							root : rootKind = SkyDesktop.Folder({
								style : {
									cursor : 'pointer'
								},
								icon : IMG({
									src : BigWorld.R('tileeditor/menu/kind.png')
								}),
								title : '종류',
								isToNotSort : true,
								on : {
									
									// 열리고 닫혀도 아이콘의 변경이 없어야 합니다.
									open : (e, item) => {
										item.setIcon(IMG({
											src : BigWorld.R('tileeditor/menu/kind.png')
										}));
									},
									close : (e, item) => {
										item.setIcon(IMG({
											src : BigWorld.R('tileeditor/menu/kind.png')
										}));
									}
								}
							})
						}
					})
				}),
				
				SkyDesktop.Button({
					style : {
						marginTop : 10,
						padding : '5px 10px'
					},
					title : '이 타일을 기본 타일로',
					on : {
						tap : () => {
							
							BigWorld.ValidPrompt({
								title : '기본 타일 설정',
								inputName : 'colRange',
								placeholder : 'Column 범위',
								inputName2 : 'rowRange',
								placeholder2 : 'Row 범위'
							}, (colRange, rowRange, showErrors, removePrompt) => {
								//TODO:
							});
						}
					}
				})]
			}));
			
			// root 종류는 처음부터 열려있습니다.
			rootKind.open();
			
			// 타일 정보를 불러옵니다.
			BigWorld.TileModel.get(tileId, (tileData) => {
				
				let refreshPreview = RAR(() => {
					previewScreen.empty();
					
					let kindMap = {};
					
					EACH(BigWorld.TILE_STATES, (state) => {
						
						let stateInfo = tileData.states[state];
						if (stateInfo !== undefined) {
							
							kindMap[state] = [];
							
							EACH(stateInfo.parts, (partInfo, partIndex) => {
								kindMap[state][partIndex] = nowKind === undefined ? RANDOM(partInfo.frames.length) : nowKind;
							});
						}
					});
					
					previewScreen.append(BigWorld.Tile({
						col : 0,
						row : 0,
						tileData : tileData,
						kindMap : kindMap
					}));
					
					// 커서를 따라다니는 노드 생성
					createCursorNode();
				});
				
				let selectedKind;
				
				let kind;
				rootKind.addItem({
					key : -1,
					item : kind = SkyDesktop.File({
						style : {
							cursor : 'pointer'
						},
						title : '종류 랜덤 선택',
						on : {
							tap : () => {
								
								if (selectedKind !== undefined) {
									selectedKind.deselect();
								}
								
								kind.select();
								selectedKind = kind;
								
								nowKind = undefined;
								
								refreshPreview();
							}
						}
					})
				});
				kind.tap();
				
				// 종류들 생성
				EACH(tileData.kinds, (kindInfo, index) => {
					
					let kind;
					rootKind.addItem({
						key : index,
						item : kind = SkyDesktop.File({
							style : {
								cursor : 'pointer'
							},
							title : MSG(kindInfo.name),
							on : {
								tap : () => {
									
									if (selectedKind !== undefined) {
										selectedKind.deselect();
									}
									
									kind.select();
									selectedKind = kind;
									
									nowKind = index;
									
									refreshPreview();
								}
							}
						})
					});
				});
			});
		};
		
		let selectObject = (objectId, objectName) => {
			deselect();
			
			nowObjectId = objectId;
			
			let previewScreen;
			let rootKind;
			let rootState;
			let itemTree;
			
			objectPanel.append(DIV({
				c : [
				H2({
					c : objectName
				}),
				
				previewScreen = SkyEngine.SubScreen({
					style : {
						marginTop : 10,
						backgroundColor : '#666',
						color : '#fff'
					},
					width : 200,
					height : 200,
					y : 50,
					scale : 200 / BigWorld.Tile.getTileWidth()
				}),
				
				UUI.FULL_CHECKBOX({
					style : {
						marginTop : 10,
					},
					label : '섹션 단위로 배치',
					value : mapEditorStore.get('isCursorNodeMoveTypeSection'),
					on : {
						change : (e, input) => {
							
							if (input.getValue() === true) {
								map.setCursorNodeMoveType('section');
							} else {
								map.setCursorNodeMoveType('pixel');
							}
							
							mapEditorStore.save({
								name : 'isCursorNodeMoveTypeSection',
								value : input.getValue()
							});
						}
					}
				}),
				
				UUI.FULL_SELECT({
					style : {
						marginTop : 10,
					},
					options : [OPTION({
						value : 'normal',
						c : '기본'
					}), OPTION({
						value : 'reverse',
						c : '반전'
					}), OPTION({
						value : 'random',
						c : '랜덤'
					})],
					value : reverseType,
					on : {
						change : (e, input) => {
							
							mapEditorStore.save({
								name : 'reverseType',
								value : input.getValue()
							});
							
							reverseType = input.getValue();
						}
					}
				}),
				
				// 종류 목록
				SkyDesktop.Tab({
					style : {
						marginTop : 10
					},
					c : SkyDesktop.FileTree({
						items : {
							
							// root 종류
							root : rootKind = SkyDesktop.Folder({
								style : {
									cursor : 'pointer'
								},
								icon : IMG({
									src : BigWorld.R('tileeditor/menu/kind.png')
								}),
								title : '종류',
								isToNotSort : true,
								on : {
									
									// 열리고 닫혀도 아이콘의 변경이 없어야 합니다.
									open : (e, item) => {
										item.setIcon(IMG({
											src : BigWorld.R('tileeditor/menu/kind.png')
										}));
									},
									close : (e, item) => {
										item.setIcon(IMG({
											src : BigWorld.R('tileeditor/menu/kind.png')
										}));
									}
								}
							})
						}
					})
				}),
				
				// 상태 목록
				SkyDesktop.Tab({
					style : {
						marginTop : 10
					},
					c : SkyDesktop.FileTree({
						items : {
							
							// root 상태
							root : rootState = SkyDesktop.Folder({
								style : {
									cursor : 'pointer'
								},
								icon : IMG({
									src : BigWorld.R('mapeditor/state.png')
								}),
								title : '상태',
								isToNotSort : true,
								on : {
									
									// 열리고 닫혀도 아이콘의 변경이 없어야 합니다.
									open : (e, item) => {
										item.setIcon(IMG({
											src : BigWorld.R('mapeditor/state.png')
										}));
									},
									close : (e, item) => {
										item.setIcon(IMG({
											src : BigWorld.R('mapeditor/state.png')
										}));
									}
								}
							})
						}
					})
				}),
				
				// 아이템 목록
				SkyDesktop.Tab({
					style : {
						marginTop : 10
					},
					c : DIV({
						c : [H5({
							style : {
								padding : 5
							},
							c : '아이템'
						}), itemTree = SkyDesktop.FileTree()]
					})
				})]
			}));
			
			// root 종류와 상태는 처음부터 열려있습니다.
			rootKind.open();
			rootState.open();
			
			// 오브젝트 정보를 불러옵니다.
			BigWorld.ObjectModel.get(objectId, (objectData) => {
				
				let refreshPreview = RAR(() => {
					previewScreen.empty();
					
					let object;
					previewScreen.append(object = BigWorld.Object({
						objectData : objectData,
						kind : nowKind === undefined ? 0 : nowKind,
						state : nowState,
						direction : nowDirection,
						isReverse : reverseType === 'reverse'
					}));
					
					EACH(nowItemInfos, (itemInfo, itemId) => {
						object.attachItem({
							id : itemId,
							item : BigWorld.Item({
								itemData : itemInfo.itemData,
								kind : itemInfo.kind === undefined ? 0 : itemInfo.kind
							})
						});
					});
					
					// 커서를 따라다니는 오브젝트 생성
					if (map !== undefined) {
						
						let cursorObject = BigWorld.Object({
							x : -999999,
							y : -999999,
							objectData : objectData,
							kind : nowKind === undefined ? 0 : nowKind,
							state : nowState,
							direction : nowDirection,
							isReverse : reverseType === 'reverse'
						});
						
						EACH(nowItemInfos, (itemInfo, itemId) => {
							cursorObject.attachItem({
								id : itemId,
								item : BigWorld.Item({
									itemData : itemInfo.itemData,
									kind : itemInfo.kind === undefined ? 0 : itemInfo.kind
								})
							});
						});
						
						cursorObject.append(SkyEngine.Rect({
							
							x : objectData.touchArea.x,
							y : objectData.touchArea.y,
							zIndex : 999999,
							
							width : objectData.touchArea.width,
							height : objectData.touchArea.height,
							
							border : '5px solid #00FF00'
						}));
						
						map.setCursorNode({
							node : cursorObject,
							moveType : mapEditorStore.get('isCursorNodeMoveTypeSection') === true ? 'section' : 'pixel'
						});
					}
				});
				
				let selectedKind;
				
				let kind;
				rootKind.addItem({
					key : -1,
					item : kind = SkyDesktop.File({
						style : {
							cursor : 'pointer'
						},
						title : '종류 랜덤 선택',
						on : {
							tap : () => {
								
								if (selectedKind !== undefined) {
									selectedKind.deselect();
								}
								
								kind.select();
								selectedKind = kind;
								
								nowKind = undefined;
								
								refreshPreview();
							}
						}
					})
				});
				kind.tap();
				
				// 종류들 생성
				EACH(objectData.kinds, (kindInfo, index) => {
					
					let kind;
					rootKind.addItem({
						key : index,
						item : kind = SkyDesktop.File({
							style : {
								cursor : 'pointer'
							},
							title : MSG(kindInfo.name),
							on : {
								tap : () => {
									
									if (selectedKind !== undefined) {
										selectedKind.deselect();
									}
									
									kind.select();
									selectedKind = kind;
									
									nowKind = index;
									
									refreshPreview();
								}
							}
						})
					});
				});
				
				let selectedState;
				
				// 상태들 생성
				EACH(objectData.states, (stateInfo, stateId) => {
					
					let state;
					rootState.addItem({
						key : stateId,
							item : state = SkyDesktop.File({
							style : {
								cursor : 'pointer'
							},
							title : MSG(stateInfo.name) + ' (' + stateId + ')',
							on : {
								tap : () => {
									
									if (selectedState !== undefined) {
										selectedState.deselect();
									}
									
									state.select();
									selectedState = state;
									
									nowState = stateId;
									
									refreshPreview();
								}
							}
						})
					});
					
					// 첫 상태인 경우 선택
					if (selectedState === undefined) {
						state.tap();
					}
				});
				
				// 아이템 목록을 불러옵니다.
				BigWorld.ItemModel.find({
					objectId : objectId
				}, (itemDataSet) => {
					
					let objectParts = [];
					
					EACH(itemDataSet, (itemData) => {
						if (CHECK_IS_IN({
							array : objectParts,
							value : itemData.objectPart
						}) !== true) {
							objectParts.push(itemData.objectPart);
						}
					});
					
					let items = {};
					
					EACH(objectParts, (objectPart) => {
						
						let itemFolder;
						itemTree.addItem({
							key : objectPart,
							item : itemFolder = SkyDesktop.Folder({
								style : {
									cursor : 'pointer'
								},
								icon : IMG({
									src : BigWorld.R('mapeditor/part.png')
								}),
								title : objectPart,
								on : {
									
									// 열리고 닫혀도 아이콘의 변경이 없어야 합니다.
									open : (e, item) => {
										item.setIcon(IMG({
											src : BigWorld.R('mapeditor/part.png')
										}));
									},
									close : (e, item) => {
										item.setIcon(IMG({
											src : BigWorld.R('mapeditor/part.png')
										}));
									}
								}
							})
						});
						
						itemFolder.open();
						
						// 오브젝트 파트별 아이템을 불러옵니다.
						EACH(itemDataSet, (itemData) => {
							
							if (itemData.objectPart === objectPart) {
								
								let nowItemKind = 0;
								
								let item;
								itemFolder.addItem({
									key : objectPart,
									item : item = SkyDesktop.Folder({
										style : {
											cursor : 'pointer'
										},
										icon : IMG({
											src : BigWorld.R('mapeditor/item.png')
										}),
										title : MSG(itemData.name),
										on : {
											
											tap : () => {
												
												if (nowItemInfos[itemData.id] !== undefined) {
													delete nowItemInfos[itemData.id];
													
													item.deselect();
													item.close();
												}
												
												else {
													
													EACH(nowItemInfos, (itemInfo, itemId) => {
														if (itemInfo.itemData.objectPart === objectPart) {
															delete nowItemInfos[itemId];
														}
													});
													
													nowItemInfos[itemData.id] = {
														itemData : itemData,
														kind : nowItemKind
													};
													
													item.select();
													item.open();
												}
												
												refreshPreview();
											},
											
											// 열리고 닫혀도 아이콘의 변경이 없어야 합니다.
											open : (e, item) => {
												item.setIcon(IMG({
													src : BigWorld.R('mapeditor/item.png')
												}));
											},
											close : (e, item) => {
												item.setIcon(IMG({
													src : BigWorld.R('mapeditor/item.png')
												}));
											}
										}
									})
								});
								
								items[itemData.id] = item;
								
								let selectedKind;
								
								let kind;
								item.addItem({
									key : -1,
									item : kind = SkyDesktop.File({
										style : {
											cursor : 'pointer'
										},
										title : '종류 랜덤 선택',
										on : {
											tap : () => {
												
												if (selectedKind !== undefined) {
													selectedKind.deselect();
												}
												
												kind.select();
												selectedKind = kind;
												
												nowItemKind = undefined;
												if (nowItemInfos[itemData.id] !== undefined) {
													delete nowItemInfos[itemData.id].kind;
												}
												
												refreshPreview();
											}
										}
									})
								});
								kind.tap();
								
								// 아이템의 종류들 생성
								EACH(itemData.kinds, (kindInfo, index) => {
									
									let kind;
									item.addItem({
										key : index,
										item : kind = SkyDesktop.File({
											style : {
												cursor : 'pointer'
											},
											title : MSG(kindInfo.name),
											on : {
												tap : () => {
													
													if (selectedKind !== undefined) {
														selectedKind.deselect();
													}
													
													kind.select();
													selectedKind = kind;
													
													nowItemKind = index;
													if (nowItemInfos[itemData.id] !== undefined) {
														nowItemInfos[itemData.id].kind = nowItemKind;
													}
													
													refreshPreview();
												}
											}
										})
									});
								});
							}
						});
					});
				});
			});
		};
		
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
				
				let putObject = (x, y) => {
					
					// 선택된 오브젝트가 있다면
					if (nowObjectId !== undefined) {
						
						// 오브젝트 정보를 불러옵니다.
						BigWorld.ObjectModel.get(nowObjectId, (objectData) => {
							
							let isReverse;
							
							if (reverseType === 'reverse') {
								isReverse = true;
							} else if (reverseType === 'random') {
								isReverse = RANDOM(2) === 0 ? true : undefined;
							}
							
							let items = [];
							
							NEXT(nowItemInfos, [
							(itemInfo, next, itemId) => {
								
								// 아이템 정보를 불러옵니다.
								BigWorld.ItemModel.get(itemId, (itemData) => {
									
									items.push({
										id : itemId,
										kind : itemInfo.kind === undefined ? RANDOM(itemData.kinds.length) : itemInfo.kind
									});
									
									next();
								});
							},
							
							() => {
								return () => {
									
									// 타일 생성
									BigWorld.MapObjectModel.create({
										mapId : nowMapId,
										objectId : nowObjectId,
										kind : nowKind === undefined ? RANDOM(objectData.kinds.length) : nowKind,
										state : nowState,
										items : items,
										direction : nowDirection,
										x : INTEGER(x),
										y : INTEGER(y),
										isReverse : isReverse
									});
								};
							}]);
						});
					}
				};
				
				map = BigWorld.Map({
					
					mapData : mapData,
					
					scale : mapEditorStore.get(nowMapId + '.scale'),
					x : mapEditorStore.get(nowMapId + '.x'),
					y : mapEditorStore.get(nowMapId + '.y'),
					
					isMovable : true,
					isZoomable : true,
					isToShowGrid : true,
					
					changeScale : (scale) => {
						scaleInput.setValue(scale.toFixed(2));
					},
					
					movePosition : (x, y) => {
						mapEditorStore.save({
							name : nowMapId + '.x',
							value : x
						});
						mapEditorStore.save({
							name : nowMapId + '.y',
							value : y
						});
					},
					
					pickPosition : (x, y) => {
						if (mapEditorStore.get('isCursorNodeMoveTypeSection') !== true) {
							putObject(x, y);
						}
					},
					
					pickSectionPosition : (sectionCol, sectionRow) => {
						if (mapEditorStore.get('isCursorNodeMoveTypeSection') === true) {
							putObject(sectionCol * CONFIG.BigWorld.sectionWidth, sectionRow * CONFIG.BigWorld.sectionHeight);
						}
					},
					
					pickTilePosition : (tileCol, tileRow) => {
						
						// 선택된 타일이 있다면
						if (nowTileId !== undefined) {
							
							// 타일 정보를 불러옵니다.
							BigWorld.TileModel.get(nowTileId, (tileData) => {
								
								let kindMap = {};
								
								EACH(BigWorld.TILE_STATES, (state) => {
									
									let stateInfo = tileData.states[state];
									if (stateInfo !== undefined) {
										
										kindMap[state] = [];
										
										EACH(stateInfo.parts, (partInfo, partIndex) => {
											kindMap[state][partIndex] = nowKind === undefined ? RANDOM(partInfo.frames.length) : nowKind;
										});
									}
								});
								
								// 타일 생성
								BigWorld.MapTileModel.create({
									mapId : nowMapId,
									tileId : nowTileId,
									kindMap : kindMap,
									col : tileCol,
									row : tileRow
								});
							});
						}
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
			
			wrapper.remove();
		});
	}
});
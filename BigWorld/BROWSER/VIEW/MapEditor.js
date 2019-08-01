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
		
		let brushSize = mapEditorStore.get('brushSize') === undefined ? 1 : mapEditorStore.get('brushSize');
		let reverseType = mapEditorStore.get('reverseType');
		
		let map;
		
		let menuPanel;
		let namePanel;
		let scaleInput;
		let columnInput;
		let rowInput;
		
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
					backgroundColor : 'rgba(0, 0, 0, 0.8)'
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
				
				DIV({
					style : {
						marginTop : 10
					},
					c : [DIV({
						style : {
							marginTop : 4,
							flt : 'left'
						},
						c : ['Col: ', columnInput = INPUT({
							style : {
								width : 30,
								textAlign : 'right'
							}
						}), ' Row: ', rowInput = INPUT({
							style : {
								width : 30,
								textAlign : 'right'
							}
						})]
					}), SkyDesktop.Button({
						style : {
							marginLeft : 10,
							flt : 'left',
							padding : '5px 10px'
						},
						title : '이동',
						on : {
							tap : () => {
								if (map !== undefined) {
									map.setPosition({
										x : -columnInput.getValue() * BigWorld.Tile.getTileWidth() * map.getScaleX(),
										y : -rowInput.getValue() * BigWorld.Tile.getTileHeight() * map.getScaleY()
									});
								}
							}
						}
					}), CLEAR_BOTH()]
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
			
			let nowTileData;
			
			let previewScreen;
			let rootKind;
			
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
									name : 'brushSize',
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
							
							if (nowTileData !== undefined) {
								
								SkyDesktop.Confirm({
									msg : '정말 기본 타일을 지정하시겠습니까? 기존에 놓아둔 모든 타일이 교체되며, 돌이킬 수 없습니다.'
								}, () => {
										
									BigWorld.ValidPrompt({
										title : '기본 타일 설정',
										inputName : 'colRange',
										placeholder : 'Column 범위',
										inputName2 : 'rowRange',
										placeholder2 : 'Row 범위'
									}, (colRange, rowRange, showErrors, removePrompt) => {
										
										let ranges = [];
										
										for (let row = -Math.floor((rowRange - 1) / 2); row <= Math.floor(rowRange / 2); row += 1) {
											for (let col = -Math.floor((colRange - 1) / 2); col <= Math.floor(colRange / 2); col += 1) {
												ranges.push({
													col : col,
													row : row
												});
											}
										}
										
										let panel = UUI.PANEL({
											style : {
												zIndex : 999,
												position : 'fixed',
												right : 10,
												bottom : 10,
												backgroundColor : '#FFFFCC',
												color : '#333',
												borderRadius : 5
											},
											contentStyle : {
												padding : '5px 10px'
											}
										}).appendTo(BODY);
										
										NEXT(ranges, [
										(range, next) => {
											
											let kindMap = {};
											
											EACH(BigWorld.TILE_STATES, (state) => {
												
												let stateInfo = nowTileData.states[state];
												if (stateInfo !== undefined) {
													
													kindMap[state] = [];
													
													EACH(stateInfo.parts, (partInfo, partIndex) => {
														kindMap[state][partIndex] = nowKind === undefined ? RANDOM(partInfo.frames.length) : nowKind;
													});
												}
											});
											
											// 타일 놓기
											BigWorld.MapTileModel.put({
												mapId : nowMapId,
												tileId : nowTileId,
												kindMap : kindMap,
												col : range.col,
												row : range.row
											}, () => {
												
												panel.empty();
												panel.append('Column: ' + range.col + ', Row: ' + range.row + ' 타일을 저장했습니다.');
												
												next();
											});
										},
										
										() => {
											return () => {
												
												panel.remove();
												
												SkyDesktop.Noti('기본 타일 지정이 완료되었습니다.');
											};
										}]);
										
										removePrompt();
									});
								});
							}
						}
					}
				})]
			}));
			
			// root 종류는 처음부터 열려있습니다.
			rootKind.open();
			
			// 타일 정보를 불러옵니다.
			BigWorld.TileModel.get(tileId, (tileData) => {
				nowTileData = tileData;
				
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
					
					BigWorld.Tile({
						col : 0,
						row : 0,
						tileData : tileData,
						kindMap : kindMap
					}).appendTo(previewScreen).draw();
					
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
			
			let refreshPreview;
			
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
							
							if (refreshPreview !== undefined) {
								refreshPreview();
							}
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
				
				refreshPreview = RAR(() => {
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
						
						// 충돌 영역 드로잉
						cursorObject.append(BigWorld.SectionMapPreview({
							sectionMap : objectData.sectionMap,
							sectionLevels : objectData.sectionLevels,
							direction : nowDirection
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
					
					pickPosition : (x, y, sectionCol, sectionRow, tileCol, tileRow) => {
						
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
								
								for (let col = tileCol - Math.floor((brushSize - 1) / 2); col <= tileCol + Math.floor(brushSize / 2); col += 1) {
									for (let row = tileRow - Math.floor((brushSize - 1) / 2); row <= tileRow + Math.floor(brushSize / 2); row += 1) {
										
										// 타일 놓기
										BigWorld.MapTileModel.put({
											mapId : nowMapId,
											tileId : nowTileId,
											kindMap : kindMap,
											col : col,
											row : row
										});
									}
								}
							});
						}
						
						// 선택된 오브젝트가 있다면
						else if (nowObjectId !== undefined) {
							
							let cursorNode = map.getCursorNode();
							
							if (
							// 커서 노드와 같은 위치에 오브젝트가 있으면 안됩니다.
							map.getObjectByPosition({
								x : cursorNode.getX(),
								y : cursorNode.getY()
							}) === undefined &&
							
							// 커서 노드와 충돌하는 오브젝트가 있으면 안됩니다.
							map.getCollidedObject(cursorNode) === undefined) {
								
								if (mapEditorStore.get('isCursorNodeMoveTypeSection') === true) {
									x = sectionCol * CONFIG.BigWorld.sectionWidth;
									y = sectionRow * CONFIG.BigWorld.sectionHeight;
								}
								
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
												x : x,
												y : y,
												isReverse : isReverse
											});
										};
									}]);
								});
							}
						}
					},
					
					contextmenu : (e, x, y, sectionCol, sectionRow, tileCol, tileRow) => {
						
						let mapTileId = map.findMapTileId({
							col : tileCol,
							row : tileRow
						});
						
						let mapObjectId = map.findMapObjectId({
							x : x,
							y : y
						});
						
						// 맵 오브젝트 수정
						if (mapObjectId !== undefined) {
							
							let contextMenu = SkyDesktop.ContextMenu({
								e : e,
								c : [
								
								SkyDesktop.ContextMenuItem({
									title : '오브젝트 제거',
									icon : IMG({
										src : BigWorld.R('mapeditor/remove.png')
									}),
									on : {
										tap : () => {
											
											BigWorld.MapObjectModel.remove(mapObjectId);
											
											contextMenu.remove();
										}
									}
								})]
							});
						}
						
						// 맵 타일 수정
						else if (mapTileId !== undefined) {
							
							let contextMenu = SkyDesktop.ContextMenu({
								e : e,
								c : [
								
								SkyDesktop.ContextMenuItem({
									title : '타일 제거',
									icon : IMG({
										src : BigWorld.R('mapeditor/remove.png')
									}),
									on : {
										tap : () => {
											
											BigWorld.MapTileModel.remove(mapTileId);
											
											contextMenu.remove();
										}
									}
								})]
							});
						}
						
						e.stop();
					}
					
				}).appendTo(SkyEngine.Screen);
				
				namePanel.empty();
				namePanel.append(MSG(mapData.name));
				
				scaleInput.setValue(map.getScaleX());
			});
		});
		
		let keydownEvent = EVENT('keydown', (e) => {
			
			if (e.getKey() === 'Escape') {
				deselect();
			}
			
			if (e.getKey() === 'Control') {
				if (map !== undefined) {
					map.turnOnPlaceMode();
				}
			}
			
			// 그리드 숫자 보이기
			if (e.getKey() === '`') {
				if (map !== undefined) {
					map.showGridNumber();
				}
			}
		});
		
		let keyupEvent = EVENT('keyup', (e) => {
			
			if (e.getKey() === 'Control') {
				if (map !== undefined) {
					map.turnOffPlaceMode();
				}
			}
			
			// 그리드 숫자 숨기기
			if (e.getKey() === '`') {
				if (map !== undefined) {
					map.hideGridNumber();
				}
			}
		});
		
		inner.on('close', () => {
			
			if (map !== undefined) {
				map.remove();
			}
			
			keydownEvent.remove();
			keyupEvent.remove();
			
			wrapper.remove();
		});
	}
});
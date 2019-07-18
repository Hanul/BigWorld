BigWorld.TileEditor = CLASS(() => {
	
	const TILE_STATES = [
		'center',
		'left',
		'leftTop',
		'top',
		'rightTop',
		'right',
		'rightBottom',
		'bottom',
		'leftBottom',
		'fillLeftBottom',
		'fillLeftTop',
		'fillRightTop',
		'fillRightBottom'
	];
	
	return {
		
		preset : () => {
			return VIEW;
		},
		
		init : (inner, self) => {
			
			TITLE('BigWorld 타일 에디터');
			
			let tileEditorStore = BigWorld.STORE('tileEditorStore');
			
			let nowTileId;
			let nowTileData;
			let nowKind;
			let nowState;
			
			let rootKind;
			let rootState;
			let selectedKind;
			let selectedState;
			
			let editorWrapper;
			let sectionEditor;
			let tilePreview;
			
			let isRemoved;
			
			let wrapper = TABLE({
				style : {
					position : 'absolute',
					width : '100%',
					height : '100%'
				},
				c : [
				
				// 상단 메뉴
				TR({
					c : TD({
						style : {
							height : 28
						},
						c : SkyDesktop.Toolbar({
							buttons : [
							
							// 종류 추가 버튼
							SkyDesktop.ToolbarButton({
								icon : IMG({
									src : BigWorld.R('tileeditor/menu/kind.png')
								}),
								title : '종류 추가',
								on : {
									tap : () => {
										
										BigWorld.ValidPrompt({
											title : '종류 추가',
											inputName : 'name.ko',
											placeholder : '종류 이름',
											errorMsgs : {
												'name.ko' : {
													size : (validParams) => {
														return '최대 ' + validParams.max + '글자입니다.';
													}
												}
											},
											okButtonTitle : '추가'
										}, (kindName, showErrors, removePrompt) => {
											
											if (kindName.trim() === '') {
												SkyDesktop.Alert({
													msg : '추가할 종류 이름을 입력해주세요.'
												});
											} else {
												
												let kindInfo = {
													name : {
														ko : kindName
													}
												};
												
												nowTileData.kinds.push(kindInfo);
												
												saveTile();
												
												addKind(nowTileData.kinds.length - 1, kindInfo).tap();
												
												removePrompt();
											}
										});
									}
								}
							}),
							
							// 삭제 버튼
							SkyDesktop.ToolbarButton({
								icon : IMG({
									src : BigWorld.R('tileeditor/menu/remove.png')
								}),
								title : '타일 삭제',
								on : {
									tap : () => {
										
										SkyDesktop.Confirm({
											msg : '타일을 삭제하시겠습니까?',
											okButtonTitle : '삭제'
										}, () => {
											
											let loadingBar = SkyDesktop.LoadingBar('lime');
											
											BigWorld.TileModel.remove(nowTileId, () => {
												isRemoved = true;
												close();
											});
										});
									}
								}
							})]
						})
					})
				}),
				
				// 하단 내용
				TR({
					style : {
						height : '100%'
					},
					c : TD({
						c : SkyDesktop.HorizontalTabList({
							tabs : [
							
							// 종류 목록
							SkyDesktop.Tab({
								size : 15,
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
								size : 15,
								c : SkyDesktop.FileTree({
									items : {
										
										// root 상태
										root : rootState = SkyDesktop.Folder({
											style : {
												cursor : 'pointer'
											},
											icon : IMG({
												src : BigWorld.R('tileeditor/menu/state.png')
											}),
											title : '상태',
											isToNotSort : true,
											on : {
												
												// 열리고 닫혀도 아이콘의 변경이 없어야 합니다.
												open : (e, item) => {
													item.setIcon(IMG({
														src : BigWorld.R('tileeditor/menu/state.png')
													}));
												},
												close : (e, item) => {
													item.setIcon(IMG({
														src : BigWorld.R('tileeditor/menu/state.png')
													}));
												}
											}
										})
									}
								})
							}),
							
							// 편집 뷰
							SkyDesktop.Tab({
								size : 70,
								c : editorWrapper = DIV({
									style : {
										padding : 10
									}
								})
							})]
						})
					})
				})]
			}).appendTo(BODY);
			
			// root 종류와 상태는 처음부터 열려있습니다.
			rootKind.open();
			rootState.open();
			
			// 변경된 타일 정보를 저장합니다.
			let saveTile = () => {
				
				if (nowTileData !== undefined) {
					
					let loadingBar = SkyDesktop.LoadingBar('lime');
					
					// 섹션맵이 없는 경우 추가
					EACH(nowTileData.states, (stateInfo) => {
						if (stateInfo.sectionMap === undefined) {
							stateInfo.sectionMap = BigWorld.Tile.getInitSectionMap();
						}
					});
					
					// 변경된 타일 데이터 저장
					BigWorld.TileModel.update(nowTileData, {
						
						notValid : () => {
							loadingBar.done();
							
							SkyDesktop.Alert({
								msg : '타일을 저장할 수 없습니다. 데이터를 확인해주시기 바랍니다.'
							});
						},
						
						success : () => {
							loadingBar.done();
							
							SkyDesktop.Noti('타일을 저장했습니다.');
						}
					});
					
					// 미리보기 새로고침
					if (sectionEditor !== undefined) {
						sectionEditor.refresh();
						tilePreview.refresh();
					}
				}
			};
			
			// 현재 선택된 종류와 상태의 내용을 수정하는 에디터를 엽니다.
			let openEditor = () => {
				editorWrapper.empty();
				
				if (nowKind !== undefined && nowState !== undefined) {
					
					editorWrapper.append(H3({
						c : '선택된 종류: ' + MSG(nowTileData.kinds[nowKind].name) + ' / 선택된 상태: ' + selectedState.getTitle()
					}));
					
					// 섹션 편집
					editorWrapper.append(sectionEditor = BigWorld.SectionEditor({
						
						style : {
							flt : 'left',
							marginTop : 10
						},
						
						sectionMap : nowTileData.states[nowState] === undefined ? BigWorld.Tile.getInitSectionMap() : nowTileData.states[nowState].sectionMap,
						
						elementData : {
							leftSectionLevel : CONFIG.BigWorld.tileSectionLevel - 1,
							upSectionLevel : CONFIG.BigWorld.tileSectionLevel - 1,
							rightSectionLevel : CONFIG.BigWorld.tileSectionLevel - 1,
							downSectionLevel : CONFIG.BigWorld.tileSectionLevel - 1
						},
						
						isTileMode : true,
						
						save : saveTile,
						refresh : (previewScreen, direction) => {
							
							let stateInfo = nowTileData.states[nowState];
							if (stateInfo !== undefined) {
								
								EACH(stateInfo.parts, (partInfo) => {
									
									let frameImageId = partInfo.frames[nowKind];
									if (frameImageId !== undefined) {
										
										previewScreen.append(SkyEngine.Sprite({
											src : BigWorld.RF(frameImageId),
											fps : partInfo.fps,
											frameCount : partInfo.frameCount,
											zIndex : partInfo.zIndex,
											x : partInfo.x,
											y : partInfo.y
										}));
									}
								});
							}
						}
					}));
					
					// 미리보기
					editorWrapper.append(tilePreview = BigWorld.TilePreview({
						
						style : {
							flt : 'left',
							marginLeft : 10,
							marginTop : 10
						},
						
						refresh : (previewScreen, direction) => {
							
							let kindMap = {};
							
							EACH(TILE_STATES, (state) => {
								
								let stateInfo = nowTileData.states[state];
								if (stateInfo !== undefined) {
									
									kindMap[state] = [];
									
									EACH(stateInfo.parts, (partInfo, partIndex) => {
										kindMap[state][partIndex] = nowKind;
									});
								}
							});
							
							previewScreen.append(BigWorld.Tile({
								col : 0,
								row : 0,
								tileData : nowTileData,
								kindMap : kindMap
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : -3,
								row : 0,
								tileData : nowTileData,
								kindMap : kindMap,
								topTileId : nowTileData.id,
								bottomTileId : nowTileData.id
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : -3,
								row : -1,
								tileData : nowTileData,
								kindMap : kindMap,
								topTileId : nowTileData.id,
								bottomTileId : nowTileData.id
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : -3,
								row : -2,
								tileData : nowTileData,
								kindMap : kindMap,
								topTileId : nowTileData.id,
								rightTopTileId : nowTileData.id,
								bottomTileId : nowTileData.id
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : -3,
								row : -3,
								tileData : nowTileData,
								kindMap : kindMap,
								rightTileId : nowTileData.id,
								bottomTileId : nowTileData.id
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : -2,
								row : -3,
								tileData : nowTileData,
								kindMap : kindMap,
								leftTileId : nowTileData.id,
								rightTileId : nowTileData.id,
								leftBottomTileId : nowTileData.id
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : -1,
								row : -3,
								tileData : nowTileData,
								kindMap : kindMap,
								leftTileId : nowTileData.id,
								rightTileId : nowTileData.id
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : 0,
								row : -3,
								tileData : nowTileData,
								kindMap : kindMap,
								leftTileId : nowTileData.id,
								rightTileId : nowTileData.id
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : 1,
								row : -3,
								tileData : nowTileData,
								kindMap : kindMap,
								leftTileId : nowTileData.id,
								rightTileId : nowTileData.id
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : 2,
								row : -3,
								tileData : nowTileData,
								kindMap : kindMap,
								leftTileId : nowTileData.id,
								rightTileId : nowTileData.id,
								rightBottomTileId : nowTileData.id
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : 3,
								row : -3,
								tileData : nowTileData,
								kindMap : kindMap,
								leftTileId : nowTileData.id,
								bottomTileId : nowTileData.id
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : 3,
								row : -2,
								tileData : nowTileData,
								kindMap : kindMap,
								topTileId : nowTileData.id,
								bottomTileId : nowTileData.id,
								leftTopTileId : nowTileData.id
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : 3,
								row : -1,
								tileData : nowTileData,
								kindMap : kindMap,
								topTileId : nowTileData.id,
								bottomTileId : nowTileData.id
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : 3,
								row : 0,
								tileData : nowTileData,
								kindMap : kindMap,
								topTileId : nowTileData.id,
								bottomTileId : nowTileData.id
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : 3,
								row : 1,
								tileData : nowTileData,
								kindMap : kindMap,
								topTileId : nowTileData.id,
								bottomTileId : nowTileData.id
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : 3,
								row : 2,
								tileData : nowTileData,
								kindMap : kindMap,
								topTileId : nowTileData.id,
								bottomTileId : nowTileData.id,
								leftBottomTileId : nowTileData.id
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : 3,
								row : 3,
								tileData : nowTileData,
								kindMap : kindMap,
								topTileId : nowTileData.id,
								leftTileId : nowTileData.id
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : 2,
								row : 3,
								tileData : nowTileData,
								kindMap : kindMap,
								leftTileId : nowTileData.id,
								rightTopTileId : nowTileData.id,
								rightTileId : nowTileData.id
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : 1,
								row : 3,
								tileData : nowTileData,
								kindMap : kindMap,
								leftTileId : nowTileData.id,
								rightTileId : nowTileData.id
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : 0,
								row : 3,
								tileData : nowTileData,
								kindMap : kindMap,
								leftTileId : nowTileData.id,
								rightTileId : nowTileData.id
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : -1,
								row : 3,
								tileData : nowTileData,
								kindMap : kindMap,
								leftTileId : nowTileData.id,
								rightTileId : nowTileData.id
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : -2,
								row : 3,
								tileData : nowTileData,
								kindMap : kindMap,
								leftTileId : nowTileData.id,
								leftTopTileId : nowTileData.id,
								rightTileId : nowTileData.id
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : -3,
								row : 3,
								tileData : nowTileData,
								kindMap : kindMap,
								topTileId : nowTileData.id,
								rightTileId : nowTileData.id
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : -3,
								row : 2,
								tileData : nowTileData,
								kindMap : kindMap,
								topTileId : nowTileData.id,
								rightBottomTileId : nowTileData.id,
								bottomTileId : nowTileData.id
							}));
							
							previewScreen.append(BigWorld.Tile({
								col : -3,
								row : 1,
								tileData : nowTileData,
								kindMap : kindMap,
								topTileId : nowTileData.id,
								bottomTileId : nowTileData.id
							}));
						}
					}));
					
					// 스케일 조정
					editorWrapper.append(UUI.FULL_INPUT({
						style : {
							marginLeft : 10,
							marginTop : 10,
							flt : 'left',
							width : 30
						},
						value : tileEditorStore.get('scale'),
						placeholder : '배율',
						on : {
							change : (e, input) => {
								
								let previewScale = REAL(input.getValue());
								
								tileEditorStore.save({
									name : 'scale',
									value : previewScale
								});
								
								sectionEditor.setScale(previewScale);
								sectionEditor.refresh();
								
								tilePreview.setScale(previewScale);
								tilePreview.refresh();
							}
						}
					}));
					
					editorWrapper.append(CLEAR_BOTH());
					
					if (tileEditorStore.get('scale') != undefined) {
						sectionEditor.setScale(tileEditorStore.get('scale'));
						tilePreview.setScale(tileEditorStore.get('scale'));
					}
					
					// 파트 편집
					let partsEditor;
					editorWrapper.append(partsEditor = BigWorld.PartsEditor({
						style : {
							marginTop : 10
						},
						stateInfos : nowTileData.states,
						state : nowState,
						kind : nowKind,
						save : saveTile
					}));
					
					// 파트 에디터 열기
					let stateInfo = nowTileData.states[nowState];
					if (stateInfo !== undefined) {
						EACH(stateInfo.parts, partsEditor.addPartEditor);
					}
				}
			};
			
			let addKind = (index, kindInfo) => {
				
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
								openEditor();
							},
							
							// 오른 클릭 메뉴
							contextmenu : (e) => {
								
								let contextMenu = SkyDesktop.ContextMenu({
									e : e,
									c : [SkyDesktop.ContextMenuItem({
										title : '정보 수정',
										icon : IMG({
											src : BigWorld.R('tileeditor/menu/edit.png')
										}),
										on : {
											tap : () => {
												
												BigWorld.ValidPrompt({
													title : '종류 수정',
													inputName : 'name.ko',
													placeholder : '종류 이름',
													value : kindInfo.name.ko,
													errorMsgs : {
														'name.ko' : {
															size : (validParams) => {
																return '최대 ' + validParams.max + '글자입니다.';
															}
														}
													},
													okButtonTitle : '수정'
												}, (kindName, showErrors, removePrompt) => {
													
													if (kindName.trim() === '') {
														SkyDesktop.Alert({
															msg : '종류 이름을 입력해주세요.'
														});
													} else {
														
														kindInfo.name = {
															ko : kindName
														};
														
														saveTile();
														
														kind.setTitle(MSG(kindInfo.name));
														
														removePrompt();
													}
												});
												
												contextMenu.remove();
											}
										}
									}), nowTileData.kinds.length <= 1 ? undefined : SkyDesktop.ContextMenuItem({
										title : '종류 삭제',
										icon : IMG({
											src : BigWorld.R('tileeditor/menu/remove.png')
										}),
										on : {
											tap : () => {
												
												SkyDesktop.Confirm({
													msg : '정말 종류를 삭제하시겠습니까?'
												}, () => {
													
													let kindIndex = FIND({
														array : nowTileData.kinds,
														value : kindInfo
													});
													
													nowTileData.kinds.splice(kindIndex, 1);
													
													// 상태의 파트에서 이 종류의 프레임들을 모두 삭제
													EACH(nowTileData.states, (stateInfo) => {
														
														EACH(stateInfo.parts, (partInfo) => {
															
															partInfo.frames.splice(kindIndex, 1);
														});
													});
													
													saveTile();
													
													rootKind.removeItem(kindIndex);
													
													if (nowKind === kindIndex) {
														nowKind = 0;
														openEditor();
													}
												});
												
												contextMenu.remove();
											}
										}
									})]
								});
								
								e.stop();
							}
						}
					})
				});
				
				return kind;
			};
			
			EACH(TILE_STATES, (stateId) => {
				
				let state;
				
				rootState.addItem({
					key : stateId,
					item : state = SkyDesktop.File({
						style : {
							cursor : 'pointer'
						},
						icon : IMG({
							src : BigWorld.R('tileeditor/state/' + stateId + '.png')
						}),
						title : stateId.replace(/([A-Z]+)*([A-Z][a-z])/g, '$1 $2').toLowerCase(),
						on : {
							tap : () => {
								
								if (selectedState !== undefined) {
									selectedState.deselect();
								}
								
								state.select();
								selectedState = state;
								
								nowState = stateId;
								openEditor();
							}
						}
					})
				});
			});
			
			inner.on('paramsChange', (params) => {
				nowTileId = params.tileId;
				
				// 초기화
				selectedKind = undefined;
				rootKind.removeAllItems();
				editorWrapper.empty();
				
				// 타일 데이터를 불러옵니다.
				BigWorld.TileModel.get(nowTileId, (tileData) => {
					nowTileData = tileData;
					
					// 종류들 생성
					EACH(tileData.kinds, (kindInfo, i) => {
						addKind(i, kindInfo);
					});
					
					// 맨 처음에는 첫 종류와 첫 상태를 열기
					rootKind.getItem(0).tap();
					rootState.getItem('center').tap();
				});
			});
			
			// 새로고침 막기
			window.addEventListener('beforeunload', (e) => {
				if (isRemoved !== true) {
					e.returnValue = null;
					return null;
				}
			});
			
			// 틀 어긋난 부분 수정
			DELAY(0.2, () => {
				EVENT.fireAll('resize');
			});
	
			inner.on('close', () => {
				wrapper.remove();
			});
		}
	};
});
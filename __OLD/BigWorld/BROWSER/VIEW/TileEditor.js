BigWorld.TileEditor = CLASS({
	
	preset : () => {
		return VIEW;
	},
	
	init : (inner, self) => {
		
		TITLE('BigWorld Tile Editor');
		
		let halfTileSectionLevel = (CONFIG.BigWorld.tileSectionLevel - 1) / 2;
		
		let tileEditorStore = BigWorld.STORE('tileEditorStore');
		
		let isControlMode;
		let isRemoved;
		
		let keydownEvent = EVENT('keydown', (e) => {
			if (e.getKey() === 'Control') {
				isControlMode = true;
			}
		});
		
		let keyupEvent = EVENT('keyup', (e) => {
			if (e.getKey() === 'Control') {
				isControlMode = false;
			}
		});
		
		let wrapper;
		inner.on('paramsChange', (params) => {
			
			BigWorld.TileModel.get(params.tileId, (tileData) => {
				
				let direction;
				let selectedKindIndex;
				let selectedState;
				
				// 저장되어 있는 정보가 있다면
				let savedTileInfo = tileEditorStore.get(tileData.id);
				if (savedTileInfo !== undefined) {
					direction = savedTileInfo.direction;
					selectedKindIndex = savedTileInfo.selectedKindIndex;
					selectedState = savedTileInfo.selectedState;
				}
				
				if (direction === undefined) {
					// 아래쪽을 바라보는게 기본입니다.
					direction = 'down';
				}
				
				let kindList;
				let stateList;
				let previewWrapper;
				
				let createSectionTool = () => {
					
					screenWrapper.empty();
					
					let screen;
					let sectionWrapper;
					
					// 섹션들을 출력합니다.
					let showSections = () => {
						
						sectionWrapper.empty();
						
						EACH(tileData.sectionMap, (sections, i) => {
							EACH(sections, (section, j) => {
								
								let x, y;
								
								if (direction === 'down') {
									x = CONFIG.BigWorld.sectionWidth * (j - halfTileSectionLevel);
									y = CONFIG.BigWorld.sectionHeight * (i - halfTileSectionLevel);
								}
								if (direction === 'left') {
									x = -CONFIG.BigWorld.sectionHeight * (i - halfTileSectionLevel);
									y = CONFIG.BigWorld.sectionWidth * (j - halfTileSectionLevel);
								}
								if (direction === 'up') {
									x = -CONFIG.BigWorld.sectionWidth * (j - halfTileSectionLevel);
									y = -CONFIG.BigWorld.sectionHeight * (i - halfTileSectionLevel);
								}
								if (direction === 'right') {
									x = CONFIG.BigWorld.sectionHeight * (i - halfTileSectionLevel);
									y = -CONFIG.BigWorld.sectionWidth * (j - halfTileSectionLevel);
								}
								
								sectionWrapper.append(SkyEngine.Rect({
									x : x,
									y : y,
									width : CONFIG.BigWorld.sectionWidth - 0.5,
									height : CONFIG.BigWorld.sectionHeight - 0.5,
									color : section.isTrigger === true ? 'rgba(0, 174, 221, 128)' : (section.isBlock === true ? 'rgba(255, 0, 0, 128)' : 'rgba(0, 255, 0, 128)'),
									touchArea : SkyEngine.Rect({
										width : CONFIG.BigWorld.sectionWidth,
										height : CONFIG.BigWorld.sectionHeight
									}),
									on : {
										touchstart : (e) => {
											e.stop();
										},
										tap : () => {
											
											if (isControlMode === true) {
												section.isTrigger = section.isTrigger !== true;
												delete section.isBlock;
											} else {
												if (section.isTrigger !== true) {
													section.isBlock = section.isBlock !== true;
												}
												delete section.isTrigger;
											}
											
											BigWorld.TileModel.update({
												id : tileData.id,
												sectionMap : tileData.sectionMap
											});
											
											showSections();
										}
									}
								}));
							});
						});
						
						sectionWrapper.append(SkyEngine.Line({
							startX : -CONFIG.BigWorld.sectionWidth,
							startY : 0,
							endX : CONFIG.BigWorld.sectionWidth,
							endY : 0,
							border : '1px solid #000'
						}));
						
						sectionWrapper.append(SkyEngine.Line({
							startX : 0,
							startY : -CONFIG.BigWorld.sectionHeight,
							endX : 0,
							endY : CONFIG.BigWorld.sectionHeight,
							border : '1px solid #000'
						}));
					};
					
					screenWrapper.append(DIV({
						c : [
							
						// 섹션 스크린
						screen = SkyEngine.SubScreen({
							style : {
								marginRight : 10,
								flt : 'left',
								backgroundColor : '#333',
								color : '#fff'
							},
							width : 400,
							height : 400,
							y : 100,
							c : [sectionWrapper = SkyEngine.Node(), previewWrapper = SkyEngine.Node()]
						}),
						
						// 섹션 툴
						DIV({
							style : {
								flt : 'left'
							},
							c : [
							// 섹션 회전 툴
							DIV({
								c : [
								// 아래쪽으로 회전
								A({
									style : {
										flt : 'left'
									},
									c : [IMG({
										src : BigWorld.R('tileeditor/down.png')
									}), '회전'],
									on : {
										tap : () => {
											
											direction = 'down';
											
											tileEditorStore.save({
												name : tileData.id,
												value : {
													direction : direction,
													selectedKindIndex : selectedKindIndex,
													selectedState : selectedState
												}
											});
											showSetting();
											showPreview();
										}
									}
								}),
								// 왼쪽으로 회전
								A({
									style : {
										marginLeft : 10,
										flt : 'left'
									},
									c : [IMG({
										src : BigWorld.R('tileeditor/left.png')
									}), '회전'],
									on : {
										tap : () => {
											
											direction = 'left';
											
											tileEditorStore.save({
												name : tileData.id,
												value : {
													direction : direction,
													selectedKindIndex : selectedKindIndex,
													selectedState : selectedState
												}
											});
											showSetting();
											showPreview();
										}
									}
								}),
								// 위쪽으로 회전
								A({
									style : {
										marginLeft : 10,
										flt : 'left'
									},
									c : [IMG({
										src : BigWorld.R('tileeditor/up.png')
									}), '회전'],
									on : {
										tap : () => {
											
											direction = 'up';
											
											tileEditorStore.save({
												name : tileData.id,
												value : {
													direction : direction,
													selectedKindIndex : selectedKindIndex,
													selectedState : selectedState
												}
											});
											showSetting();
											showPreview();
										}
									}
								}),
								// 오른쪽으로 회전
								A({
									style : {
										marginLeft : 10,
										flt : 'left'
									},
									c : [IMG({
										src : BigWorld.R('tileeditor/right.png')
									}), '회전'],
									on : {
										tap : () => {
											
											direction = 'right';
											
											tileEditorStore.save({
												name : tileData.id,
												value : {
													direction : direction,
													selectedKindIndex : selectedKindIndex,
													selectedState : selectedState
												}
											});
											showSetting();
											showPreview();
										}
									}
								}), CLEAR_BOTH()]
							}),
							
							// 기타 툴
							DIV({
								c : [UUI.BUTTON_H({
									style : {
										marginTop : 10,
										padding : 5,
										border : '1px solid #ccc',
										borderRadius : 3
									},
									icon : IMG({
										src : BigWorld.R('tileeditor/section/block.png')
									}),
									spacing : 10,
									title : '모든 섹션을 블록 섹션으로 변경',
									on : {
										tap : () => {
											
											SkyDesktop.Confirm({
												msg : '정말 모든 섹션을 블록 섹션으로 변경하시겠습니까?'
											}, () => {
												
												EACH(tileData.sectionMap, (sections, i) => {
													EACH(sections, (section, j) => {
														section.isBlock = true;
														delete section.isTrigger;
													});
												});
												
												BigWorld.TileModel.update({
													id : tileData.id,
													sectionMap : tileData.sectionMap
												});
												
												showSections();
											});
										}
									}
								}), UUI.BUTTON_H({
									style : {
										marginTop : 10,
										padding : 5,
										border : '1px solid #ccc',
										borderRadius : 3
									},
									icon : IMG({
										src : BigWorld.R('tileeditor/section/section.png')
									}),
									spacing : 10,
									title : '모든 섹션을 일반 섹션으로 변경',
									on : {
										tap : () => {
											
											SkyDesktop.Confirm({
												msg : '정말 모든 섹션을 일반 섹션으로 변경하시겠습니까?'
											}, () => {
												
												EACH(tileData.sectionMap, (sections, i) => {
													EACH(sections, (section, j) => {
														delete section.isBlock;
														delete section.isTrigger;
													});
												});
												
												BigWorld.TileModel.update({
													id : tileData.id,
													sectionMap : tileData.sectionMap
												});
												
												showSections();
											});
										}
									}
								}), UUI.BUTTON_H({
									style : {
										marginTop : 10,
										padding : 5,
										border : '1px solid #ccc',
										borderRadius : 3
									},
									icon : IMG({
										src : BigWorld.R('tileeditor/section/trigger.png')
									}),
									spacing : 10,
									title : '모든 섹션을 트리거 섹션으로 변경',
									on : {
										tap : () => {
											
											SkyDesktop.Confirm({
												msg : '정말 모든 섹션을 트리거 섹션으로 변경하시겠습니까?'
											}, () => {
												
												EACH(tileData.sectionMap, (sections, i) => {
													EACH(sections, (section, j) => {
														delete section.isBlock;
														section.isTrigger = true;
													});
												});
												
												BigWorld.TileModel.update({
													id : tileData.id,
													sectionMap : tileData.sectionMap
												});
												
												showSections();
											});
										}
									}
								})]
							}),
							
							// 섹션 툴 설명
							UL({
								style : {
									marginTop : 10,
									marginLeft : 20,
									listStyle : 'disc'
								},
								c : [LI({
									c : '섹션을 클릭하면 블록 섹션으로 변경됩니다.'
								}), LI({
									c : '컨트롤 키를 누른 상태로 섹션을 클릭하면 트리거 섹션으로 변경됩니다.'
								})]
							})]
						}),
						
						CLEAR_BOTH()]
					}));
					
					showSections();
				};
				
				// 미리보기를 출력합니다.
				let showPreview = () => {
					previewWrapper.empty();
					
					previewWrapper.append(BigWorld.Tile({
						tileData : tileData,
						kind : selectedKindIndex,
						state : selectedState,
						direction : direction
					}));
				};
				
				let showBasicSetting = () => {
					createSectionTool();
					showPreview();
					
					content.empty();
					
					// 기본 설정 폼
					let form;
					content.append(form = UUI.VALID_FORM({
						errorMsgs : {
							category : {
								size : (validParams) => {
									return '카테고리 ID는 ' + validParams.max + '글자 이하로 입력해주시기 바랍니다.';
								}
							},
							'name.ko' : {
								size : (validParams) => {
									return '이름은 ' + validParams.max + '글자 이하로 입력해주시기 바랍니다.';
								}
							}
						},
						errorMsgStyle : {
							marginTop : 5,
							color : 'red'
						},
						style : {
							backgroundColor : '#ccc',
							padding : 10,
							width : 300
						},
						c : [UUI.FULL_INPUT({
							name : 'category',
							placeholder : '카테고리 ID'
						}), UUI.FULL_INPUT({
							style : {
								marginTop : 10
							},
							name : 'name.ko',
							placeholder : '이름 (한국어)'
						}), UUI.FULL_SUBMIT({
							style : {
								marginTop : 10
							},
							value : '저장하기'
						})],
						on : {
							submit : (e, form) => {
								
								let data = form.getData();
								
								data.id = tileData.id;
								
								let loadingBar = SkyDesktop.LoadingBar('lime');
								
								BigWorld.TileModel.update(data, {
									notValid : (validErrors) => {
										loadingBar.done();
										
										form.showErrors(validErrors);
									},
									success : (savedData) => {
										loadingBar.done();
										
										SkyDesktop.Noti('저장하였습니다.');
										
										tileData = savedData;
									}
								});
							}
						}
					}));
					
					form.setData(tileData);
				};
				
				let showPartSetting = () => {
					createSectionTool();
					showPreview();
					
					let stateData = tileData.states[selectedState];
					
					content.empty();
					
					// 파트 추가 버튼
					content.append(UUI.BUTTON_H({
						style : {
							flt : 'left',
							padding : 5,
							border : '1px solid #ccc',
							borderRadius : 3
						},
						icon : IMG({
							src : BigWorld.R('tileeditor/part.png')
						}),
						spacing : 10,
						title : '파트 추가',
						on : {
							tap : () => {
								
								if (stateData.parts === undefined) {
									stateData.parts = [];
								}
								
								let partIndex = stateData.parts.length;
								
								stateData.parts.push({});
								
								addPart({}, partIndex);
								
								BigWorld.TileModel.update({
									id : tileData.id,
									states : tileData.states
								});
								showPreview();
							}
						}
					}));
					
					// 모든 파트 위치 1px 내리기
					content.append(UUI.BUTTON_H({
						style : {
							marginLeft : 10,
							flt : 'left',
							padding : 5,
							border : '1px solid #ccc',
							borderRadius : 3
						},
						icon : IMG({
							src : BigWorld.R('tileeditor/down.png')
						}),
						spacing : 10,
						title : '모든 파트 DOWN',
						on : {
							tap : () => {
								
								EACH(stateData.parts, (partData) => {
									if (partData.y !== undefined) {
										partData.y += 1;
									}
								});
								
								let loadingBar = SkyDesktop.LoadingBar('lime');
								
								BigWorld.TileModel.update({
									id : tileData.id,
									states : tileData.states
								}, () => {
									loadingBar.done();
									
									SkyDesktop.Noti('파트 이동 완료');
									
									showPartSetting();
								});
							}
						}
					}));
					
					// 모든 파트 위치 1px 왼쪽으로
					content.append(UUI.BUTTON_H({
						style : {
							marginLeft : 10,
							flt : 'left',
							padding : 5,
							border : '1px solid #ccc',
							borderRadius : 3
						},
						icon : IMG({
							src : BigWorld.R('tileeditor/left.png')
						}),
						spacing : 10,
						title : '모든 파트 LEFT',
						on : {
							tap : () => {
								
								EACH(stateData.parts, (partData) => {
									if (partData.x !== undefined) {
										partData.x -= 1;
									}
								});
								
								let loadingBar = SkyDesktop.LoadingBar('lime');
								
								BigWorld.TileModel.update({
									id : tileData.id,
									states : tileData.states
								}, () => {
									loadingBar.done();
									
									SkyDesktop.Noti('파트 이동 완료');
									
									showPartSetting();
								});
							}
						}
					}));
					
					// 모든 파트 위치 1px 올리기
					content.append(UUI.BUTTON_H({
						style : {
							marginLeft : 10,
							flt : 'left',
							padding : 5,
							border : '1px solid #ccc',
							borderRadius : 3
						},
						icon : IMG({
							src : BigWorld.R('tileeditor/up.png')
						}),
						spacing : 10,
						title : '모든 파트 UP',
						on : {
							tap : () => {
								
								EACH(stateData.parts, (partData) => {
									if (partData.y !== undefined) {
										partData.y -= 1;
									}
								});
								
								let loadingBar = SkyDesktop.LoadingBar('lime');
								
								BigWorld.TileModel.update({
									id : tileData.id,
									states : tileData.states
								}, () => {
									loadingBar.done();
									
									SkyDesktop.Noti('파트 이동 완료');
									
									showPartSetting();
								});
							}
						}
					}));
					
					// 모든 파트 위치 1px 오른쪽으로
					content.append(UUI.BUTTON_H({
						style : {
							marginLeft : 10,
							flt : 'left',
							padding : 5,
							border : '1px solid #ccc',
							borderRadius : 3
						},
						icon : IMG({
							src : BigWorld.R('tileeditor/right.png')
						}),
						spacing : 10,
						title : '모든 파트 RIGHT',
						on : {
							tap : () => {
								
								EACH(stateData.parts, (partData) => {
									if (partData.x !== undefined) {
										partData.x += 1;
									}
								});
								
								let loadingBar = SkyDesktop.LoadingBar('lime');
								
								BigWorld.TileModel.update({
									id : tileData.id,
									states : tileData.states
								}, () => {
									loadingBar.done();
									
									SkyDesktop.Noti('파트 이동 완료');
									
									showPartSetting();
								});
							}
						}
					}));
					
					content.append(CLEAR_BOTH());
					
					// 파트 목록
					let partList;
					content.append(partList = DIV());
					
					// 파트 추가
					let addPart = (partData, i) => {
						
						let frameImageId;
						
						if (partData.frames !== undefined) {
							let kindFrames = partData.frames[selectedKindIndex];
							
							if (kindFrames !== undefined && kindFrames !== TO_DELETE) {
								frameImageId = kindFrames[direction];
							}
						}
						
						let isReady = false;
						
						let form;
						let previewWrapper;
						partList.append(TABLE({
							style : {
								marginTop : 10
							},
							c : TR({
								c : [TD({
									style : {
										width : 250
									},
									c : form = FORM({
										style : {
											position : 'relative',
											backgroundColor : '#ccc',
											padding : 10,
											width : 230
										},
										c : [UUI.ICON_BUTTON({
											style : {
												position : 'absolute',
												right : -10,
												top : -10
											},
											icon : IMG({
												src : BigWorld.R('tileeditor/x.png')
											}),
											on : {
												tap : () => {
													
													stateData.parts.splice(i, 1);
													
													let loadingBar = SkyDesktop.LoadingBar('lime');
													
													BigWorld.TileModel.update({
														id : tileData.id,
														states : tileData.states
													}, () => {
														loadingBar.done();
														
														SkyDesktop.Noti('파트 제거 완료');
														
														showPartSetting();
													});
												}
											}
										}), UUI.FULL_INPUT({
											style : {
												flt : 'left',
												width : 100
											},
											name : 'name.ko',
											placeholder : '이름 (한국어)',
											on : {
												change : () => {
													if (isReady === true) {
														form.submit();
													}
												}
											}
										}), UUI.FULL_INPUT({
											style : {
												flt : 'right',
												width : 100
											},
											name : 'zIndex',
											placeholder : 'z-index',
											on : {
												change : () => {
													if (isReady === true) {
														form.submit();
													}
												}
											}
										}), UUI.FULL_INPUT({
											style : {
												marginTop : 10,
												flt : 'left',
												width : 100
											},
											name : 'frameCount',
											placeholder : '프레임 수',
											on : {
												change : () => {
													if (isReady === true) {
														form.submit();
													}
												}
											}
										}), UUI.FULL_INPUT({
											style : {
												marginTop : 10,
												flt : 'right',
												width : 100
											},
											name : 'fps',
											placeholder : 'FPS',
											on : {
												change : () => {
													if (isReady === true) {
														form.submit();
													}
												}
											}
										}), UUI.FULL_INPUT({
											style : {
												marginTop : 10,
												flt : 'left',
												width : 100
											},
											name : 'x',
											placeholder : 'X',
											on : {
												change : () => {
													if (isReady === true) {
														form.submit();
													}
												}
											}
										}), UUI.FULL_INPUT({
											style : {
												marginTop : 10,
												flt : 'right',
												width : 100
											},
											name : 'y',
											placeholder : 'Y',
											on : {
												change : () => {
													if (isReady === true) {
														form.submit();
													}
												}
											}
										}), CLEAR_BOTH(),
										
										DIV({
											style : {
												marginTop : 10
											},
											c : [
											// 파트 위치 1px 내리기
											UUI.ICON_BUTTON({
												icon : IMG({
													src : BigWorld.R('tileeditor/down.png')
												}),
												on : {
													tap : () => {
														
														let partData = stateData.parts[i];
														if (partData.y !== undefined) {
															partData.y += 1;
														}
														
														let loadingBar = SkyDesktop.LoadingBar('lime');
														
														BigWorld.TileModel.update({
															id : tileData.id,
															states : tileData.states
														}, (savedData, originData) => {
															loadingBar.done();
															
															SkyDesktop.Noti('파트 저장 완료');
															
															showPartSetting();
														});
													}
												}
											}),
											
											// 파트 위치 1px 왼쪽으로
											UUI.ICON_BUTTON({
												icon : IMG({
													src : BigWorld.R('tileeditor/left.png')
												}),
												on : {
													tap : () => {
														
														let partData = stateData.parts[i];
														if (partData.x !== undefined) {
															partData.x -= 1;
														}
														
														let loadingBar = SkyDesktop.LoadingBar('lime');
														
														BigWorld.TileModel.update({
															id : tileData.id,
															states : tileData.states
														}, (savedData, originData) => {
															loadingBar.done();
															
															SkyDesktop.Noti('파트 저장 완료');
															
															showPartSetting();
														});
													}
												}
											}),
											
											// 파트 위치 1px 올리기
											UUI.ICON_BUTTON({
												icon : IMG({
													src : BigWorld.R('tileeditor/up.png')
												}),
												on : {
													tap : () => {
														
														let partData = stateData.parts[i];
														if (partData.y !== undefined) {
															partData.y -= 1;
														}
														
														let loadingBar = SkyDesktop.LoadingBar('lime');
														
														BigWorld.TileModel.update({
															id : tileData.id,
															states : tileData.states
														}, (savedData, originData) => {
															loadingBar.done();
															
															SkyDesktop.Noti('파트 저장 완료');
															
															showPartSetting();
														});
													}
												}
											}),
											
											// 파트 위치 1px 오른쪽으로
											UUI.ICON_BUTTON({
												icon : IMG({
													src : BigWorld.R('tileeditor/right.png')
												}),
												on : {
													tap : () => {
														
														let partData = stateData.parts[i];
														if (partData.x !== undefined) {
															partData.x += 1;
														}
														
														let loadingBar = SkyDesktop.LoadingBar('lime');
														
														BigWorld.TileModel.update({
															id : tileData.id,
															states : tileData.states
														}, (savedData, originData) => {
															loadingBar.done();
															
															SkyDesktop.Noti('파트 저장 완료');
															
															showPartSetting();
														});
													}
												}
											})]
										}),
										
										UUI.FULL_UPLOAD_FORM({
											style : {
												marginTop : 10
											},
											box : BigWorld
										}, {
											overSizeFile : () => {
												alert('업로드 용량을 초과하였습니다. ' + CONFIG.maxUploadFileMB + 'MB 이하의 파일을 올려주세요.');
											},
											success : (fileData) => {
												
												if (fileData.type === 'image/png') {
													
													frameImageId = fileData.id;
													form.submit();
													
												} else {
													alert('PNG 파일만 등록 가능합니다.');
												}
											}
										}), UUI.FULL_SUBMIT({
											style : {
												marginTop : 10
											},
											value : '저장하기'
										})],
										on : {
											submit : (e, form) => {
												
												let data = form.getData();
												
												let partData = stateData.parts[i];
												partData.name = data.name;
												partData.zIndex = data.zIndex;
												partData.frameCount = data.frameCount;
												partData.fps = data.fps;
												partData.x = data.x;
												partData.y = data.y;
												
												if (partData.frames === undefined) {
													partData.frames = [];
												}
												
												if (partData.frames[selectedKindIndex] === undefined || partData.frames[selectedKindIndex] === TO_DELETE) {
													partData.frames[selectedKindIndex] = {};
												}
												
												let isToUpdatePartSetting = false;
												if (partData.frames[selectedKindIndex][direction] !== frameImageId) {
													isToUpdatePartSetting = true;
												}
												partData.frames[selectedKindIndex][direction] = frameImageId;
												
												let loadingBar = SkyDesktop.LoadingBar('lime');
												
												stateData.parts.sort((a, b) => {
													return a.zIndex - b.zIndex;
												});
												
												BigWorld.TileModel.update({
													id : tileData.id,
													states : tileData.states
												}, (savedData, originData) => {
													loadingBar.done();
													
													SkyDesktop.Noti('파트 저장 완료');
													
													if (savedData.zIndex !== originData.zIndex || isToUpdatePartSetting === true) {
														showPartSetting();
													} else {
														showPreview();
													}
												});
											}
										}
									})
								}), previewWrapper = TD({
									style : {
										paddingLeft : 10
									},
									c : frameImageId === undefined ? undefined : IMG({
										style : {
											border : '1px solid #ccc'
										},
										src : BigWorld.RF(frameImageId)
									})
								})]
							})
						}));
						
						form.setData(partData);
						isReady = true;
					};
					
					EACH(stateData.parts, addPart);
				};
				
				let showSetting = () => {
					if (selectedKindIndex !== undefined && selectedState !== undefined) {
						showPartSetting();
					} else {
						showBasicSetting();
					}
				};
				
				let screenWrapper;
				let content;
				wrapper = TABLE({
					style : {
						position : 'absolute',
						width : '100%',
						height : '100%'
					},
					c : [TR({
						c : TD({
							style : {
								height : 28
							},
							c : SkyDesktop.Toolbar({
								buttons : [SkyDesktop.ToolbarButton({
									icon : IMG({
										src : BigWorld.R('tileeditor/menu/edit.png')
									}),
									title : '기본 설정 화면',
									on : {
										tap : () => {
											showBasicSetting();
										}
									}
								}), SkyDesktop.ToolbarButton({
									icon : IMG({
										src : BigWorld.R('tileeditor/menu/kind.png')
									}),
									title : '종류 추가',
									on : {
										tap : () => {
											
											let form;
											
											SkyDesktop.Confirm({
												okButtonTitle : '추가',
												msg : form = FORM({
													c : [INPUT({
														style : {
															width : 222,
															padding : 8,
															border : '1px solid #999',
															borderRadius : 4
														},
														name : 'name.ko',
														placeholder : '종류 이름 (한국어)'
													})]
												})
											}, () => {
												
												let kinds = tileData.kinds;
												if (kinds === undefined) {
													kinds = [];
													tileData.kinds = kinds;
												}
												
												let kindData = form.getData();
												kinds.push(kindData);
												
												let loadingBar = SkyDesktop.LoadingBar('lime');
												
												let isValid = true;
												BigWorld.TileModel.update({
													id : tileData.id,
													kinds : kinds
												}, {
													notValid : (validErrors) => {
														loadingBar.done();
														
														SkyDesktop.Alert({
															msg : '검증에 실패하였습니다. 값에 오류가 없는지 확인해주시기 바랍니다.'
														});
														isValid = false;
													},
													success : () => {
														loadingBar.done();
														
														addKind(kindData);
													}
												});
												
												return isValid;
											});
										}
									}
								}), SkyDesktop.ToolbarButton({
									icon : IMG({
										src : BigWorld.R('tileeditor/menu/delete.png')
									}),
									title : '타일 제거',
									on : {
										tap : () => {
											
											SkyDesktop.Confirm({
												okButtonTitle : '제거',
												msg : '정말 제거하시겠습니까?'
											}, () => {
												
												let loadingBar = SkyDesktop.LoadingBar('lime');
												
												BigWorld.TileModel.remove(tileData.id, () => {
													isRemoved = true;
													close();
												});
											});
										}
									}
								})]
							})
						})
					}), TR({
						style : {
							height : '100%'
						},
						c : TD({
							c : SkyDesktop.HorizontalTabList({
								tabs : [SkyDesktop.Tab({
									size : 15,
									c : kindList = SkyDesktop.FileTree()
								}), SkyDesktop.Tab({
									size : 15,
									c : stateList = SkyDesktop.FileTree()
								}), SkyDesktop.Tab({
									size : 70,
									c : [screenWrapper = DIV({
										style : {
											padding : 10
										}
									}), content = DIV({
										style : {
											padding : 10,
											paddingTop : 0
										}
									})]
								})]
							})
						})
					})]
				}).appendTo(BODY);
				
				let selectedKindItem;
				let selectedStateItem;
				
				// 종류 추가
				let addKind = (kindData) => {
					
					let kindItem;
					kindList.append(kindItem = SkyDesktop.File({
						title : MSG(kindData.name) === undefined ? (FIND({
							array : tileData.kinds,
							value : kindData
						}) + 1) + '번째 종류' : MSG(kindData.name),
						on : {
							tap : (e, item) => {
								
								if (selectedKindItem !== undefined) {
									selectedKindItem.deselect();
								}
								
								if (item === selectedKindItem) {
									selectedKindIndex = undefined;
									selectedKindItem = undefined;
									
									tileEditorStore.remove(tileData.id);
									showSetting();
								}
								
								else {
									selectedKindIndex = FIND({
										array : tileData.kinds,
										value : kindData
									});
									selectedKindItem = item;
									item.select();
									
									tileEditorStore.save({
										name : tileData.id,
										value : {
											direction : direction,
											selectedKindIndex : selectedKindIndex,
											selectedState : selectedState
										}
									});
									showSetting();
								}
							},
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
												
												let form;
												
												SkyDesktop.Confirm({
													okButtonTitle : '저장',
													msg : form = FORM({
														c : [INPUT({
															style : {
																width : 222,
																padding : 8,
																border : '1px solid #999',
																borderRadius : 4
															},
															name : 'name.ko',
															placeholder : '종류 이름 (한국어)'
														})]
													})
												}, () => {
													
													let kinds = tileData.kinds;
													
													kindData.name = form.getData().name;
													
													let loadingBar = SkyDesktop.LoadingBar('lime');
													
													let isValid = true;
													BigWorld.TileModel.update({
														id : tileData.id,
														kinds : kinds
													}, {
														notValid : (validErrors) => {
															loadingBar.done();
															
															SkyDesktop.Alert({
																msg : '검증에 실패하였습니다. 값에 오류가 없는지 확인해주시기 바랍니다.'
															});
															isValid = false;
														},
														success : () => {
															loadingBar.done();
															
															kindItem.setTitle(MSG(kindData.name) === undefined ? (FIND({
																array : tileData.kinds,
																value : kindData
															}) + 1) + '번째 종류' : MSG(kindData.name));
														}
													});
													
													return isValid;
												});
												
												form.setData(kindData);
												
												contextMenu.remove();
											}
										}
									}), SkyDesktop.ContextMenuItem({
										title : '종류 삭제',
										icon : IMG({
											src : BigWorld.R('tileeditor/menu/delete.png')
										}),
										on : {
											tap : () => {
												
												SkyDesktop.Confirm({
													msg : '정말 삭제하시겠습니까?'
												}, () => {
													
													if (selectedKindItem !== undefined) {
														selectedKindItem.deselect();
														
														selectedKindIndex = undefined;
														selectedKindItem = undefined;
														
														tileEditorStore.remove(tileData.id);
														showSetting();
													}
													
													let kinds = tileData.kinds;
													let kindIndex = FIND({
														array : kinds,
														value : kindData
													});
													
													kinds.splice(kindIndex, 1);
													
													let states = tileData.states;
													
													// 상태의 파트에서 이 종류의 프레임들을 모두 삭제
													EACH(states, (stateData) => {
														EACH(stateData.parts, (part) => {
															if (part.frames !== undefined) {
																part.frames.splice(kindIndex, 1)
															}
														});
													});
													
													kindItem.remove();
													
													let loadingBar = SkyDesktop.LoadingBar('lime');
													
													BigWorld.TileModel.update({
														id : tileData.id,
														kinds : kinds,
														states : states
													}, () => {
														loadingBar.done();
													});
												});
												
												contextMenu.remove();
											}
										}
									})]
								});
								
								e.stop();
							}
						}
					}));
					
					if (FIND({
						array : tileData.kinds,
						value : kindData
					}) === selectedKindIndex) {
						kindItem.tap();
					}
				};
				
				EACH(tileData.kinds, addKind);
				
				// 상태 추가
				let addState = (stateData, state) => {
					
					let stateItem;
					stateList.addItem({
						key : state,
						item : stateItem = SkyDesktop.File({
							icon : IMG({
								src : BigWorld.R('tileeditor/state/' + state.toLowerCase() + '.png')
							}),
							title : state,
							on : {
								tap : (e, item) => {
									
									if (selectedStateItem !== undefined) {
										selectedStateItem.deselect();
									}
									
									if (item === selectedStateItem) {
										selectedState = undefined;
										selectedStateItem = undefined;
										
										tileEditorStore.remove(tileData.id);
										showSetting();
									}
									
									else {
										selectedState = state;
										selectedStateItem = item;
										item.select();
										
										tileEditorStore.save({
											name : tileData.id,
											value : {
												direction : direction,
												selectedKindIndex : selectedKindIndex,
												selectedState : selectedState
											}
										});
										showSetting();
									}
								}
							}
						})
					});
					
					if (state === selectedState) {
						stateItem.tap();
					}
				};
				
				EACH(tileData.states, addState);
				
				showSetting();
			});
		});
		
		// 새로고침 중단
		window.addEventListener('beforeunload', (e) => {
			if (isRemoved !== true) {
				e.returnValue = null;
				return null;
			}
		});

		inner.on('close', () => {
			
			if (wrapper !== undefined) {
				wrapper.remove();
			}
			
			keydownEvent.remove();
			keyupEvent.remove();
		});
	}
});

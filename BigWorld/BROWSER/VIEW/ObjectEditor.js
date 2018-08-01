BigWorld.ObjectEditor = CLASS({
	
	preset : () => {
		return VIEW;
	},
	
	init : (inner, self) => {
		
		TITLE('BigWorld Object Editor');
		
		let objectEditorStore = BigWorld.STORE('objectEditorStore');
		
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
			
			BigWorld.ObjectModel.get(params.objectId, (objectData) => {
				
				let direction;
				let selectedKindIndex;
				let selectedState;
				
				// 저장되어 있는 정보가 있다면
				let savedObjectInfo = objectEditorStore.get(objectData.id);
				if (savedObjectInfo !== undefined) {
					direction = savedObjectInfo.direction;
					selectedKindIndex = savedObjectInfo.selectedKindIndex;
					selectedState = savedObjectInfo.selectedState;
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
						
						EACH(objectData.sectionMap, (sections, i) => {
							EACH(sections, (section, j) => {
								
								let x, y;
								
								if (direction === 'down') {
									x = CONFIG.BigWorld.sectionWidth * (j - objectData.sectionLeftLevel);
									y = CONFIG.BigWorld.sectionHeight * (i - objectData.sectionUpLevel);
								}
								if (direction === 'left') {
									x = -CONFIG.BigWorld.sectionHeight * (i - objectData.sectionUpLevel);
									y = CONFIG.BigWorld.sectionWidth * (j - objectData.sectionLeftLevel);
								}
								if (direction === 'up') {
									x = -CONFIG.BigWorld.sectionWidth * (j - objectData.sectionLeftLevel);
									y = -CONFIG.BigWorld.sectionHeight * (i - objectData.sectionUpLevel);
								}
								if (direction === 'right') {
									x = CONFIG.BigWorld.sectionHeight * (i - objectData.sectionUpLevel);
									y = -CONFIG.BigWorld.sectionWidth * (j - objectData.sectionLeftLevel);
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
											
											BigWorld.ObjectModel.update({
												id : objectData.id,
												sectionMap : objectData.sectionMap
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
							
							// 섹션 크기 조절 툴
							DIV({
								c : [
								
								// 왼쪽으로 +
								A({
									c : IMG({
										src : BigWorld.R('objecteditor/arrow/lb.png')
									}),
									on : {
										tap : () => {
											
											objectData.sectionLeftLevel += 1;
											
											EACH(objectData.sectionMap, (sections) => {
												sections.unshift({
													z : 0
												});
											});
											
											BigWorld.ObjectModel.update({
												id : objectData.id,
												sectionLeftLevel : objectData.sectionLeftLevel,
												sectionMap : objectData.sectionMap
											});
											
											showSections();
										}
									}
								}),
								
								// 위쪽으로 +
								A({
									c : IMG({
										src : BigWorld.R('objecteditor/arrow/ub.png')
									}),
									on : {
										tap : () => {
											
											objectData.sectionUpLevel += 1;
											
											let sections = [];
											REPEAT(objectData.sectionLeftLevel + objectData.sectionRightLevel + 1, () => {
												sections.push({
													z : 0
												});
											});
											objectData.sectionMap.unshift(sections);
											
											BigWorld.ObjectModel.update({
												id : objectData.id,
												sectionUpLevel : objectData.sectionUpLevel,
												sectionMap : objectData.sectionMap
											});
											
											showSections();
										}
									}
								}),
								
								// 오른쪽으로 +
								A({
									c : IMG({
										src : BigWorld.R('objecteditor/arrow/rb.png')
									}),
									on : {
										tap : () => {
											
											objectData.sectionRightLevel += 1;
											
											EACH(objectData.sectionMap, (sections) => {
												sections.push({
													z : 0
												});
											});
											
											BigWorld.ObjectModel.update({
												id : objectData.id,
												sectionRightLevel : objectData.sectionRightLevel,
												sectionMap : objectData.sectionMap
											});
											
											showSections();
										}
									}
								}),
								
								// 아래쪽으로 +
								A({
									c : IMG({
										src : BigWorld.R('objecteditor/arrow/db.png')
									}),
									on : {
										tap : () => {
											
											objectData.sectionDownLevel += 1;
											
											let sections = [];
											REPEAT(objectData.sectionLeftLevel + objectData.sectionRightLevel + 1, () => {
												sections.push({
													z : 0
												});
											});
											objectData.sectionMap.push(sections);
											
											BigWorld.ObjectModel.update({
												id : objectData.id,
												sectionDownLevel : objectData.sectionDownLevel,
												sectionMap : objectData.sectionMap
											});
											
											showSections();
										}
									}
								}),
								
								// 왼쪽으로 -
								A({
									c : IMG({
										src : BigWorld.R('objecteditor/arrow/rr.png')
									}),
									on : {
										tap : () => {
											
											if (objectData.sectionLeftLevel >= 1) {
												objectData.sectionLeftLevel -= 1;
												
												EACH(objectData.sectionMap, (sections) => {
													sections.shift();
												});
												
												BigWorld.ObjectModel.update({
													id : objectData.id,
													sectionLeftLevel : objectData.sectionLeftLevel,
													sectionMap : objectData.sectionMap
												});
												
												showSections();
											}
										}
									}
								}),
								
								// 위쪽으로 -
								A({
									c : IMG({
										src : BigWorld.R('objecteditor/arrow/dr.png')
									}),
									on : {
										tap : () => {
											
											if (objectData.sectionUpLevel >= 1) {
												objectData.sectionUpLevel -= 1;
												
												objectData.sectionMap.shift();
												
												BigWorld.ObjectModel.update({
													id : objectData.id,
													sectionUpLevel : objectData.sectionUpLevel,
													sectionMap : objectData.sectionMap
												});
												
												showSections();
											}
										}
									}
								}),
								
								// 오른쪽으로 -
								A({
									c : IMG({
										src : BigWorld.R('objecteditor/arrow/lr.png')
									}),
									on : {
										tap : () => {
											
											if (objectData.sectionRightLevel >= 1) {
												objectData.sectionRightLevel -= 1;
												
												EACH(objectData.sectionMap, (sections) => {
													sections.pop();
												});
												
												BigWorld.ObjectModel.update({
													id : objectData.id,
													sectionRightLevel : objectData.sectionRightLevel,
													sectionMap : objectData.sectionMap
												});
												
												showSections();
											}
										}
									}
								}),
								
								// 아래쪽으로 -
								A({
									c : IMG({
										src : BigWorld.R('objecteditor/arrow/ur.png')
									}),
									on : {
										tap : () => {
											
											if (objectData.sectionDownLevel >= 1) {
												objectData.sectionDownLevel -= 1;
												
												objectData.sectionMap.pop();
												
												BigWorld.ObjectModel.update({
													id : objectData.id,
													sectionDownLevel : objectData.sectionDownLevel,
													sectionMap : objectData.sectionMap
												});
												
												showSections();
											}
										}
									}
								})]
							}),
							
							// 섹션 회전 툴
							DIV({
								c : [
								// 아래쪽으로 회전
								A({
									style : {
										flt : 'left'
									},
									c : [IMG({
										src : BigWorld.R('objecteditor/down.png')
									}), '회전'],
									on : {
										tap : () => {
											
											direction = 'down';
											
											objectEditorStore.save({
												name : objectData.id,
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
										src : BigWorld.R('objecteditor/left.png')
									}), '회전'],
									on : {
										tap : () => {
											
											direction = 'left';
											
											objectEditorStore.save({
												name : objectData.id,
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
										src : BigWorld.R('objecteditor/up.png')
									}), '회전'],
									on : {
										tap : () => {
											
											direction = 'up';
											
											objectEditorStore.save({
												name : objectData.id,
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
										src : BigWorld.R('objecteditor/right.png')
									}), '회전'],
									on : {
										tap : () => {
											
											direction = 'right';
											
											objectEditorStore.save({
												name : objectData.id,
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
										src : BigWorld.R('objecteditor/section/block.png')
									}),
									spacing : 10,
									title : '모든 섹션을 블록 섹션으로 변경',
									on : {
										tap : () => {
											
											SkyDesktop.Confirm({
												msg : '정말 모든 섹션을 블록 섹션으로 변경하시겠습니까?'
											}, () => {
												
												EACH(objectData.sectionMap, (sections, i) => {
													EACH(sections, (section, j) => {
														section.isBlock = true;
														delete section.isTrigger;
													});
												});
												
												BigWorld.ObjectModel.update({
													id : objectData.id,
													sectionMap : objectData.sectionMap
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
										src : BigWorld.R('objecteditor/section/section.png')
									}),
									spacing : 10,
									title : '모든 섹션을 일반 섹션으로 변경',
									on : {
										tap : () => {
											
											SkyDesktop.Confirm({
												msg : '정말 모든 섹션을 일반 섹션으로 변경하시겠습니까?'
											}, () => {
												
												EACH(objectData.sectionMap, (sections, i) => {
													EACH(sections, (section, j) => {
														delete section.isBlock;
														delete section.isTrigger;
													});
												});
												
												BigWorld.ObjectModel.update({
													id : objectData.id,
													sectionMap : objectData.sectionMap
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
										src : BigWorld.R('objecteditor/section/trigger.png')
									}),
									spacing : 10,
									title : '모든 섹션을 트리거 섹션으로 변경',
									on : {
										tap : () => {
											
											SkyDesktop.Confirm({
												msg : '정말 모든 섹션을 트리거 섹션으로 변경하시겠습니까?'
											}, () => {
												
												EACH(objectData.sectionMap, (sections, i) => {
													EACH(sections, (section, j) => {
														delete section.isBlock;
														section.isTrigger = true;
													});
												});
												
												BigWorld.ObjectModel.update({
													id : objectData.id,
													sectionMap : objectData.sectionMap
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
					
					previewWrapper.append(BigWorld.Object({
						objectData : objectData,
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
								
								data.id = objectData.id;
								
								let loadingBar = SkyDesktop.LoadingBar('lime');
								
								BigWorld.ObjectModel.update(data, {
									notValid : (validErrors) => {
										loadingBar.done();
										
										form.showErrors(validErrors);
									},
									success : (savedData) => {
										loadingBar.done();
										
										SkyDesktop.Noti('저장하였습니다.');
										
										objectData = savedData;
									}
								});
							}
						}
					}));
					
					form.setData(objectData);
				};
				
				let showPartSetting = () => {
					createSectionTool();
					showPreview();
					
					let stateData = objectData.states[selectedState];
					
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
							src : BigWorld.R('objecteditor/part.png')
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
								
								BigWorld.ObjectModel.update({
									id : objectData.id,
									states : objectData.states
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
							src : BigWorld.R('objecteditor/down.png')
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
								
								BigWorld.ObjectModel.update({
									id : objectData.id,
									states : objectData.states
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
							src : BigWorld.R('objecteditor/left.png')
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
								
								BigWorld.ObjectModel.update({
									id : objectData.id,
									states : objectData.states
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
							src : BigWorld.R('objecteditor/up.png')
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
								
								BigWorld.ObjectModel.update({
									id : objectData.id,
									states : objectData.states
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
							src : BigWorld.R('objecteditor/right.png')
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
								
								BigWorld.ObjectModel.update({
									id : objectData.id,
									states : objectData.states
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
												src : BigWorld.R('objecteditor/x.png')
											}),
											on : {
												tap : () => {
													
													stateData.parts.splice(i, 1);
													
													let loadingBar = SkyDesktop.LoadingBar('lime');
													
													BigWorld.ObjectModel.update({
														id : objectData.id,
														states : objectData.states
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
													src : BigWorld.R('objecteditor/down.png')
												}),
												on : {
													tap : () => {
														
														let partData = stateData.parts[i];
														if (partData.y !== undefined) {
															partData.y += 1;
														}
														
														let loadingBar = SkyDesktop.LoadingBar('lime');
														
														BigWorld.ObjectModel.update({
															id : objectData.id,
															states : objectData.states
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
													src : BigWorld.R('objecteditor/left.png')
												}),
												on : {
													tap : () => {
														
														let partData = stateData.parts[i];
														if (partData.x !== undefined) {
															partData.x -= 1;
														}
														
														let loadingBar = SkyDesktop.LoadingBar('lime');
														
														BigWorld.ObjectModel.update({
															id : objectData.id,
															states : objectData.states
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
													src : BigWorld.R('objecteditor/up.png')
												}),
												on : {
													tap : () => {
														
														let partData = stateData.parts[i];
														if (partData.y !== undefined) {
															partData.y -= 1;
														}
														
														let loadingBar = SkyDesktop.LoadingBar('lime');
														
														BigWorld.ObjectModel.update({
															id : objectData.id,
															states : objectData.states
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
													src : BigWorld.R('objecteditor/right.png')
												}),
												on : {
													tap : () => {
														
														let partData = stateData.parts[i];
														if (partData.x !== undefined) {
															partData.x += 1;
														}
														
														let loadingBar = SkyDesktop.LoadingBar('lime');
														
														BigWorld.ObjectModel.update({
															id : objectData.id,
															states : objectData.states
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
												
												BigWorld.ObjectModel.update({
													id : objectData.id,
													states : objectData.states
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
										src : BigWorld.R('objecteditor/menu/edit.png')
									}),
									title : '기본 설정 화면',
									on : {
										tap : () => {
											showBasicSetting();
										}
									}
								}), SkyDesktop.ToolbarButton({
									icon : IMG({
										src : BigWorld.R('objecteditor/menu/kind.png')
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
												
												let kinds = objectData.kinds;
												if (kinds === undefined) {
													kinds = [];
												}
												
												let kindData = form.getData();
												kinds.push(kindData);
												
												let loadingBar = SkyDesktop.LoadingBar('lime');
												
												let isValid = true;
												BigWorld.ObjectModel.update({
													id : objectData.id,
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
										src : BigWorld.R('objecteditor/menu/state.png')
									}),
									title : '상태 추가',
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
														name : 'id',
														placeholder : '상태 ID'
													}), INPUT({
														style : {
															marginTop : 10,
															width : 222,
															padding : 8,
															border : '1px solid #999',
															borderRadius : 4
														},
														name : 'name.ko',
														placeholder : '상태 이름 (한국어)'
													})]
												})
											}, () => {
												
												let stateData = form.getData();
												
												if (VALID.notEmpty(stateData.id) === true) {
													
													let states = objectData.states;
													if (states === undefined) {
														states = {};
													}
													
													let isValid = true;
													
													// 상태가 없어야만 생성, 아니면 오류
													if (states[stateData.id] === undefined) {
														states[stateData.id] = {};
														
														if (VALID.notEmpty(stateData.name) === true) {
															states[stateData.id].name = stateData.name;
														}
														
														let loadingBar = SkyDesktop.LoadingBar('lime');
														
														BigWorld.ObjectModel.update({
															id : objectData.id,
															states : states
														}, {
															notValid : () => {
																loadingBar.done();
																
																SkyDesktop.Alert({
																	msg : '검증에 실패하였습니다. 값에 오류가 없는지 확인해주시기 바랍니다.'
																});
																isValid = false;
															},
															success : () => {
																loadingBar.done();
																
																addState(stateData, stateData.id);
															}
														});
													}
													
													else {
														SkyDesktop.Alert({
															msg : '이미 입력하신 상태 ID에 해당하는 상태가 존재합니다. 다른 ID를 입력하거나, 상태를 지우고 다시 생성해주시기 바랍니다.'
														});
														isValid = false;
													}
													
													return isValid;
												}
											});
										}
									}
								}), SkyDesktop.ToolbarButton({
									icon : IMG({
										src : BigWorld.R('objecteditor/menu/delete.png')
									}),
									title : '객체 제거',
									on : {
										tap : () => {
											
											SkyDesktop.Confirm({
												okButtonTitle : '제거',
												msg : '정말 제거하시겠습니까?'
											}, () => {
												
												let loadingBar = SkyDesktop.LoadingBar('lime');
												
												BigWorld.ObjectModel.remove(objectData.id, () => {
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
							array : objectData.kinds,
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
									
									objectEditorStore.remove(objectData.id);
									showSetting();
								}
								
								else {
									selectedKindIndex = FIND({
										array : objectData.kinds,
										value : kindData
									});
									selectedKindItem = item;
									item.select();
									
									objectEditorStore.save({
										name : objectData.id,
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
											src : BigWorld.R('objecteditor/menu/edit.png')
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
													
													let kinds = objectData.kinds;
													
													kindData.name = form.getData().name;
													
													let loadingBar = SkyDesktop.LoadingBar('lime');
													
													let isValid = true;
													BigWorld.ObjectModel.update({
														id : objectData.id,
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
																array : objectData.kinds,
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
											src : BigWorld.R('objecteditor/menu/delete.png')
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
														
														objectEditorStore.remove(objectData.id);
														showSetting();
													}
													
													let kinds = objectData.kinds;
													let kindIndex = FIND({
														array : kinds,
														value : kindData
													});
													
													kinds.splice(kindIndex, 1);
													
													let states = objectData.states;
													
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
													
													BigWorld.ObjectModel.update({
														id : objectData.id,
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
						array : objectData.kinds,
						value : kindData
					}) === selectedKindIndex) {
						kindItem.tap();
					}
				};
				
				EACH(objectData.kinds, addKind);
				
				// 상태 추가
				let addState = (stateData, state) => {
					
					let stateItem;
					stateList.addItem({
						key : state,
						item : stateItem = SkyDesktop.File({
							title : state + (MSG(stateData.name) === undefined ? '' : ' (' + MSG(stateData.name) + ')'),
							on : {
								tap : (e, item) => {
									
									if (selectedStateItem !== undefined) {
										selectedStateItem.deselect();
									}
									
									if (item === selectedStateItem) {
										selectedState = undefined;
										selectedStateItem = undefined;
										
										objectEditorStore.remove(objectData.id);
										showSetting();
									}
									
									else {
										selectedState = state;
										selectedStateItem = item;
										item.select();
										
										objectEditorStore.save({
											name : objectData.id,
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
												src : BigWorld.R('objecteditor/menu/edit.png')
											}),
											on : {
												tap : () => {
													
													let originState = state;
													
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
																name : 'id',
																placeholder : '상태 ID'
															}), INPUT({
																style : {
																	marginTop : 10,
																	width : 222,
																	padding : 8,
																	border : '1px solid #999',
																	borderRadius : 4
																},
																name : 'name.ko',
																placeholder : '상태 이름 (한국어)'
															})]
														})
													}, () => {
														
														if (selectedStateItem !== undefined) {
															selectedStateItem.deselect();
															
															selectedState = undefined;
															selectedStateItem = undefined;
															
															objectEditorStore.remove(objectData.id);
															showSetting();
														}
														
														let stateData = form.getData();
														
														if (VALID.notEmpty(stateData.id) === true) {
															
															let states = objectData.states;
															
															let isValid = true;
															
															// 상태가 없어야만 생성, 아니면 오류
															if (stateData.id === originState || states[stateData.id] === undefined) {
																
																// 기존 상태 제거
																delete states[originState];
																stateList.removeItem(originState);
																
																states[stateData.id] = {};
																
																if (VALID.notEmpty(stateData.name) === true) {
																	states[stateData.id].name = stateData.name;
																}
																
																let loadingBar = SkyDesktop.LoadingBar('lime');
																
																BigWorld.ObjectModel.update({
																	id : objectData.id,
																	states : states
																}, {
																	notValid : () => {
																		loadingBar.done();
																		
																		SkyDesktop.Alert({
																			msg : '검증에 실패하였습니다. 값에 오류가 없는지 확인해주시기 바랍니다.'
																		});
																		isValid = false;
																	},
																	success : () => {
																		loadingBar.done();
																		
																		addState(stateData, stateData.id);
																	}
																});
															}
															
															else {
																SkyDesktop.Alert({
																	msg : '이미 입력하신 상태 ID에 해당하는 상태가 존재합니다. 다른 ID를 입력하거나, 상태를 지우고 다시 생성해주시기 바랍니다.'
																});
																isValid = false;
															}
															
															return isValid;
														}
													});
													
													stateData.id = state;
													form.setData(stateData);
													
													contextMenu.remove();
												}
											}
										}), SkyDesktop.ContextMenuItem({
											title : '상태 삭제',
											icon : IMG({
												src : BigWorld.R('objecteditor/menu/delete.png')
											}),
											on : {
												tap : () => {
													
													SkyDesktop.Confirm({
														msg : '정말 삭제하시겠습니까?'
													}, () => {
														
														if (selectedStateItem !== undefined) {
															selectedStateItem.deselect();
															
															selectedState = undefined;
															selectedStateItem = undefined;
															
															objectEditorStore.remove(objectData.id);
															showSetting();
														}
														
														let states = objectData.states;
														
														// 상태 제거
														delete states[state];
														stateList.removeItem(state);
														
														let loadingBar = SkyDesktop.LoadingBar('lime');
														
														BigWorld.ObjectModel.update({
															id : objectData.id,
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
						})
					});
					
					if (state === selectedState) {
						stateItem.tap();
					}
				};
				
				EACH(objectData.states, addState);
				
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

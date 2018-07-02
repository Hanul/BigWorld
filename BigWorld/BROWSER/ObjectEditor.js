BigWorld.ObjectEditor = CLASS({
	
	preset : () => {
		return VIEW;
	},
	
	init : (inner, self) => {
		
		TITLE('BigWorld Object Editor');
		
		let isControlMode;
		
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
				
				// 아래쪽을 바라보는게 기본입니다.
				let direction = 'down';
				
				let kindList;
				let stateList;
				
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
									width : CONFIG.BigWorld.sectionWidth,
									height : CONFIG.BigWorld.sectionHeight,
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
							c : sectionWrapper = SkyEngine.Node()
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
										src : BigWorld.R('objecteditor/section/down.png')
									}), '회전'],
									on : {
										tap : () => {
											direction = 'down';
											showSections();
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
										src : BigWorld.R('objecteditor/section/left.png')
									}), '회전'],
									on : {
										tap : () => {
											direction = 'left';
											showSections();
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
										src : BigWorld.R('objecteditor/section/up.png')
									}), '회전'],
									on : {
										tap : () => {
											direction = 'up';
											showSections();
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
										src : BigWorld.R('objecteditor/section/right.png')
									}), '회전'],
									on : {
										tap : () => {
											direction = 'right';
											showSections();
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
				
				let showBasicSetting = () => {
					createSectionTool();
					
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
						}), UUI.BUTTON({
							style : {
								marginTop : 10
							},
							title : '타겟 지정'
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
								
								BigWorld.ObjectModel.update(data, {
									notValid : form.showErrors,
									success : (savedData) => {
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
					
					content.empty();
					
					// 파트 추가 버튼
					
					// 파트 목록
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
								})]
							})
						})
					}), TR({
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
				
				let selectedKindIndex;
				let selectedState;
				
				let selectedKindItem;
				let selectedStateItem;
				
				let addKind = (kindData, i) => {
					
					kindList.append(SkyDesktop.File({
						title : MSG(kindData.name) === undefined ? (i + 1) + '번째 종류' : MSG(kindData.name),
						on : {
							tap : (e, item) => {
								
								if (selectedKindItem !== undefined) {
									selectedKindItem.deselect();
								}
								
								if (item === selectedKindItem) {
									selectedKindIndex = undefined;
									selectedKindItem = undefined;
									showBasicSetting();
								} else {
									selectedKindIndex = i;
									selectedKindItem = item;
									item.select();
									
									if (selectedState !== undefined) {
										showPartSetting();
									}
								}
							}
						}
					}));
				};
				
				EACH(objectData.kinds, addKind);
				
				let addState = (stateData, state) => {
					
					stateList.append(SkyDesktop.File({
						title : state + (MSG(stateData.name) === undefined ? '' : ' (' + MSG(stateData.name) + ')'),
						on : {
							tap : (e, item) => {
								
								if (selectedStateItem !== undefined) {
									selectedStateItem.deselect();
								}
								
								if (item === selectedStateItem) {
									selectedState = undefined;
									selectedStateItem = undefined;
									showBasicSetting();
								} else {
									selectedState = state;
									selectedStateItem = item;
									item.select();
									
									if (selectedKindIndex !== undefined) {
										showPartSetting();
									}
								}
							}
						}
					}));
				};
				
				EACH(objectData.states, addState);
				
				showBasicSetting();
			});
		});
		
		// 새로고침 중단
		window.addEventListener('beforeunload', (e) => {
			e.returnValue = null;
			return null;
		});

		inner.on('close', () => {
			wrapper.remove();
			
			keydownEvent.remove();
			keyupEvent.remove();
		});
	}
});

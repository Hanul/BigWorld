BigWorld.ObjectEditor = CLASS({
	
	preset : () => {
		return VIEW;
	},
	
	init : (inner, self) => {
		
		TITLE('BigWorld 오브젝트 에디터');
		
		let objectEditorStore = BigWorld.STORE('objectEditorStore');
		
		let nowObjectId;
		let nowObjectData;
		let nowKind;
		let nowState;
		
		let rootKind;
		let rootState;
		let selectedKind;
		let selectedState;
		
		let editorWrapper;
		let sectionEditor;
		
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
								src : BigWorld.R('objecteditor/menu/kind.png')
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
											
											nowObjectData.kinds.push(kindInfo);
											
											saveObject();
											
											addKind(nowObjectData.kinds.length - 1, kindInfo).tap();
											
											removePrompt();
										}
									});
								}
							}
						}),
						
						// 상태 추가 버튼
						SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('objecteditor/menu/state.png')
							}),
							title : '상태 추가',
							on : {
								tap : () => {
									
									BigWorld.ValidPrompt({
										title : '상태 추가',
										inputName : 'id',
										placeholder : '상태 ID (추후 변경 불가)',
										inputName2 : 'name.ko',
										placeholder2 : '상태 이름',
										errorMsgs : {
											'name.ko' : {
												size : (validParams) => {
													return '최대 ' + validParams.max + '글자입니다.';
												}
											}
										},
										okButtonTitle : '추가'
									}, (stateId, stateName, showErrors, removePrompt) => {
										
										if (stateId.trim() === '') {
											SkyDesktop.Alert({
												msg : '추가할 상태 ID를 입력해주세요.'
											});
										} else if (stateName.trim() === '') {
											SkyDesktop.Alert({
												msg : '추가할 상태 이름을 입력해주세요.'
											});
										} else {
											
											SkyDesktop.Confirm({
												msg : '상태는 추가 후 삭제가 불가능합니다. 또한 상태 ID는 추후 변경이 불가능합니다. 계속하시겠습니까?'
											}, () => {
												
												let stateInfo = {
													name : {
														ko : stateName
													},
													parts : []
												};
												
												nowObjectData.states[stateId] = stateInfo;
												
												saveObject();
												
												addState(stateId, stateInfo);
												
												removePrompt();
											});
										}
									});
								}
							}
						}),
						
						// 삭제 버튼
						SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('objecteditor/menu/remove.png')
							}),
							title : '오브젝트 삭제',
							on : {
								tap : () => {
									
									SkyDesktop.Confirm({
										msg : '오브젝트를 삭제하시겠습니까?',
										okButtonTitle : '삭제'
									}, () => {
										
										let loadingBar = SkyDesktop.LoadingBar('lime');
										
										BigWorld.ObjectModel.remove(nowObjectId, () => {
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
											src : BigWorld.R('objecteditor/menu/kind.png')
										}),
										title : '종류',
										isToNotSort : true,
										on : {
											
											// 열리고 닫혀도 아이콘의 변경이 없어야 합니다.
											open : (e, item) => {
												item.setIcon(IMG({
													src : BigWorld.R('objecteditor/menu/kind.png')
												}));
											},
											close : (e, item) => {
												item.setIcon(IMG({
													src : BigWorld.R('objecteditor/menu/kind.png')
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
											src : BigWorld.R('objecteditor/menu/state.png')
										}),
										title : '상태',
										isToNotSort : true,
										on : {
											
											// 열리고 닫혀도 아이콘의 변경이 없어야 합니다.
											open : (e, item) => {
												item.setIcon(IMG({
													src : BigWorld.R('objecteditor/menu/state.png')
												}));
											},
											close : (e, item) => {
												item.setIcon(IMG({
													src : BigWorld.R('objecteditor/menu/state.png')
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
		
		// 변경된 오브젝트 정보를 저장합니다.
		let saveObject = () => {
			
			if (nowObjectData !== undefined) {
				
				let loadingBar = SkyDesktop.LoadingBar('lime');
				
				// 변경된 오브젝트 데이터 저장
				BigWorld.ObjectModel.update(nowObjectData, {
					
					notValid : () => {
						loadingBar.done();
						
						SkyDesktop.Alert({
							msg : '오브젝트를 저장할 수 없습니다. 데이터를 확인해주시기 바랍니다.'
						});
					},
					
					success : () => {
						loadingBar.done();
						
						SkyDesktop.Noti('오브젝트를 저장했습니다.');
					}
				});
				
				// 미리보기 새로고침
				if (sectionEditor !== undefined) {
					sectionEditor.refresh();
				}
			}
		};
		
		// 현재 선택된 종류와 상태의 내용을 수정하는 에디터를 엽니다.
		let openEditor = () => {
			editorWrapper.empty();
			
			if (nowKind !== undefined && nowState !== undefined) {
				
				editorWrapper.append(H3({
					c : '선택된 종류: ' + MSG(nowObjectData.kinds[nowKind].name) + ' / 선택된 상태: ' + MSG(nowObjectData.states[nowState].name)
				}));
				
				// 섹션 편집
				editorWrapper.append(sectionEditor = BigWorld.SectionEditor({
					mode : 'object',
					
					style : {
						flt : 'left',
						marginTop : 10
					},
					
					sectionLevels : nowObjectData.sectionLevels,
					sectionMap : nowObjectData.sectionMap,
					touchAreaInfo : nowObjectData.touchArea,
					
					changeDirection : (direction) => {
						partsEditor.changeDirection(direction);
					},
					
					save : saveObject,
					
					refresh : (previewScreen, direction) => {
						
						previewScreen.append(BigWorld.Object({
							objectData : nowObjectData,
							kind : nowKind,
							state : nowState,
							direction : direction
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
					value : objectEditorStore.get('scale'),
					placeholder : '배율',
					on : {
						change : (e, input) => {
							
							let previewScale = REAL(input.getValue());
							
							objectEditorStore.save({
								name : 'scale',
								value : previewScale
							});
							
							sectionEditor.setScale(previewScale);
							sectionEditor.refresh();
						}
					}
				}));
				
				editorWrapper.append(CLEAR_BOTH());
				
				if (objectEditorStore.get('scale') != undefined) {
					sectionEditor.setScale(objectEditorStore.get('scale'));
				}
				
				let partsEditor;
				
				// 파트 편집
				editorWrapper.append(partsEditor = BigWorld.PartsEditor({
					style : {
						marginTop : 10
					},
					stateInfos : nowObjectData.states,
					state : nowState,
					kind : nowKind,
					save : saveObject
				}));
				
				partsEditor.changeDirection(sectionEditor.getDirection());
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
										src : BigWorld.R('objecteditor/menu/edit.png')
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
													
													saveObject();
													
													kind.setTitle(MSG(kindInfo.name));
													
													removePrompt();
												}
											});
											
											contextMenu.remove();
										}
									}
								}), nowObjectData.kinds.length <= 1 ? undefined : SkyDesktop.ContextMenuItem({
									title : '종류 삭제',
									icon : IMG({
										src : BigWorld.R('objecteditor/menu/remove.png')
									}),
									on : {
										tap : () => {
											
											SkyDesktop.Confirm({
												msg : '정말 종류를 삭제하시겠습니까?'
											}, () => {
												
												let kindIndex = FIND({
													array : nowObjectData.kinds,
													value : kindInfo
												});
												
												nowObjectData.kinds.splice(kindIndex, 1);
												
												// 상태의 파트에서 이 종류의 프레임들을 모두 삭제
												EACH(nowObjectData.states, (stateInfo) => {
													
													EACH(stateInfo.parts, (partInfo) => {
														
														partInfo.frames.splice(kindIndex, 1);
													});
												});
												
												saveObject();
												
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
		
		let addState = (stateId, stateInfo) => {
			
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
							openEditor();
						},
						
						// 오른 클릭 메뉴
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
											
											BigWorld.ValidPrompt({
												title : '상태 수정',
												inputName : 'name.ko',
												placeholder : '상태 이름',
												value : stateInfo.name.ko,
												errorMsgs : {
													'name.ko' : {
														size : (validParams) => {
															return '최대 ' + validParams.max + '글자입니다.';
														}
													}
												},
												okButtonTitle : '수정'
											}, (stateName, showErrors, removePrompt) => {
												
												if (stateName.trim() === '') {
													SkyDesktop.Alert({
														msg : '상태 이름을 입력해주세요.'
													});
												} else {
													
													stateInfo.name = {
														ko : stateName
													};
													
													saveObject();
													
													state.setTitle(MSG(stateInfo.name) + ' (' + stateId + ')');
													
													removePrompt();
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
			
			return state;
		};
		
		// root 종류와 상태는 처음부터 열려있습니다.
		rootKind.open();
		rootState.open();
		
		inner.on('paramsChange', (params) => {
			nowObjectId = params.objectId;
			
			// 초기화
			selectedKind = undefined;
			selectedState = undefined;
			rootKind.removeAllItems();
			rootState.removeAllItems();
			editorWrapper.empty();
			
			// 오브젝트 데이터를 불러옵니다.
			BigWorld.ObjectModel.get(nowObjectId, (objectData) => {
				nowObjectData = objectData;
				
				// 종류들 생성
				EACH(objectData.kinds, (kindInfo, i) => {
					addKind(i, kindInfo);
				});
				
				// 맨 처음에는 첫 종류를 열기
				rootKind.getItem(0).tap();
				
				// 상태들 생성
				EACH(objectData.states, (stateInfo, stateId) => {
					addState(stateId, stateInfo);
				});
				
				// 첫 상태를 열기
				EACH(objectData.states, (stateInfo, stateId) => {
					
					rootState.getItem(stateId).tap();
					
					return false;
				});
			});
		});
		
		// 틀 어긋난 부분 수정
		DELAY(0.2, () => {
			EVENT.fireAll('resize');
		});

		inner.on('close', () => {
			wrapper.remove();
		});
	}
});
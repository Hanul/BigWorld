BigWorld.ItemEditor = CLASS({
	
	preset : () => {
		return VIEW;
	},
	
	init : (inner, self) => {
		
		TITLE('BigWorld 아이템 에디터');
		
		let itemEditorStore = BigWorld.STORE('itemEditorStore');
		
		let nowItemId;
		let nowObjectData;
		let nowItemData;
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
						
						// 대상 오브젝트 버튼
						SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('itemeditor/menu/object.png')
							}),
							title : '대상 오브젝트',
							on : {
								tap : () => {
									BigWorld.GO_NEW_WIN('object/' + nowItemData.objectId);
								}
							}
						}),
						
						// 정보 수정 버튼
						SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('itemeditor/menu/edit.png')
							}),
							title : '정보 수정',
							on : {
								tap : () => {
									
									BigWorld.ValidPrompt({
										title : '아이템 정보 변경',
										inputName : 'objectPart',
										placeholder : '오브젝트 파트',
										value : nowItemData.objectPart,
										inputName2 : 'name.ko',
										placeholder2 : '아이템 이름',
										value2 : nowItemData.name.ko,
										errorMsgs : {
											'name.ko' : {
												size : (validParams) => {
													return '최대 ' + validParams.max + '글자입니다.';
												}
											}
										},
										okButtonTitle : '변경 완료'
									}, (objectPart, itemName, showErrors, removePrompt) => {
										
										if (objectPart.trim() === '') {
											SkyDesktop.Alert({
												msg : '오브젝트 파트를 입력해주세요.'
											});
										} else if (itemName.trim() === '') {
											SkyDesktop.Alert({
												msg : '변경할 아이템 이름을 입력해주세요.'
											});
										} else {
											
											nowItemData.objectPart = objectPart;
											nowItemData.name.ko = itemName;
											
											saveItem();
											
											removePrompt();
											
											openEditor();
										}
									});
								}
							}
						}),
						
						// 종류 추가 버튼
						SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('itemeditor/menu/kind.png')
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
											
											nowItemData.kinds.push(kindInfo);
											
											saveItem();
											
											addKind(nowItemData.kinds.length - 1, kindInfo).tap();
											
											removePrompt();
										}
									});
								}
							}
						}),
						
						// 삭제 버튼
						SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('itemeditor/menu/remove.png')
							}),
							title : '아이템 삭제',
							on : {
								tap : () => {
									
									SkyDesktop.Confirm({
										msg : '아이템을 삭제하시겠습니까?',
										okButtonTitle : '삭제'
									}, () => {
										
										let loadingBar = SkyDesktop.LoadingBar('lime');
										
										BigWorld.ItemModel.remove(nowItemId, () => {
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
											src : BigWorld.R('itemeditor/menu/kind.png')
										}),
										title : '종류',
										isToNotSort : true,
										on : {
											
											// 열리고 닫혀도 아이콘의 변경이 없어야 합니다.
											open : (e, item) => {
												item.setIcon(IMG({
													src : BigWorld.R('itemeditor/menu/kind.png')
												}));
											},
											close : (e, item) => {
												item.setIcon(IMG({
													src : BigWorld.R('itemeditor/menu/kind.png')
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
											src : BigWorld.R('itemeditor/menu/state.png')
										}),
										title : '상태',
										isToNotSort : true,
										on : {
											
											// 열리고 닫혀도 아이콘의 변경이 없어야 합니다.
											open : (e, item) => {
												item.setIcon(IMG({
													src : BigWorld.R('itemeditor/menu/state.png')
												}));
											},
											close : (e, item) => {
												item.setIcon(IMG({
													src : BigWorld.R('itemeditor/menu/state.png')
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
		
		// 변경된 아이템 정보를 저장합니다.
		let saveItem = () => {
			
			if (nowItemData !== undefined) {
				
				let loadingBar = SkyDesktop.LoadingBar('lime');
				
				// 변경된 아이템 데이터 저장
				BigWorld.ItemModel.update(nowItemData, {
					
					notValid : () => {
						loadingBar.done();
						
						SkyDesktop.Alert({
							msg : '아이템을 저장할 수 없습니다. 데이터를 확인해주시기 바랍니다.'
						});
					},
					
					success : () => {
						loadingBar.done();
						
						SkyDesktop.Noti('아이템을 저장했습니다.');
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
					c : MSG(nowItemData.name) + ' / 선택된 종류: ' + MSG(nowItemData.kinds[nowKind].name) + ' / 선택된 상태: ' + MSG(nowObjectData.states[nowState].name)
				}));
				
				// 섹션 편집
				editorWrapper.append(sectionEditor = BigWorld.SectionEditor({
					mode : 'item',
					
					style : {
						flt : 'left',
						marginTop : 10
					},
					
					changeDirection : (direction) => {
						partsEditor.changeDirection(direction);
					},
					
					save : saveItem,
					
					refresh : (previewScreen, direction) => {
						
						let object;
						previewScreen.append(object = BigWorld.Object({
							objectData : nowObjectData,
							kind : 0,
							state : nowState,
							direction : direction
						}));
						
						object.attachItem({
							id : nowItemData.id,
							item : BigWorld.Item({
								itemData : nowItemData,
								kind : nowKind
							})
						});
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
					value : itemEditorStore.get('scale'),
					placeholder : '배율',
					on : {
						change : (e, input) => {
							
							let previewScale = REAL(input.getValue());
							
							itemEditorStore.save({
								name : 'scale',
								value : previewScale
							});
							
							sectionEditor.setScale(previewScale);
							sectionEditor.refresh();
						}
					}
				}));
				
				editorWrapper.append(CLEAR_BOTH());
				
				if (itemEditorStore.get('scale') != undefined) {
					sectionEditor.setScale(itemEditorStore.get('scale'));
				}
				
				let partsEditor;
				
				// 파트 편집
				editorWrapper.append(partsEditor = BigWorld.PartsEditor({
					style : {
						marginTop : 10
					},
					stateInfos : nowItemData.states,
					state : nowState,
					kind : nowKind,
					save : saveItem
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
										src : BigWorld.R('itemeditor/menu/edit.png')
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
													
													saveItem();
													
													kind.setTitle(MSG(kindInfo.name));
													
													removePrompt();
												}
											});
											
											contextMenu.remove();
										}
									}
								}), nowItemData.kinds.length <= 1 ? undefined : SkyDesktop.ContextMenuItem({
									title : '종류 삭제',
									icon : IMG({
										src : BigWorld.R('itemeditor/menu/remove.png')
									}),
									on : {
										tap : () => {
											
											SkyDesktop.Confirm({
												msg : '정말 종류를 삭제하시겠습니까?'
											}, () => {
												
												let kindIndex = FIND({
													array : nowItemData.kinds,
													value : kindInfo
												});
												
												nowItemData.kinds.splice(kindIndex, 1);
												
												// 상태의 파트에서 이 종류의 프레임들을 모두 삭제
												EACH(nowItemData.states, (stateInfo) => {
													
													EACH(stateInfo.parts, (partInfo) => {
														
														partInfo.frames.splice(kindIndex, 1);
													});
												});
												
												saveItem();
												
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
		
		// root 종류와 상태는 처음부터 열려있습니다.
		rootKind.open();
		rootState.open();
		
		inner.on('paramsChange', (params) => {
			nowItemId = params.itemId;
			
			// 초기화
			selectedKind = undefined;
			selectedState = undefined;
			rootKind.removeAllItems();
			rootState.removeAllItems();
			editorWrapper.empty();
			
			// 아이템 데이터를 불러옵니다.
			BigWorld.ItemModel.get(nowItemId, (itemData) => {
				nowItemData = itemData;
				
				// 종류들 생성
				EACH(itemData.kinds, (kindInfo, i) => {
					addKind(i, kindInfo);
				});
				
				// 맨 처음에는 첫 종류를 열기
				rootKind.getItem(0).tap();
				
				BigWorld.ObjectModel.get(itemData.objectId, (objectData) => {
					nowObjectData = objectData;
					
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
										openEditor();
									}
								}
							})
						});
					});
					
					// 첫 상태를 열기
					EACH(objectData.states, (stateInfo, stateId) => {
						
						rootState.getItem(stateId).tap();
						
						return false;
					});
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
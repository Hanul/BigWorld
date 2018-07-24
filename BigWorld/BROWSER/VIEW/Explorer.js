BigWorld.Explorer = CLASS({
	
	preset : () => {
		return VIEW;
	},
	
	init : (inner, self) => {
		
		TITLE('BigWorld Explorer');
		
		let folderOpenedStore = BigWorld.STORE('folderOpenedStore');
		
		let nowFolderId;
		
		let subFoldersWatchingRoom;
		let stagesWatchingRoom;
		let objectsWatchingRoom;
		
		let rootFolderList;
		let selectedItem;
		
		let fileList;
		
		let draggingInfo;
		let startDraggingLeft;
		let startDraggingTop;
		let draggingShadow;
		
		let wrapper = TABLE({
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
								src : BigWorld.R('explorer/menu/folder.png')
							}),
							title : '새 폴더',
							on : {
								tap : () => {
									
									let form;
									let firstInput;
									SkyDesktop.Confirm({
										okButtonTitle : '생성',
										msg : form = UUI.VALID_FORM({
											errorMsgs : {
												name : {
													notEmpty : '저장할 폴더 이름을 입력해주세요.',
													size : (validParams) => {
														return '최대 ' + validParams.max + '글자입니다.';
													}
												}
											},
											errorMsgStyle : {
												color : 'red'
											},
											c : [firstInput = INPUT({
												style : {
													width : 222,
													padding : 8,
													border : '1px solid #999',
													borderRadius : 4
												},
												name : 'name',
												placeholder : '폴더 이름'
											})]
										})
									}, () => {
										
										let data = form.getData();
										data.folderId = nowFolderId;
										
										let isNotValid = false;
										
										BigWorld.FolderModel.create(data, {
											notValid : (validErrors) => {
												form.showErrors(validErrors);
												isNotValid = true;
											},
											success : (r) => {
												console.log(r);
											}
										});
										
										if (isNotValid === true) {
											return false;
										}
									});
									
									firstInput.focus();
								}
							}
						}), SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('explorer/menu/object.png')
							}),
							title : '새 오브젝트',
							on : {
								tap : () => {
									
									let form;
									let firstInput;
									SkyDesktop.Confirm({
										okButtonTitle : '생성',
										msg : form = UUI.VALID_FORM({
											errorMsgs : {
												name : {
													notEmpty : '저장할 오브젝트명을 입력해주세요.'
												},
												'name.ko' : {
													size : (validParams) => {
														return '최대 ' + validParams.max + '글자입니다.';
													}
												}
											},
											errorMsgStyle : {
												color : 'red'
											},
											c : [firstInput = INPUT({
												style : {
													width : 222,
													padding : 8,
													border : '1px solid #999',
													borderRadius : 4
												},
												name : 'name.ko',
												placeholder : '오브젝트명 (한국어)'
											})]
										})
									}, () => {
										
										let data = form.getData();
										data.folderId = nowFolderId;
										
										let isNotValid = false;
										
										BigWorld.ObjectModel.create(data, {
											notValid : (validErrors) => {
												form.showErrors(validErrors);
												isNotValid = true;
											},
											success : (r) => {
												console.log(r);
											}
										});
										
										if (isNotValid === true) {
											return false;
										}
									});
									
									firstInput.focus();
								}
							}
						}), SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('explorer/menu/stage.png')
							}),
							title : '새 스테이지',
							on : {
								tap : () => {
									
									let form;
									let firstInput;
									SkyDesktop.Confirm({
										okButtonTitle : '생성',
										msg : form = UUI.VALID_FORM({
											errorMsgs : {
												name : {
													notEmpty : '저장할 스테이지명을 입력해주세요.'
												},
												'name.ko' : {
													size : (validParams) => {
														return '최대 ' + validParams.max + '글자입니다.';
													}
												}
											},
											errorMsgStyle : {
												color : 'red'
											},
											c : [firstInput = INPUT({
												style : {
													width : 222,
													padding : 8,
													border : '1px solid #999',
													borderRadius : 4
												},
												name : 'name.ko',
												placeholder : '스테이지명 (한국어)'
											})]
										})
									}, () => {
										
										let data = form.getData();
										data.folderId = nowFolderId;
										
										let isNotValid = false;
										
										BigWorld.StageModel.create(data, {
											notValid : (validErrors) => {
												form.showErrors(validErrors);
												isNotValid = true;
											},
											success : (r) => {
												console.log(r);
											}
										});
										
										if (isNotValid === true) {
											return false;
										}
									});
									
									firstInput.focus();
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
							size : 23,
							c : SkyDesktop.FileTree({
								items : {
									'root' : rootFolderList = SkyDesktop.Folder({
										style : {
											cursor : 'pointer'
										},
										icon : IMG({
											src : BigWorld.R('explorer/drive.png')
										}),
										title : 'root',
										on : {
											open : (e, item) => {
												item.setIcon(IMG({
													src : BigWorld.R('explorer/drive.png')
												}));
											},
											close : (e, item) => {
												item.setIcon(IMG({
													src : BigWorld.R('explorer/drive.png')
												}));
											},
											tap : (e, item) => {
												
												if (selectedItem !== undefined) {
													selectedItem.deselect();
												}
												item.select();
												selectedItem = item;
												
												BigWorld.GO('explorer');
											},
											touchend : () => {
												
												// 루트 폴더로 이동
												if (draggingShadow !== undefined) {
													
													if (draggingInfo.type === 'folder') {
														
														let loadingBar = SkyDesktop.LoadingBar('lime');
														
														BigWorld.FolderModel.update({
															id : draggingInfo.id,
															folderId : TO_DELETE
														}, {
															notValid : (validErrors) => {
																loadingBar.done();
																
																SkyDesktop.Alert({
																	msg : '검증에 실패하였습니다. 값에 오류가 없는지 확인해주시기 바랍니다.'
																});
															},
															success : () => {
																loadingBar.done();
																
																loadFolders();
																
																if (nowFolderId === undefined) {
																	BigWorld.REFRESH('explorer');
																}
															}
														});
													}
													
													else if (draggingInfo.type === 'stage') {
														
														let loadingBar = SkyDesktop.LoadingBar('lime');
														
														BigWorld.StageModel.update({
															id : draggingInfo.id,
															folderId : TO_DELETE
														}, {
															notValid : (validErrors) => {
																loadingBar.done();
																
																SkyDesktop.Alert({
																	msg : '검증에 실패하였습니다. 값에 오류가 없는지 확인해주시기 바랍니다.'
																});
															},
															success : () => {
																loadingBar.done();
															}
														});
													}
													
													else if (draggingInfo.type === 'object') {
														
														let loadingBar = SkyDesktop.LoadingBar('lime');
														
														BigWorld.ObjectModel.update({
															id : draggingInfo.id,
															folderId : TO_DELETE
														}, {
															notValid : (validErrors) => {
																loadingBar.done();
																
																SkyDesktop.Alert({
																	msg : '검증에 실패하였습니다. 값에 오류가 없는지 확인해주시기 바랍니다.'
																});
															},
															success : () => {
																loadingBar.done();
															}
														});
													}
												}
											}
										}
									})
								}
							})
						}), fileList = SkyDesktop.Tab({
							size : 77
						})]
					})
				})
			})]
		}).appendTo(BODY);
		
		let loadFolders = (parentFolderList, folderId) => {
			
			let folderList = folderId === undefined ? rootFolderList : parentFolderList;
			
			// 폴더들을 불러옵니다.
			let foldersWatchingRoom = BigWorld.FolderModel.onNewAndFindWatching({
				properties : {
					folderId : folderId === undefined ? TO_DELETE : folderId
				},
				sort : {
					createTime : 1
				}
			}, (folderData, addUpdateHandler, addRemoveHandler, exit) => {
				
				let item;
				folderList.addItem({
					key : folderData.id,
					item : item = SkyDesktop.Folder({
						style : {
							cursor : 'pointer'
						},
						isOpened : folderOpenedStore.get(folderData.id),
						icon : IMG({
							src : BigWorld.R('explorer/folder.png')
						}),
						title : folderData.name,
						on : {
							open : (e, item) => {
								
								folderOpenedStore.save({
									name : folderData.id,
									value : true
								});
								
								loadFolders(item, folderData.id);
							},
							close : (e, item) => {
								
								folderOpenedStore.remove(folderData.id);
								
								item.removeAllItems();
							},
							tap : () => {
								
								if (selectedItem !== undefined) {
									selectedItem.deselect();
								}
								item.select();
								selectedItem = item;
								
								BigWorld.GO('explorer/' + folderData.id);
							},
							touchstart : (e) => {
								
								draggingInfo = {
									type : 'folder',
									id : folderData.id,
									title : folderData.name
								};
								
								startDraggingLeft = e.getLeft();
								startDraggingTop = e.getTop();
							},
							touchend : () => {
								
								// 이 폴더로 이동
								if (draggingShadow !== undefined) {
									
									if (draggingInfo.type === 'folder') {
										
										let loadingBar = SkyDesktop.LoadingBar('lime');
										
										BigWorld.FolderModel.update({
											id : draggingInfo.id,
											folderId : folderData.id
										}, {
											notValid : (validErrors) => {
												loadingBar.done();
												
												SkyDesktop.Alert({
													msg : '검증에 실패하였습니다. 값에 오류가 없는지 확인해주시기 바랍니다.'
												});
											},
											success : () => {
												loadingBar.done();
												
												loadFolders(item, folderData.id);
												
												if (nowFolderId === folderData.id) {
													BigWorld.REFRESH('explorer/' + folderData.id);
												}
											}
										});
									}
									
									else if (draggingInfo.type === 'stage') {
										
										let loadingBar = SkyDesktop.LoadingBar('lime');
										
										BigWorld.StageModel.update({
											id : draggingInfo.id,
											folderId : folderData.id
										}, {
											notValid : (validErrors) => {
												loadingBar.done();
												
												SkyDesktop.Alert({
													msg : '검증에 실패하였습니다. 값에 오류가 없는지 확인해주시기 바랍니다.'
												});
											},
											success : () => {
												loadingBar.done();
											}
										});
									}
									
									else if (draggingInfo.type === 'object') {
										
										let loadingBar = SkyDesktop.LoadingBar('lime');
										
										BigWorld.ObjectModel.update({
											id : draggingInfo.id,
											folderId : folderData.id
										}, {
											notValid : (validErrors) => {
												loadingBar.done();
												
												SkyDesktop.Alert({
													msg : '검증에 실패하였습니다. 값에 오류가 없는지 확인해주시기 바랍니다.'
												});
											},
											success : () => {
												loadingBar.done();
											}
										});
									}
								}
							},
							contextmenu : (e) => {
								
								let contextMenu = SkyDesktop.ContextMenu({
									e : e,
									c : [SkyDesktop.ContextMenuItem({
										title : '이름 변경',
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
															name : 'name',
															placeholder : '폴더 이름'
														})]
													})
												}, () => {
													
													let loadingBar = SkyDesktop.LoadingBar('lime');
													
													let isValid = true;
													BigWorld.FolderModel.update({
														id : folderData.id,
														name : form.getData().name
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
														}
													});
													
													return isValid;
												});
												
												form.setData(folderData);
												
												contextMenu.remove();
											}
										}
									}), SkyDesktop.ContextMenuItem({
										title : '삭제',
										icon : IMG({
											src : BigWorld.R('objecteditor/menu/delete.png')
										}),
										on : {
											tap : () => {
												
												SkyDesktop.Confirm({
													msg : '정말 삭제하시겠습니까?'
												}, () => {
													
													let loadingBar = SkyDesktop.LoadingBar('lime');
													
													BigWorld.FolderModel.remove(folderData.id, () => {
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
				
				if (folderData.id === nowFolderId) {
					
					if (selectedItem !== undefined) {
						selectedItem.deselect();
					}
					item.select();
					selectedItem = item;
				}
				
				addUpdateHandler((newFolderData) => {
					if (newFolderData.folderId !== folderId) {
						exit();
						item.remove();
					} else {
						item.setTitle(newFolderData.name);
					}
				});
				
				addRemoveHandler(() => {
					folderList.removeItem(folderData.id);
				});
			});
			
			folderList.on('remove', () => {
				foldersWatchingRoom.exit();
				foldersWatchingRoom = undefined;
			});
		};
		
		rootFolderList.open();
		loadFolders();
		
		inner.on('paramsChange', (params) => {
			
			nowFolderId = params.folderId;
			
			if (nowFolderId === undefined) {
				
				if (selectedItem !== undefined) {
					selectedItem.deselect();
				}
				rootFolderList.select();
				selectedItem = rootFolderList;
			}
			
			else {
				
				// 폴더 목록을 살펴보며 현재 폴더를 선택
				let selectFolder = (folderList) => {
					
					let item = folderList.getItem(nowFolderId);
					
					if (item !== undefined) {
						
						if (selectedItem !== undefined) {
							selectedItem.deselect();
						}
						item.select();
						selectedItem = item;
					}
					
					else {
						EACH(folderList.getItems(), selectFolder);
					}
				};
				
				selectFolder(rootFolderList);
			}
			
			if (subFoldersWatchingRoom !== undefined) {
				subFoldersWatchingRoom.exit();
				subFoldersWatchingRoom = undefined;
			}
			
			if (stagesWatchingRoom !== undefined) {
				stagesWatchingRoom.exit();
				stagesWatchingRoom = undefined;
			}
			
			if (objectsWatchingRoom !== undefined) {
				objectsWatchingRoom.exit();
				objectsWatchingRoom = undefined;
			}
			
			fileList.empty();
			
			NEXT([
			(next) => {
				
				// 폴더들을 불러옵니다.
				subFoldersWatchingRoom = BigWorld.FolderModel.onNewAndFindWatching({
					properties : {
						folderId : nowFolderId === undefined ? TO_DELETE : nowFolderId
					},
					sort : {
						createTime : 1
					}
				}, {
					handler : (folderData, addUpdateHandler, addRemoveHandler, exit) => {
						
						let item;
						fileList.append(item = UUI.BUTTON({
							style : {
								flt : 'left',
								padding : 10
							},
							icon : IMG({
								src : BigWorld.R('explorer/factor/folder.png'),
								on : {
									touchstart : (e) => {
										e.stopDefault();
									}
								}
							}),
							title : folderData.name,
							on : {
								tap : () => {
									BigWorld.GO('explorer/' + folderData.id);
								},
								touchstart : (e) => {
									
									draggingInfo = {
										type : 'folder',
										id : folderData.id,
										title : folderData.name
									};
									
									startDraggingLeft = e.getLeft();
									startDraggingTop = e.getTop();
								},
								touchend : () => {
									
									// 이 폴더로 이동
									if (draggingShadow !== undefined) {
										
										if (draggingInfo.type === 'folder') {
											
											let loadingBar = SkyDesktop.LoadingBar('lime');
											
											BigWorld.FolderModel.update({
												id : draggingInfo.id,
												folderId : folderData.id
											}, {
												notValid : (validErrors) => {
													loadingBar.done();
													
													SkyDesktop.Alert({
														msg : '검증에 실패하였습니다. 값에 오류가 없는지 확인해주시기 바랍니다.'
													});
												},
												success : () => {
													loadingBar.done();
												}
											});
										}
										
										else if (draggingInfo.type === 'stage') {
											
											let loadingBar = SkyDesktop.LoadingBar('lime');
											
											BigWorld.StageModel.update({
												id : draggingInfo.id,
												folderId : folderData.id
											}, {
												notValid : (validErrors) => {
													loadingBar.done();
													
													SkyDesktop.Alert({
														msg : '검증에 실패하였습니다. 값에 오류가 없는지 확인해주시기 바랍니다.'
													});
												},
												success : () => {
													loadingBar.done();
												}
											});
										}
										
										else if (draggingInfo.type === 'object') {
											
											let loadingBar = SkyDesktop.LoadingBar('lime');
											
											BigWorld.ObjectModel.update({
												id : draggingInfo.id,
												folderId : folderData.id
											}, {
												notValid : (validErrors) => {
													loadingBar.done();
													
													SkyDesktop.Alert({
														msg : '검증에 실패하였습니다. 값에 오류가 없는지 확인해주시기 바랍니다.'
													});
												},
												success : () => {
													loadingBar.done();
												}
											});
										}
									}
								},
								contextmenu : (e) => {
									
									let contextMenu = SkyDesktop.ContextMenu({
										e : e,
										c : [SkyDesktop.ContextMenuItem({
											title : '이름 변경',
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
																name : 'name',
																placeholder : '폴더 이름'
															})]
														})
													}, () => {
														
														let loadingBar = SkyDesktop.LoadingBar('lime');
														
														let isValid = true;
														BigWorld.FolderModel.update({
															id : folderData.id,
															name : form.getData().name
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
															}
														});
														
														return isValid;
													});
													
													form.setData(folderData);
													
													contextMenu.remove();
												}
											}
										}), SkyDesktop.ContextMenuItem({
											title : '삭제',
											icon : IMG({
												src : BigWorld.R('objecteditor/menu/delete.png')
											}),
											on : {
												tap : () => {
													
													SkyDesktop.Confirm({
														msg : '정말 삭제하시겠습니까?'
													}, () => {
														
														let loadingBar = SkyDesktop.LoadingBar('lime');
														
														BigWorld.FolderModel.remove(folderData.id, () => {
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
						
						addUpdateHandler((newFolderData) => {
							if (newFolderData.folderId !== nowFolderId) {
								exit();
								item.remove();
							} else {
								item.setTitle(newFolderData.name);
							}
						});
						
						addRemoveHandler(() => {
							item.remove();
						});
					},
					success : next
				});
			},
			
			(next) => {
				return () => {
					
					// 스테이지들을 불러옵니다.
					stagesWatchingRoom = BigWorld.StageModel.onNewAndFindWatching({
						properties : {
							folderId : nowFolderId === undefined ? TO_DELETE : nowFolderId
						},
						sort : {
							createTime : 1
						}
					}, {
						handler : (stageData, addUpdateHandler, addRemoveHandler) => {
							
							let item;
							fileList.append(item = UUI.BUTTON({
								style : {
									flt : 'left',
									padding : 10
								},
								icon : IMG({
									src : BigWorld.R('explorer/factor/stage.png'),
									on : {
										touchstart : (e) => {
											e.stopDefault();
										}
									}
								}),
								title : MSG(stageData.name),
								href : BigWorld.HREF('stage/' + stageData.id),
								target : '_blank',
								on : {
									touchstart : (e) => {
										
										draggingInfo = {
											type : 'stage',
											id : stageData.id,
											title : MSG(stageData.name)
										};
										
										startDraggingLeft = e.getLeft();
										startDraggingTop = e.getTop();
									},
									contextmenu : (e) => {
										
										let contextMenu = SkyDesktop.ContextMenu({
											e : e,
											c : [SkyDesktop.ContextMenuItem({
												title : '이름 변경',
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
																	placeholder : '스테이지명 (한국어)'
																})]
															})
														}, () => {
															
															let loadingBar = SkyDesktop.LoadingBar('lime');
															
															let isValid = true;
															BigWorld.StageModel.update({
																id : stageData.id,
																name : form.getData().name
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
																}
															});
															
															return isValid;
														});
														
														form.setData(stageData);
														
														contextMenu.remove();
													}
												}
											}), SkyDesktop.ContextMenuItem({
												title : '삭제',
												icon : IMG({
													src : BigWorld.R('objecteditor/menu/delete.png')
												}),
												on : {
													tap : () => {
														
														SkyDesktop.Confirm({
															msg : '정말 삭제하시겠습니까?'
														}, () => {
															
															let loadingBar = SkyDesktop.LoadingBar('lime');
															
															BigWorld.StageModel.remove(stageData.id, () => {
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
							
							addUpdateHandler((newStageData) => {
								item.setTitle(MSG(newStageData.name));
							});
							
							addRemoveHandler(() => {
								item.remove();
							});
						},
						success : next
					});
				};
			},
			
			() => {
				return () => {
					
					// 객체들을 불러옵니다.
					objectsWatchingRoom = BigWorld.ObjectModel.onNewAndFindWatching({
						properties : {
							folderId : nowFolderId === undefined ? TO_DELETE : nowFolderId
						},
						sort : {
							createTime : 1
						}
					}, (objectData, addUpdateHandler, addRemoveHandler) => {
						
						let item;
						fileList.append(item = UUI.BUTTON({
							style : {
								flt : 'left',
								padding : 10
							},
							icon : IMG({
								src : BigWorld.R('explorer/factor/object.png'),
								on : {
									touchstart : (e) => {
										e.stopDefault();
									}
								}
							}),
							title : MSG(objectData.name),
							href : BigWorld.HREF('object/' + objectData.id),
							target : '_blank',
							on : {
								touchstart : (e) => {
									
									draggingInfo = {
										type : 'object',
										id : objectData.id,
										title : MSG(objectData.name)
									};
									
									startDraggingLeft = e.getLeft();
									startDraggingTop = e.getTop();
								},
								contextmenu : (e) => {
									
									let contextMenu = SkyDesktop.ContextMenu({
										e : e,
										c : [SkyDesktop.ContextMenuItem({
											title : '이름 변경',
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
																placeholder : '오브젝트명 (한국어)'
															})]
														})
													}, () => {
														
														let loadingBar = SkyDesktop.LoadingBar('lime');
														
														let isValid = true;
														BigWorld.ObjectModel.update({
															id : objectData.id,
															name : form.getData().name
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
															}
														});
														
														return isValid;
													});
													
													form.setData(objectData);
													
													contextMenu.remove();
												}
											}
										}), SkyDesktop.ContextMenuItem({
											title : '삭제',
											icon : IMG({
												src : BigWorld.R('objecteditor/menu/delete.png')
											}),
											on : {
												tap : () => {
													
													SkyDesktop.Confirm({
														msg : '정말 삭제하시겠습니까?'
													}, () => {
														
														let loadingBar = SkyDesktop.LoadingBar('lime');
														
														BigWorld.ObjectModel.remove(objectData.id, () => {
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
						
						addUpdateHandler((newObjectData) => {
							item.setTitle(MSG(newObjectData.name));
						});
						
						addRemoveHandler(() => {
							item.remove();
						});
					});
				};
			}]);
		});
		
		let touchmoveEvent = EVENT('touchmove', (e) => {
			
			if (draggingShadow === undefined) {
				
				if (
				draggingInfo !== undefined && (
					Math.abs(startDraggingLeft - e.getLeft()) > 5 ||
					Math.abs(startDraggingTop - e.getTop()) > 5)
				) {
					draggingShadow = DIV({
						style : {
							position : 'fixed',
							left : e.getLeft() + 10,
							top : e.getTop() + 10,
							color : '#000'
						},
						c : draggingInfo.title
					}).appendTo(BODY);
				}
			}
			
			else {
				draggingShadow.addStyle({
					left : e.getLeft() + 10,
					top : e.getTop() + 10
				});
			}
		});
		
		let touchendEvent = EVENT('touchend', () => {
			if (draggingInfo !== undefined) {
				draggingInfo = undefined;
			}
			if (draggingShadow !== undefined) {
				draggingShadow.remove();
				draggingShadow = undefined;
			}
		});

		inner.on('close', () => {
			wrapper.remove();
			
			if (subFoldersWatchingRoom !== undefined) {
				subFoldersWatchingRoom.exit();
				subFoldersWatchingRoom = undefined;
			}
			
			if (stagesWatchingRoom !== undefined) {
				stagesWatchingRoom.exit();
				stagesWatchingRoom = undefined;
			}
			
			if (objectsWatchingRoom !== undefined) {
				objectsWatchingRoom.exit();
				objectsWatchingRoom = undefined;
			}
			
			touchmoveEvent.remove();
			touchmoveEvent = undefined;
			
			touchendEvent.remove();
			touchendEvent = undefined;
		});
	}
});
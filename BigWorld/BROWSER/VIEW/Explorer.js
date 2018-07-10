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
			}, (folderData, addUpdateHandler, addRemoveHandler) => {
				
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
					item.setTitle(MSG(newFolderData.name));
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
					handler : (folderData, addUpdateHandler, addRemoveHandler) => {
						
						let item;
						fileList.append(item = UUI.BUTTON({
							style : {
								flt : 'left',
								padding : 10
							},
							icon : IMG({
								src : BigWorld.R('explorer/factor/folder.png')
							}),
							title : folderData.name,
							on : {
								tap : () => {
									BigWorld.GO('explorer/' + folderData.id);
								}
							}
						}));
						
						addUpdateHandler((newFolderData) => {
							item.setTitle(MSG(newFolderData.name));
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
									src : BigWorld.R('explorer/factor/stage.png')
								}),
								title : MSG(stageData.name),
								href : BigWorld.HREF('stage/' + stageData.id),
								target : '_blank'
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
								src : BigWorld.R('explorer/factor/object.png')
							}),
							title : MSG(objectData.name),
							href : BigWorld.HREF('object/' + objectData.id),
							target : '_blank'
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
		});
	}
});

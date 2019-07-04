BigWorld.Explorer = CLASS({
	
	preset : () => {
		return VIEW;
	},
	
	init : (inner, self) => {
		
		TITLE('BigWorld 탐색기');
		
		// 폴더가 열려있는지 기록을 저장하는 스토어
		let folderOpenedStore = BigWorld.STORE('folderOpenedStore');
		
		let nowFolderId;
		
		let rootFolder;
		let selectedFolder;
		let elementList;
		
		let exitElementsWatchingRooms = [];
		
		let draggingElement;
		let draggingElementInfo;
		
		// 특정 폴더의 하위 폴더들을 불러옵니다.
		let loadSubFolders = (parentFolder, parentFolderId) => {
			
			// 하위 폴더들을 불러옵니다.
			let exitFoldersWatchingRoom = BigWorld.FolderModel.onNewAndFindWatching({
				properties : {
					folderId : parentFolderId
				},
				sort : {
					createTime : 1
				}
			}, {
				handler : (subFolderData, addUpdateHandler, addRemoveHandler) => {
					
					let subFolder;
					
					parentFolder.addItem({
						key : subFolderData.id,
						item : subFolder = SkyDesktop.Folder({
							style : {
								cursor : 'pointer'
							},
							isOpened : folderOpenedStore.get(subFolderData.id),
							title : subFolderData.name,
							on : {
								
								// 폴더를 열면 하위 폴더들을 불러옵니다.
								open : () => {
									
									folderOpenedStore.save({
										name : subFolderData.id,
										value : true
									});
									
									loadSubFolders(subFolder, subFolderData.id);
								},
								
								close : () => {
									folderOpenedStore.remove(subFolderData.id);
								},
								
								// 폴더를 선택하면 해당 폴더의 내용을 불러옵니다.
								tap : () => {
									
									if (selectedFolder !== undefined) {
										selectedFolder.deselect();
									}
									
									subFolder.select();
									selectedFolder = subFolder;
									
									BigWorld.GO('folder/' + subFolderData.id);
								},
								
								// 드래그를 시작합니다.
								touchstart : (e) => {
									
									draggingElementInfo = {
										type : 'folder',
										id : subFolderData.id,
										name : subFolderData.name,
										startLeft : e.getLeft(),
										startTop : e.getTop()
									};
								},
								
								// 드래그중인 요소를 이 폴더로 옮깁니다.
								touchend : () => {
									if (draggingElementInfo !== undefined && draggingElementInfo.id !== subFolderData.id) {
										moveElement(draggingElementInfo.type, draggingElementInfo.id, subFolderData.id);
									}
								},
								
								// 컨텍스트 메뉴를 엽니다.
								contextmenu : (e) => {
									openFolderContexteMenu(e, subFolderData);
								}
							}
						})
					});
					
					// 현재 선택된 폴더인 경우
					if (selectedFolder === undefined && subFolderData.id === nowFolderId) {
						subFolder.select();
						selectedFolder = subFolder;
					}
				}
			});
			
			let closeParentFolderHandler;
			parentFolder.on('close', closeParentFolderHandler = () => {
				
				exitFoldersWatchingRoom();
				
				parentFolder.removeAllItems();
				parentFolder.off('close', closeParentFolderHandler);
			});
		};
		
		// 특정 요소를 다른 폴더로 옮깁니다.
		let moveElement = (type, elementId, folderId) => {
			
			let loadingBar = SkyDesktop.LoadingBar('lime');
			
			// 폴더 이동
			if (type === 'folder') {
				BigWorld.FolderModel.update({
					id : elementId,
					folderId : folderId
				}, () => {
					loadingBar.done();
				});
			}
			
			// 맵 이동
			else if (type === 'map') {
				BigWorld.MapModel.update({
					id : elementId,
					folderId : folderId
				}, () => {
					loadingBar.done();
				});
			}
			
			// 타일 이동
			else if (type === 'tile') {
				BigWorld.TileModel.update({
					id : elementId,
					folderId : folderId
				}, () => {
					loadingBar.done();
				});
			}
			
			// 객체 이동
			else if (type === 'object') {
				BigWorld.ObjectModel.update({
					id : elementId,
					folderId : folderId
				}, () => {
					loadingBar.done();
				});
			}
			
			// 아이템 이동
			else if (type === 'item') {
				BigWorld.ItemModel.update({
					id : elementId,
					folderId : folderId
				}, () => {
					loadingBar.done();
				});
			}
		};
		
		// 특정 요소의 컨텍스트 메뉴를 엽니다.
		let openElementContextMenu = (e, changeNameHandler, moveElementHandler, removeElementHandler) => {
			
			let contextMenu = SkyDesktop.ContextMenu({
				e : e,
				c : [
				
				SkyDesktop.ContextMenuItem({
					title : '이름 변경',
					icon : IMG({
						src : BigWorld.R('explorer/contextmenu/changename.png')
					}),
					on : {
						tap : () => {
							changeNameHandler();
							contextMenu.remove();
						}
					}
				}),
				
				SkyDesktop.ContextMenuItem({
					title : '폴더 이동',
					icon : IMG({
						src : BigWorld.R('explorer/contextmenu/folder.png')
					}),
					on : {
						tap : () => {
							moveElementHandler();
							contextMenu.remove();
						}
					}
				}),
				
				SkyDesktop.ContextMenuItem({
					title : '삭제',
					icon : IMG({
						src : BigWorld.R('explorer/contextmenu/remove.png')
					}),
					on : {
						tap : () => {
							removeElementHandler();
							contextMenu.remove();
						}
					}
				})]
			});
			
			e.stop();
		};
		
		// 폴더의 컨텍스트 메뉴를 엽니다.
		let openFolderContexteMenu = (e, folderData) => {
			
			openElementContextMenu(e,
			
			// changeNameHandler
			() => {
				//TODO:
			},
			
			// moveElementHandler
			() => {
				//TODO:
			},
			
			// removeElementHandler
			() => {
				//TODO:
			});
		};
		
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
						height : 35
					},
					c : SkyDesktop.Toolbar({
						buttons : [
						
						// 새 폴더 버튼
						SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('explorer/menu/folder.png')
							}),
							title : '새 폴더',
							on : {
								tap : () => {
									
									BigWorld.ValidPrompt({
										title : '폴더 생성',
										inputName : 'name',
										placeholder : '폴더 이름',
										errorMsgs : {
											name : {
												size : (validParams) => {
													return '최대 ' + validParams.max + '글자입니다.';
												}
											}
										},
										okButtonTitle : '생성'
									}, (folderName, showErrors, removePrompt) => {
										
										if (folderName.trim() === '') {
											SkyDesktop.Alert({
												msg : '생성할 폴더 이름을 입력해주세요.'
											});
										} else {
											
											// 폴더를 생성합니다.
											BigWorld.FolderModel.create({
												folderId : nowFolderId,
												name : folderName
											}, {
												notValid : showErrors,
												success : removePrompt
											});
										}
									});
								}
							}
						}),
						
						// 새 맵 버튼
						SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('explorer/menu/map.png')
							}),
							title : '새 맵',
							on : {
								tap : () => {
									
									BigWorld.ValidPrompt({
										title : '맵 생성',
										inputName : 'name.ko',
										placeholder : '맵 이름',
										errorMsgs : {
											'name.ko' : {
												size : (validParams) => {
													return '최대 ' + validParams.max + '글자입니다.';
												}
											}
										},
										okButtonTitle : '생성'
									}, (mapName, showErrors, removePrompt) => {
										
										if (mapName.trim() === '') {
											SkyDesktop.Alert({
												msg : '생성할 맵 이름을 입력해주세요.'
											});
										} else {
											
											// 맵을 생성합니다.
											BigWorld.MapModel.create({
												folderId : nowFolderId,
												name : {
													ko : mapName
												}
											}, {
												notValid : showErrors,
												success : removePrompt
											});
										}
									});
								}
							}
						}),
						
						// 새 타일 버튼
						SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('explorer/menu/tile.png')
							}),
							title : '새 타일',
							on : {
								tap : () => {
									
									BigWorld.ValidPrompt({
										title : '타일 생성',
										inputName : 'name.ko',
										placeholder : '타일 이름',
										errorMsgs : {
											'name.ko' : {
												size : (validParams) => {
													return '최대 ' + validParams.max + '글자입니다.';
												}
											}
										},
										okButtonTitle : '생성'
									}, (tileName, showErrors, removePrompt) => {
										
										if (tileName.trim() === '') {
											SkyDesktop.Alert({
												msg : '생성할 타일 이름을 입력해주세요.'
											});
										} else {
											
											// 타일을 생성합니다.
											BigWorld.TileModel.create({
												folderId : nowFolderId,
												name : {
													ko : tileName
												}
											}, {
												notValid : showErrors,
												success : removePrompt
											});
										}
									});
								}
							}
						}),
						
						// 새 오브젝트 버튼
						SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('explorer/menu/object.png')
							}),
							title : '새 오브젝트',
							on : {
								tap : () => {
									
									BigWorld.ValidPrompt({
										title : '오브젝트 생성',
										inputName : 'name.ko',
										placeholder : '오브젝트 이름',
										errorMsgs : {
											'name.ko' : {
												size : (validParams) => {
													return '최대 ' + validParams.max + '글자입니다.';
												}
											}
										},
										okButtonTitle : '생성'
									}, (objectName, showErrors, removePrompt) => {
										
										if (objectName.trim() === '') {
											SkyDesktop.Alert({
												msg : '생성할 오브젝트 이름을 입력해주세요.'
											});
										} else {
											
											// 오브젝트를 생성합니다.
											BigWorld.ObjectModel.create({
												folderId : nowFolderId,
												name : {
													ko : objectName
												}
											}, {
												notValid : showErrors,
												success : removePrompt
											});
										}
									});
								}
							}
						}),
						
						// 새 아이템 버튼
						SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('explorer/menu/item.png')
							}),
							title : '새 아이템',
							on : {
								tap : () => {
									
									BigWorld.ValidPrompt({
										title : '아이템 생성',
										inputName : 'name.ko',
										placeholder : '아이템 이름',
										errorMsgs : {
											'name.ko' : {
												size : (validParams) => {
													return '최대 ' + validParams.max + '글자입니다.';
												}
											}
										},
										okButtonTitle : '생성',
										isToSelectObject : true
									}, (objectId, itemName, showErrors, removePrompt) => {
										
										if (objectId === undefined) {
											SkyDesktop.Alert({
												msg : '아이템의 대상이 되는 오브젝트를 선택해주세요.'
											});
										} else if (itemName.trim() === '') {
											SkyDesktop.Alert({
												msg : '생성할 아이템 이름을 입력해주세요.'
											});
										} else {
											
											// 아이템을 생성합니다.
											BigWorld.ItemModel.create({
												folderId : nowFolderId,
												name : {
													ko : itemName
												}
											}, {
												notValid : showErrors,
												success : removePrompt
											});
										}
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
						
						// 폴더 트리
						SkyDesktop.Tab({
							size : 23,
							c : SkyDesktop.FileTree({
								items : {
									
									// root 폴더
									root : rootFolder = SkyDesktop.Folder({
										style : {
											cursor : 'pointer'
										},
										icon : IMG({
											src : BigWorld.R('explorer/root.png')
										}),
										title : 'root',
										on : {
											
											// 열리고 닫혀도 아이콘의 변경이 없어야 합니다.
											open : (e, item) => {
												item.setIcon(IMG({
													src : BigWorld.R('explorer/root.png')
												}));
												
												// root 폴더의 하위 폴더들을 불러옵니다.
												loadSubFolders(rootFolder, TO_DELETE);
											},
											close : (e, item) => {
												item.setIcon(IMG({
													src : BigWorld.R('explorer/root.png')
												}));
											},
											
											// root 폴더를 선택합니다.
											tap : () => {
												
												if (selectedFolder !== undefined) {
													selectedFolder.deselect();
												}
												
												rootFolder.select();
												selectedFolder = rootFolder;
												
												BigWorld.GO('');
											}
										}
									})
								}
							})
						}),
						
						// 요소 목록
						SkyDesktop.Tab({
							size : 77,
							c : [elementList = DIV(), CLEAR_BOTH()]
						})]
					})
				})
			})]
		}).appendTo(BODY);
		
		// root 폴더는 처음부터 열려있습니다.
		rootFolder.open();
		
		inner.on('paramsChange', (params) => {
			nowFolderId = params.folderId;
			
			// root 폴더
			if (nowFolderId === undefined) {
				nowFolderId = TO_DELETE;
				
				if (selectedFolder !== undefined) {
					selectedFolder.deselect();
				}
				
				rootFolder.select();
				selectedFolder = rootFolder;
			}
			
			// 폴더 선택
			else {
				
				let selectFolder = (parentFolder) => {
					
					let folder = parentFolder.getItem(nowFolderId);
					
					if (folder !== undefined) {
						
						if (selectedFolder !== undefined) {
							selectedFolder.deselect();
						}
						
						folder.select();
						selectedFolder = folder;
					}
					
					else {
						EACH(parentFolder.getItems(), selectFolder);
					}
				};
				selectFolder(rootFolder);
			}
			
			// 모든 요소들의 Watching 룸을 닫습니다.
			EACH(exitElementsWatchingRooms, (exitElementsWatchingRoom) => {
				exitElementsWatchingRoom();
			});
			exitElementsWatchingRooms = [];
			
			elementList.empty();
			
			NEXT([
			// 현재 폴더의 정보를 불러옵니다.
			(next) => {
				
				// root 폴더인 경우 넘기기
				if (nowFolderId === TO_DELETE) {
					next();
				} else {
					
					BigWorld.FolderModel.get(nowFolderId, (nowFolderData) => {
						
						// 상위 폴더로 이동
						elementList.append(BigWorld.ExplorerElement({
							type : 'parentfolder',
							name : '상위 폴더',
							on : {
								
								tap : () => {
									BigWorld.GO(nowFolderData.folderId == undefined ? '' : 'folder/' + nowFolderData.folderId);
								},
								
								// 드래그중인 요소를 이 폴더로 옮깁니다.
								touchend : () => {
									if (draggingElementInfo !== undefined) {
										moveElement(draggingElementInfo.type, draggingElementInfo.id, nowFolderData.folderId == undefined ? TO_DELETE : nowFolderData.folderId);
									}
								}
							}
						}));
						
						next();
					});
				}
			},
			
			// 하위 폴더들을 불러옵니다.
			(next) => {
				return () => {
					exitElementsWatchingRooms.push(BigWorld.FolderModel.onNewAndFindWatching({
						properties : {
							folderId : nowFolderId
						},
						sort : {
							createTime : 1
						}
					}, {
						handler : (subFolderData, addUpdateHandler, addRemoveHandler) => {
							
							elementList.append(BigWorld.ExplorerElement({
								type : 'folder',
								name : subFolderData.name,
								on : {
									
									tap : () => {
										BigWorld.GO('folder/' + subFolderData.id);
									},
									
									// 드래그를 시작합니다.
									touchstart : (e) => {
										
										draggingElementInfo = {
											type : 'folder',
											id : subFolderData.id,
											name : subFolderData.name,
											startLeft : e.getLeft(),
											startTop : e.getTop()
										};
									},
									
									// 드래그중인 요소를 이 폴더로 옮깁니다.
									touchend : () => {
										if (draggingElementInfo !== undefined && draggingElementInfo.id !== subFolderData.id) {
											moveElement(draggingElementInfo.type, draggingElementInfo.id, subFolderData.id);
										}
									},
									
									// 컨텍스트 메뉴를 엽니다.
									contextmenu : (e) => {
										openFolderContexteMenu(e, subFolderData);
									}
								}
							}));
						},
						success : next
					}));
				};
			},
			
			// 맵들을 불러옵니다.
			(next) => {
				return () => {
					exitElementsWatchingRooms.push(BigWorld.MapModel.onNewAndFindWatching({
						properties : {
							folderId : nowFolderId
						},
						sort : {
							createTime : 1
						}
					}, {
						handler : (mapData, addUpdateHandler, addRemoveHandler) => {
							
							elementList.append(BigWorld.ExplorerElement({
								type : 'map',
								name : MSG(mapData.name),
								on : {
									
									tap : () => {
										BigWorld.GO_NEW_WIN('map/' + mapData.id);
									},
									
									// 드래그를 시작합니다.
									touchstart : (e) => {
										
										draggingElementInfo = {
											type : 'map',
											id : mapData.id,
											name : MSG(mapData.name),
											startLeft : e.getLeft(),
											startTop : e.getTop()
										};
									},
									
									// 컨텍스트 메뉴를 엽니다.
									contextmenu : (e) => {
										
										openElementContextMenu(e,
										
										// changeNameHandler
										() => {
											//TODO:
										},
										
										// moveElementHandler
										() => {
											//TODO:
										},
										
										// removeElementHandler
										() => {
											//TODO:
										});
									}
								}
							}));
						},
						success : next
					}));
				};
			},
			
			// 타일들을 불러옵니다.
			(next) => {
				return () => {
					exitElementsWatchingRooms.push(BigWorld.TileModel.onNewAndFindWatching({
						properties : {
							folderId : nowFolderId
						},
						sort : {
							createTime : 1
						}
					}, {
						handler : (tileData, addUpdateHandler, addRemoveHandler) => {
							
							elementList.append(BigWorld.ExplorerElement({
								type : 'tile',
								name : MSG(tileData.name),
								on : {
									
									tap : () => {
										BigWorld.GO_NEW_WIN('tile/' + tileData.id);
									},
									
									// 드래그를 시작합니다.
									touchstart : (e) => {
										
										draggingElementInfo = {
											type : 'tile',
											id : tileData.id,
											name : MSG(tileData.name),
											startLeft : e.getLeft(),
											startTop : e.getTop()
										};
									},
									
									// 컨텍스트 메뉴를 엽니다.
									contextmenu : (e) => {
										
										openElementContextMenu(e,
										
										// changeNameHandler
										() => {
											//TODO:
										},
										
										// moveElementHandler
										() => {
											//TODO:
										},
										
										// removeElementHandler
										() => {
											//TODO:
										});
									}
								}
							}));
						},
						success : next
					}));
				};
			},
			
			// 오브젝트들을 불러옵니다.
			(next) => {
				return () => {
					exitElementsWatchingRooms.push(BigWorld.ObjectModel.onNewAndFindWatching({
						properties : {
							folderId : nowFolderId
						},
						sort : {
							createTime : 1
						}
					}, {
						handler : (objectData, addUpdateHandler, addRemoveHandler) => {
							
							elementList.append(BigWorld.ExplorerElement({
								type : 'object',
								name : MSG(objectData.name),
								on : {
									
									tap : () => {
										BigWorld.GO_NEW_WIN('object/' + objectData.id);
									},
									
									// 드래그를 시작합니다.
									touchstart : (e) => {
										
										draggingElementInfo = {
											type : 'object',
											id : objectData.id,
											name : MSG(objectData.name),
											startLeft : e.getLeft(),
											startTop : e.getTop()
										};
									},
									
									// 컨텍스트 메뉴를 엽니다.
									contextmenu : (e) => {
										
										openElementContextMenu(e,
										
										// changeNameHandler
										() => {
											//TODO:
										},
										
										// moveElementHandler
										() => {
											//TODO:
										},
										
										// removeElementHandler
										() => {
											//TODO:
										});
									}
								}
							}));
						},
						success : next
					}));
				};
			},
			
			// 아이템들을 불러옵니다.
			(next) => {
				return () => {
					exitElementsWatchingRooms.push(BigWorld.ItemModel.onNewAndFindWatching({
						properties : {
							folderId : nowFolderId
						},
						sort : {
							createTime : 1
						}
					}, {
						handler : (itemData, addUpdateHandler, addRemoveHandler) => {
							
							elementList.append(BigWorld.ExplorerElement({
								type : 'item',
								name : MSG(itemData.name),
								on : {
									
									tap : () => {
										BigWorld.GO_NEW_WIN('item/' + itemData.id);
									},
									
									// 드래그를 시작합니다.
									touchstart : (e) => {
										
										draggingElementInfo = {
											type : 'item',
											id : itemData.id,
											name : MSG(itemData.name),
											startLeft : e.getLeft(),
											startTop : e.getTop()
										};
									},
									
									// 컨텍스트 메뉴를 엽니다.
									contextmenu : (e) => {
										
										openElementContextMenu(e,
										
										// changeNameHandler
										() => {
											//TODO:
										},
										
										// moveElementHandler
										() => {
											//TODO:
										},
										
										// removeElementHandler
										() => {
											//TODO:
										});
									}
								}
							}));
						},
						success : next
					}));
				};
			}]);
		});
		
		// 요소 드래그
		let touchmoveEvent = EVENT('touchmove', (e) => {
			
			if (draggingElement === undefined) {
				
				if (
				draggingElementInfo !== undefined && (
					Math.abs(draggingElementInfo.startLeft - e.getLeft()) > 5 ||
					Math.abs(draggingElementInfo.startTop - e.getTop()) > 5)
				) {
					draggingElement = DIV({
						style : {
							position : 'fixed',
							left : e.getLeft() + 10,
							top : e.getTop() + 10
						},
						c : draggingElementInfo.name
					}).appendTo(BODY);
				}
			}
			
			else {
				draggingElement.addStyle({
					left : e.getLeft() + 10,
					top : e.getTop() + 10
				});
			}
		});
		
		let touchendEvent = EVENT('touchend', () => {
			
			if (draggingElement !== undefined) {
				draggingElement.remove();
				draggingElement = undefined;
			}
			
			if (draggingElementInfo !== undefined) {
				draggingElementInfo = undefined;
			}
		});
		
		inner.on('close', () => {
			wrapper.remove();
			
			// 모든 요소들의 Watching 룸을 닫습니다.
			EACH(exitElementsWatchingRooms, (exitElementsWatchingRoom) => {
				exitElementsWatchingRoom();
			});
			
			touchmoveEvent.remove();
			touchendEvent.remove();
		});
	}
});
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
												notEmpty : '저장할 폴더 이름을 입력해주세요.',
												size : (validParams) => {
													return '최대 ' + validParams.max + '글자입니다.';
												}
											}
										},
										okButtonTitle : '생성'
									}, (folderName, showErrors, removePrompt) => {
										
										// 폴더를 생성합니다.
										BigWorld.FolderModel.create({
											folderId : nowFolderId,
											name : folderName
										}, {
											notValid : showErrors,
											success : removePrompt
										});
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
									//TODO:
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
									//TODO:
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
									//TODO:
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
									//TODO:
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
							name : '상위 폴더'
						}, () => {
							BigWorld.GO(nowFolderData.folderId == undefined ? '' : 'folder/' + nowFolderData.folderId);
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
								name : subFolderData.name
							}, () => {
								BigWorld.GO('folder/' + subFolderData.id);
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
							
							//TODO:
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
							
							//TODO:
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
							
							//TODO:
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
							
							//TODO:
						},
						success : next
					}));
				};
			}]);
		});
		
		inner.on('close', () => {
			wrapper.remove();
		});
	}
});
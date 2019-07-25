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
				handler : (subFolderData, addUpdateHandler, addRemoveHandler, exit) => {
					
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
					
					// 폴더가 수정된 경우
					addUpdateHandler((newFolderData) => {
						
						// 다른 폴더로 이전된 경우
						if (newFolderData.folderId !== (parentFolderId === TO_DELETE ? undefined : parentFolderId)) {
							exit();
							parentFolder.removeItem(subFolderData.id);
						}
						
						// 그게 아니라면 이름만 바꿉니다.
						else {
							subFolder.setTitle(newFolderData.name);
						}
					});
					
					// 폴더가 삭제된 경우
					addRemoveHandler(() => {
						parentFolder.removeItem(subFolderData.id);
					});
				}
			});
			
			let closeParentFolderHandler;
			parentFolder.on('close', closeParentFolderHandler = () => {
				
				exitFoldersWatchingRoom();
				exitFoldersWatchingRoom = undefined;
				
				parentFolder.removeAllItems();
				parentFolder.off('close', closeParentFolderHandler);
			});
			
			parentFolder.on('remove', () => {
				if (exitFoldersWatchingRoom !== undefined) {
					exitFoldersWatchingRoom();
					exitFoldersWatchingRoom = undefined;
				}
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
		let openElementContextMenu = (e, moveElementHandler, editHandler, removeElementHandler) => {
			
			let contextMenu = SkyDesktop.ContextMenu({
				e : e,
				c : [
				
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
					title : '정보 수정',
					icon : IMG({
						src : BigWorld.R('explorer/contextmenu/edit.png')
					}),
					on : {
						tap : () => {
							editHandler();
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
			
			// moveElementHandler
			() => {
				BigWorld.SelectFolderPopup((folderId) => {
					moveElement('folder', folderData.id, folderId);
				});
			},
			
			// editHandler
			() => {
				
				BigWorld.ValidPrompt({
					title : '폴더 이름 변경',
					inputName : 'name',
					placeholder : '폴더 이름',
					value : folderData.name,
					errorMsgs : {
						name : {
							size : (validParams) => {
								return '최대 ' + validParams.max + '글자입니다.';
							}
						}
					},
					okButtonTitle : '변경 완료'
				}, (folderName, showErrors, removePrompt) => {
					
					if (folderName.trim() === '') {
						SkyDesktop.Alert({
							msg : '변경할 폴더 이름을 입력해주세요.'
						});
					} else {
						
						// 폴더 이름을 변경합니다.
						BigWorld.FolderModel.update({
							id : folderData.id,
							name : folderName
						}, {
							notValid : showErrors,
							success : removePrompt
						});
					}
				});
			},
			
			// removeElementHandler
			() => {
				
				SkyDesktop.Confirm({
					msg : '정말 폴더를 삭제하시겠습니까? 폴더를 삭제하면 폴더 내 모든 요소들이 삭제됩니다.'
				}, () => {
					
					let loadingBar = SkyDesktop.LoadingBar('lime');
					
					BigWorld.FolderModel.remove(folderData.id, () => {
						loadingBar.done();
					});
				});
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
										inputName : 'name',
										placeholder : '타일 이름',
										errorMsgs : {
											name : {
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
												name : tileName
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
										isToSelectObject : true,
										inputName : 'objectPart',
										placeholder : '오브젝트 파트',
										inputName2 : 'name.ko',
										placeholder2 : '아이템 이름',
										errorMsgs : {
											objectPart : {
												size : (validParams) => {
													return '최대 ' + validParams.max + '글자입니다.';
												}
											},
											'name.ko' : {
												size : (validParams) => {
													return '최대 ' + validParams.max + '글자입니다.';
												}
											}
										},
										okButtonTitle : '생성'
									}, (objectId, objectPart, itemName, showErrors, removePrompt) => {
										
										if (objectId === undefined) {
											SkyDesktop.Alert({
												msg : '아이템의 대상이 되는 오브젝트를 선택해주세요.'
											});
										} else if (objectPart.trim() === '') {
											SkyDesktop.Alert({
												msg : '오브젝트 파트를 입력해주세요.'
											});
										} else if (itemName.trim() === '') {
											SkyDesktop.Alert({
												msg : '생성할 아이템 이름을 입력해주세요.'
											});
										} else {
											
											// 아이템을 생성합니다.
											BigWorld.ItemModel.create({
												folderId : nowFolderId,
												objectId : objectId,
												objectPart : objectPart,
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
						handler : (subFolderData, addUpdateHandler, addRemoveHandler, exit) => {
							
							let element;
							elementList.append(element = BigWorld.ExplorerElement({
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
							
							// 폴더가 수정된 경우
							addUpdateHandler((newFolderData) => {
								
								// 다른 폴더로 이전된 경우
								if (newFolderData.folderId !== (nowFolderId === TO_DELETE ? undefined : nowFolderId)) {
									exit();
									element.remove();
								}
								
								// 그게 아니라면 이름만 바꿉니다.
								else {
									element.changeName(newFolderData.name);
								}
							});
							
							// 폴더가 삭제된 경우
							addRemoveHandler(() => {
								element.remove();
							});
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
						handler : (mapData, addUpdateHandler, addRemoveHandler, exit) => {
							
							let element;
							elementList.append(element = BigWorld.ExplorerElement({
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
										
										// moveElementHandler
										() => {
											BigWorld.SelectFolderPopup((folderId) => {
												moveElement('map', mapData.id, folderId);
											});
										},
										
										// editHandler
										() => {
											
											BigWorld.ValidPrompt({
												title : '맵 이름 변경',
												inputName : 'name.ko',
												placeholder : '맵 이름',
												value : mapData.name.ko,
												errorMsgs : {
													'name.ko' : {
														size : (validParams) => {
															return '최대 ' + validParams.max + '글자입니다.';
														}
													}
												},
												okButtonTitle : '변경 완료'
											}, (mapName, showErrors, removePrompt) => {
												
												if (mapName.trim() === '') {
													SkyDesktop.Alert({
														msg : '변경할 맵 이름을 입력해주세요.'
													});
												} else {
													
													// 맵 이름을 변경합니다.
													BigWorld.MapModel.update({
														id : mapData.id,
														name : {
															ko : mapName
														}
													}, {
														notValid : showErrors,
														success : removePrompt
													});
												}
											});
										},
										
										// removeElementHandler
										() => {
											
											SkyDesktop.Confirm({
												msg : '정말 맵을 삭제하시겠습니까?'
											}, () => {
												
												let loadingBar = SkyDesktop.LoadingBar('lime');
												
												BigWorld.MapModel.remove(mapData.id, () => {
													loadingBar.done();
												});
											});
										});
									}
								}
							}));
							
							// 맵이 수정된 경우
							addUpdateHandler((newMapData) => {
								
								// 다른 폴더로 이전된 경우
								if (newMapData.folderId !== (nowFolderId === TO_DELETE ? undefined : nowFolderId)) {
									exit();
									element.remove();
								}
								
								// 그게 아니라면 이름만 바꿉니다.
								else {
									element.changeName(MSG(newMapData.name));
								}
							});
							
							// 맵이 삭제된 경우
							addRemoveHandler(() => {
								element.remove();
							});
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
						handler : (tileData, addUpdateHandler, addRemoveHandler, exit) => {
							
							let element;
							elementList.append(element = BigWorld.ExplorerElement({
								type : 'tile',
								name : tileData.name,
								on : {
									
									tap : () => {
										BigWorld.GO_NEW_WIN('tile/' + tileData.id);
									},
									
									// 드래그를 시작합니다.
									touchstart : (e) => {
										
										draggingElementInfo = {
											type : 'tile',
											id : tileData.id,
											name : tileData.name,
											startLeft : e.getLeft(),
											startTop : e.getTop()
										};
									},
									
									// 컨텍스트 메뉴를 엽니다.
									contextmenu : (e) => {
										
										openElementContextMenu(e,
										
										// moveElementHandler
										() => {
											BigWorld.SelectFolderPopup((folderId) => {
												moveElement('tile', tileData.id, folderId);
											});
										},
										
										// editHandler
										() => {
											
											BigWorld.ValidPrompt({
												title : '타일 정보 변경',
												inputName : 'name',
												placeholder : '타일 이름',
												value : tileData.name,
												errorMsgs : {
													name : {
														size : (validParams) => {
															return '최대 ' + validParams.max + '글자입니다.';
														}
													}
												},
												okButtonTitle : '변경 완료'
											}, (tileName, showErrors, removePrompt) => {
												
												if (tileName.trim() === '') {
													SkyDesktop.Alert({
														msg : '변경할 타일 이름을 입력해주세요.'
													});
												} else {
													
													// 타일 이름을 변경합니다.
													BigWorld.TileModel.update({
														id : tileData.id,
														name : tileName
													}, {
														notValid : showErrors,
														success : removePrompt
													});
												}
											});
										},
										
										// removeElementHandler
										() => {
											
											SkyDesktop.Confirm({
												msg : '정말 타일을 삭제하시겠습니까?'
											}, () => {
												
												let loadingBar = SkyDesktop.LoadingBar('lime');
												
												BigWorld.TileModel.remove(tileData.id, () => {
													loadingBar.done();
												});
											});
										});
									}
								}
							}));
							
							// 타일이 수정된 경우
							addUpdateHandler((newTileData) => {
								
								// 다른 폴더로 이전된 경우
								if (newTileData.folderId !== (nowFolderId === TO_DELETE ? undefined : nowFolderId)) {
									exit();
									element.remove();
								}
								
								// 그게 아니라면 이름만 바꿉니다.
								else {
									element.changeName(newTileData.name);
								}
							});
							
							// 타일이 삭제된 경우
							addRemoveHandler(() => {
								element.remove();
							});
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
						handler : (objectData, addUpdateHandler, addRemoveHandler, exit) => {
							
							let element;
							elementList.append(element = BigWorld.ExplorerElement({
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
										
										// moveElementHandler
										() => {
											BigWorld.SelectFolderPopup((folderId) => {
												moveElement('object', objectData.id, folderId);
											});
										},
										
										// editHandler
										() => {
											
											BigWorld.ValidPrompt({
												title : '오브젝트 이름 변경',
												inputName : 'name.ko',
												placeholder : '오브젝트 이름',
												value : objectData.name.ko,
												errorMsgs : {
													'name.ko' : {
														size : (validParams) => {
															return '최대 ' + validParams.max + '글자입니다.';
														}
													}
												},
												okButtonTitle : '변경 완료'
											}, (objectName, showErrors, removePrompt) => {
												
												if (objectName.trim() === '') {
													SkyDesktop.Alert({
														msg : '변경할 오브젝트 이름을 입력해주세요.'
													});
												} else {
													
													// 오브젝트 이름을 변경합니다.
													BigWorld.ObjectModel.update({
														id : objectData.id,
														name : {
															ko : objectName
														}
													}, {
														notValid : showErrors,
														success : removePrompt
													});
												}
											});
										},
										
										// removeElementHandler
										() => {
											
											SkyDesktop.Confirm({
												msg : '정말 오브젝트를 삭제하시겠습니까? 오브젝트를 삭제하면 오브젝트와 연결된 모든 아이템들이 삭제됩니다.'
											}, () => {
												
												let loadingBar = SkyDesktop.LoadingBar('lime');
												
												BigWorld.ObjectModel.remove(objectData.id, () => {
													loadingBar.done();
												});
											});
										});
									}
								}
							}));
							
							// 오브젝트가 수정된 경우
							addUpdateHandler((newObjectData) => {
								
								// 다른 폴더로 이전된 경우
								if (newObjectData.folderId !== (nowFolderId === TO_DELETE ? undefined : nowFolderId)) {
									exit();
									element.remove();
								}
								
								// 그게 아니라면 이름만 바꿉니다.
								else {
									element.changeName(MSG(newObjectData.name));
								}
							});
							
							// 오브젝트가 삭제된 경우
							addRemoveHandler(() => {
								element.remove();
							});
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
						handler : (itemData, addUpdateHandler, addRemoveHandler, exit) => {
							
							let element;
							elementList.append(element = BigWorld.ExplorerElement({
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
										
										// moveElementHandler
										() => {
											BigWorld.SelectFolderPopup((folderId) => {
												moveElement('item', itemData.id, folderId);
											});
										},
										
										// editHandler
										() => {
											
											BigWorld.ValidPrompt({
												title : '아이템 정보 변경',
												inputName : 'objectPart',
												placeholder : '오브젝트 파트',
												value : itemData.objectPart,
												inputName2 : 'name.ko',
												placeholder2 : '아이템 이름',
												value2 : itemData.name.ko,
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
													
													// 아이템 이름을 변경합니다.
													BigWorld.ItemModel.update({
														id : itemData.id,
														objectPart : objectPart,
														name : {
															ko : itemName
														}
													}, {
														notValid : showErrors,
														success : removePrompt
													});
												}
											});
										},
										
										// removeElementHandler
										() => {
											
											SkyDesktop.Confirm({
												msg : '정말 아이템을 삭제하시겠습니까?'
											}, () => {
												
												let loadingBar = SkyDesktop.LoadingBar('lime');
												
												BigWorld.ItemModel.remove(itemData.id, () => {
													loadingBar.done();
												});
											});
										});
									}
								}
							}));
							
							// 아이템이 수정된 경우
							addUpdateHandler((newItemData) => {
								
								// 다른 폴더로 이전된 경우
								if (newItemData.folderId !== (nowFolderId === TO_DELETE ? undefined : nowFolderId)) {
									exit();
									element.remove();
								}
								
								// 그게 아니라면 이름만 바꿉니다.
								else {
									element.changeName(MSG(newItemData.name));
								}
							});
							
							// 아이템이 삭제된 경우
							addRemoveHandler(() => {
								element.remove();
							});
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
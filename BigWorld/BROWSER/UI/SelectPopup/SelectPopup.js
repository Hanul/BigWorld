BigWorld.SelectPopup = CLASS({
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.title
		
		let title = params.title;
		
		// 폴더가 열려있는지 기록을 저장하는 스토어
		let folderOpenedStore = BigWorld.STORE('folderOpenedStore');
		
		let rootFolder;
		let selectedElement;
		
		let selectedElementId;
		let selectedElementName;
		
		let callback;
		let loadElements;
		
		// 특정 폴더의 하위 폴더들과 요소들을 불러옵니다.
		let loadSubFoldersAndElements = (parentFolder, parentFolderId) => {
			
			let exitElementsWatchingRoom;
			
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
								
								// 폴더를 열면 하위 폴더들과 요소들을 불러옵니다.
								open : () => {
									
									folderOpenedStore.save({
										name : subFolderData.id,
										value : true
									});
									
									loadSubFoldersAndElements(subFolder, subFolderData.id);
								},
								
								close : () => {
									folderOpenedStore.remove(subFolderData.id);
								},
								
								// 폴더를 선택합니다.
								tap : () => {
									selectElement(
										subFolder,
										loadElements === undefined ? subFolderData.id : undefined,
										loadElements === undefined ? subFolderData.name : undefined
									);
								}
							}
						})
					});
				},
				
				success : () => {
					if (loadElements !== undefined) {
						exitElementsWatchingRoom = loadElements(parentFolder, parentFolderId);
					}
				}
			});
			
			let closeParentFolderHandler;
			parentFolder.on('close', closeParentFolderHandler = () => {
				
				if (exitFoldersWatchingRoom !== undefined) {
					exitFoldersWatchingRoom();
					exitFoldersWatchingRoom = undefined;
				}
				
				if (exitElementsWatchingRoom !== undefined) {
					exitElementsWatchingRoom();
					exitElementsWatchingRoom = undefined;
				}
				
				parentFolder.removeAllItems();
				parentFolder.off('close', closeParentFolderHandler);
			});
			
			parentFolder.on('remove', () => {
				
				if (exitFoldersWatchingRoom !== undefined) {
					exitFoldersWatchingRoom();
					exitFoldersWatchingRoom = undefined;
				}
				
				if (exitElementsWatchingRoom !== undefined) {
					exitElementsWatchingRoom();
					exitElementsWatchingRoom = undefined;
				}
			});
		};
		
		SkyDesktop.Confirm({
			
			style : {
				onDisplayResize : (width, height) => {
					
					if (width > 600) {
						return {
							width : 500
						};
					} else {
						return {
							width : '90%'
						};
					}
				}
			},
			
			msg : [
			
			H2({
				style : {
					fontWeight : 'bold'
				},
				c : title
			}),
			
			SkyDesktop.FileTree({
				style : {
					marginTop : 8,
					overflowY : 'scroll',
					padding : 8,
					borderRadius : 4,
					textAlign : 'left',
					backgroundColor : '#000',
					color : '#fff',
					onDisplayResize : (width, height) => {
						
						if (height > 500) {
							return {
								height : 300
							};
						} else {
							return {
								height : 150
							};
						}
					}
				},
				
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
								
								// root 폴더의 요소들을 불러옵니다.
								loadSubFoldersAndElements(rootFolder, TO_DELETE);
							},
							close : (e, item) => {
								item.setIcon(IMG({
									src : BigWorld.R('explorer/root.png')
								}));
							},
							
							// root 폴더를 선택합니다.
							tap : () => {
								selectElement(
									rootFolder,
									loadElements === undefined ? TO_DELETE : undefined,
									loadElements === undefined ? 'root' : undefined
								);
							}
						}
					})
				}
			})],
			
			okButtonTitle : '선택 완료'
			
		}, () => {
			
			if (selectedElementId !== undefined) {
				callback(selectedElementId, selectedElementName);
			} else {
				return false;
			}
		});
		
		let selectElement = inner.selectElement = (element, elementId, elementName) => {
			
			if (selectedElement !== undefined) {
				selectedElement.deselect();
			}
			
			element.select();
			selectedElement = element;
			
			selectedElementId = elementId;
			selectedElementName = elementName;
		};
		
		let init = inner.init = (_callback, _loadElements) => {
			//REQUIRED: callback
			//REQUIRED: loadElements
			
			callback = _callback;
			loadElements = _loadElements;
			
			// root 폴더는 처음부터 열려있습니다.
			rootFolder.open();
		};
	}
});

BigWorld.CreateSelectTilePopup = METHOD({
	
	run : (callback) => {
		//REQUIRED: callback
		
		let folderOpenedStore = BigWorld.STORE('folderOpenedStore');
		
		let selectedItem;
		let selectedTileData;
		
		let rootList;
		let filenameInput;
		SkyDesktop.Confirm({
			okButtonTitle : '불러오기',
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
			msg : [H2({
				style : {
					fontWeight : 'bold'
				},
				c : '스테이지에 놓을 타일을 선택해주세요.'
			}), SkyDesktop.FileTree({
				style : {
					border : '1px solid #999',
					marginTop : 8,
					overflowY : 'scroll',
					padding : 8,
					borderRadius : 4,
					textAlign : 'left',
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
				c : rootList = SkyDesktop.Folder({
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
							
							selectedTileData = undefined;
						}
					}
				})
			})]
		}, (left, top) => {
			if (selectedTileData === undefined) {
				return false;
			} else {
				callback(selectedTileData, left, top);
			}
		});
		
		let loadFolders = (parentList, folderId) => {
			
			let list = folderId === undefined ? rootList : parentList;
			
			// 폴더들을 불러옵니다.
			let exitFoldersWatchingRoom = BigWorld.FolderModel.onNewAndFindWatching({
				properties : {
					folderId : folderId === undefined ? TO_DELETE : folderId
				},
				sort : {
					createTime : 1
				}
			}, (folderData, addUpdateHandler, addRemoveHandler) => {
				
				let item;
				list.addItem({
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
								
								selectedTileData = undefined;
							}
						}
					})
				});
				
				if (selectedItem !== undefined) {
					selectedItem.deselect();
				}
				item.select();
				selectedItem = item;
				
				addUpdateHandler((newFolderData) => {
					item.setTitle(MSG(newFolderData.name));
				});
				
				addRemoveHandler(() => {
					list.removeItem(folderData.id);
				});
			});
			
			list.on('remove', () => {
				exitFoldersWatchingRoom();
			});
			
			// 타일들을 불러옵니다.
			let exitTilesWatchingRoom = BigWorld.TileModel.onNewAndFindWatching({
				properties : {
					folderId : folderId === undefined ? TO_DELETE : folderId
				},
				sort : {
					createTime : 1
				}
			}, (tileData, addUpdateHandler, addRemoveHandler) => {
				
				let item;
				list.addItem({
					key : tileData.id,
					item : item = SkyDesktop.File({
						style : {
							cursor : 'pointer'
						},
						icon : IMG({
							src : BigWorld.R('explorer/tile.png')
						}),
						title : MSG(tileData.name),
						on : {
							tap : () => {
								
								if (selectedItem !== undefined) {
									selectedItem.deselect();
								}
								item.select();
								selectedItem = item;
								
								selectedTileData = tileData;
							}
						}
					})
				});
				
				addUpdateHandler((newTileData) => {
					item.setTitle(MSG(newTileData.name));
				});
				
				addRemoveHandler(() => {
					item.remove();
				});
			});
			
			list.on('remove', () => {
				exitTilesWatchingRoom();
			});
		};
		
		rootList.open();
		loadFolders();
	}
});

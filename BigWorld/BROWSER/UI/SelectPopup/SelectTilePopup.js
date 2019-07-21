BigWorld.SelectTilePopup = CLASS({
	
	preset : () => {
		return BigWorld.SelectPopup;
	},
	
	params : () => {
		return {
			title : '타일 선택'
		};
	},
	
	init : (inner, self, callback) => {
		//REQUIRED: callback
		
		inner.init(callback, (parentFolder, parentFolderId) => {
			
			return BigWorld.TileModel.onNewAndFindWatching({
				properties : {
					folderId : parentFolderId
				},
				sort : {
					createTime : 1
				}
			}, {
				handler : (tileData, addUpdateHandler, addRemoveHandler) => {
					
					let tile;
					
					parentFolder.addItem({
						key : tileData.id,
						item : tile = SkyDesktop.File({
							style : {
								cursor : 'pointer'
							},
							icon : IMG({
								src : BigWorld.R('explorer/menu/tile.png')
							}),
							title : MSG(tileData.name),
							on : {
								
								// 타일을 선택합니다.
								tap : () => {
									inner.selectElement(tile, tileData.id, MSG(tileData.name));
								}
							}
						})
					});
				}
			});
		});
	}
});

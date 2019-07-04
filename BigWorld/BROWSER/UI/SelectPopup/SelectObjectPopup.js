BigWorld.SelectObjectPopup = CLASS({
	
	preset : () => {
		return BigWorld.SelectPopup;
	},
	
	params : () => {
		return {
			title : '오브젝트 선택'
		};
	},
	
	init : (inner, self, callback) => {
		//REQUIRED: callback
		
		inner.init(callback, (parentFolder, parentFolderId) => {
			
			return BigWorld.ObjectModel.onNewAndFindWatching({
				properties : {
					folderId : parentFolderId
				},
				sort : {
					createTime : 1
				}
			}, {
				handler : (objectData, addUpdateHandler, addRemoveHandler) => {
					
					let object;
					
					parentFolder.addItem({
						key : objectData.id,
						item : object = SkyDesktop.File({
							style : {
								cursor : 'pointer'
							},
							icon : IMG({
								src : BigWorld.R('explorer/menu/object.png')
							}),
							title : MSG(objectData.name),
							on : {
								
								// 오브젝트를 선택합니다.
								tap : () => {
									inner.selectElement(object, objectData.id, MSG(objectData.name));
								}
							}
						})
					});
				}
			});
		});
	}
});

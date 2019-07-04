OVERRIDE(BigWorld.FolderModel, (origin) => {

	BigWorld.FolderModel = OBJECT({

		preset : () => {
			return origin;
		},

		init : (inner, self) => {
			
			inner.on('update', {

				before : (data, next, ret) => {
					
					if (data.folderId !== undefined && data.folderId !== TO_DELETE) {
						
						if (data.id === data.folderId) {
							
							ret({
								validErrors : {
									folderId : {
										type : 'notAllowed'
									}
								}
							});
						}
						
						else {
							
							let check = (parentFolderId) => {
								
								self.get(parentFolderId, (parentFolderData) => {
									
									if (parentFolderData.folderId === undefined) {
										next();
									}
									
									else if (parentFolderData.folderId === data.id) {
										
										ret({
											validErrors : {
												folderId : {
													type : 'notAllowed'
												}
											}
										});
									}
									
									else {
										check(parentFolderData.folderId);
									}
								});
							};
							
							check(data.folderId);
						}
						
						return false;
					}
				}
			});
			
			inner.on('remove', {

				after : (originData) => {
					
					// 해당 폴더의 모든 서브 폴더 제거
					self.find({
						filter : {
							folderId : originData.id
						}
					}, EACH((folderData) => {
						self.remove(folderData.id);
					}));
					
					// 해당 폴더의 모든 객체 제거
					BigWorld.ObjectModel.find({
						filter : {
							folderId : originData.id
						}
					}, EACH((objectData) => {
						BigWorld.ObjectModel.remove(objectData.id);
					}));
					
					// 해당 폴더의 모든 아이템 제거
					BigWorld.ItemModel.find({
						filter : {
							folderId : originData.id
						}
					}, EACH((itemData) => {
						BigWorld.ItemModel.remove(itemData.id);
					}));
				}
			});
		}
	});
});

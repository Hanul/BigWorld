OVERRIDE(BigWorld.FolderModel, (origin) => {

	BigWorld.FolderModel = OBJECT({

		preset : () => {
			return origin;
		},

		init : (inner, self) => {
			
			inner.on('create', {

				after : (savedData) => {
					
					// 폴더의 요소 숫자를 증가
					if (savedData.folderId !== undefined) {
						self.updateNoHistory({
							id : savedData.folderId,
							$inc : {
								elementCount : 1
							}
						});
					}
				}
			});
			
			inner.on('update', {

				before : (data, next, ret) => {
					
					if (data.folderId !== undefined && data.folderId !== TO_DELETE) {
						
						// 내 스스로에 들어가서는 안됌
						if (data.id === data.folderId) {
							
							ret({
								validErrors : {
									folderId : {
										type : 'notAllowed'
									}
								}
							});
						}
						
						// 자식 폴더로 들어가서는 안됌
						else {
							
							let checkParentFolder = (parentFolderId) => {
								
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
							
							checkParentFolder(data.folderId);
						}
						
						return false;
					}
				},

				after : (savedData, originData) => {
					
					// 폴더가 달라지면 기존 폴더의 요소 숫자는 감소, 새 폴더의 요소 숫자는 증가
					if (savedData.folderId !== originData.folderId) {
						
						if (originData.folderId !== undefined) {
							self.updateNoHistory({
								id : originData.folderId,
								$inc : {
									elementCount : -1
								}
							});
						}
						
						if (savedData.folderId !== undefined) {
							self.updateNoHistory({
								id : savedData.folderId,
								$inc : {
									elementCount : 1
								}
							});
						}
					}
				}
			});
			
			inner.on('remove', {

				after : (originData) => {
					
					// 폴더의 요소 숫자를 감소
					if (originData.folderId !== undefined) {
						self.updateNoHistory({
							id : originData.folderId,
							$inc : {
								elementCount : -1
							}
						}, {
							notExists : () => {
								// ignore.
							}
						});
					}
					
					// 해당 폴더의 모든 하위 폴더 제거
					self.find({
						filter : {
							folderId : originData.id
						}
					}, EACH((folderData) => {
						self.remove(folderData.id);
					}));
					
					// 해당 폴더의 모든 맵 제거
					BigWorld.MapModel.find({
						filter : {
							folderId : originData.id
						}
					}, EACH((mapData) => {
						BigWorld.MapModel.remove(mapData.id);
					}));
					
					// 해당 폴더의 모든 오브젝트 제거
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

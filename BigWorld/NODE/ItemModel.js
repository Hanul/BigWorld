OVERRIDE(BigWorld.ItemModel, (origin) => {

	BigWorld.ItemModel = OBJECT({

		preset : () => {
			return origin;
		},

		init : (inner, self) => {
			
			// 성능 향상을 위해 인덱싱 생성
			self.getDB().createIndex({
				objectId : 1
			});
			
			inner.on('create', {

				after : (savedData) => {
					
					// 폴더의 요소 숫자를 증가
					if (savedData.folderId !== undefined) {
						BigWorld.FolderModel.updateNoHistory({
							id : savedData.folderId,
							$inc : {
								elementCount : 1
							}
						});
					}
				}
			});
			
			inner.on('update', {

				after : (savedData, originData) => {
					
					// 폴더가 달라지면 기존 폴더의 요소 숫자는 감소, 새 폴더의 요소 숫자는 증가
					if (savedData.folderId !== originData.folderId) {
						
						if (originData.folderId !== undefined) {
							BigWorld.FolderModel.updateNoHistory({
								id : originData.folderId,
								$inc : {
									elementCount : -1
								}
							});
						}
						
						if (savedData.folderId !== undefined) {
							BigWorld.FolderModel.updateNoHistory({
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
						BigWorld.FolderModel.updateNoHistory({
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
					
					// 맵에 부착된 모든 오브젝트의 아이템 제거
					BigWorld.MapObjectModel.find({
						filter : {
							items : {
							    $elemMatch : {
							        id : originData.id
							    }
							}
						},
						isFindAll : true
					}, EACH((mapObjectData) => {
						
						EACH(mapObjectData.items, (itemInfo) => {
							
							if (itemInfo.id === originData.id) {
								
								REMOVE({
									array : mapObjectData.items,
									value : itemInfo
								});
							}
						});
						
						BigWorld.MapObjectModel.update(mapObjectData);
					}));
				}
			});
		}
	});
});

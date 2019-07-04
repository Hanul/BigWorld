OVERRIDE(BigWorld.ObjectModel, (origin) => {

	BigWorld.ObjectModel = OBJECT({

		preset : () => {
			return origin;
		},

		init : (inner, self) => {
			
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
					
					// 해당 객체의 모든 아이템 제거
					BigWorld.ItemModel.find({
						filter : {
							objectId : originData.id
						}
					}, EACH((itemData) => {
						BigWorld.ItemModel.remove(itemData.id);
					}));
				}
			});
		}
	});
});

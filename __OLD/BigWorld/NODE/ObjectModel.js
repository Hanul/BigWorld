OVERRIDE(BigWorld.ObjectModel, (origin) => {

	BigWorld.ObjectModel = OBJECT({

		preset : () => {
			return origin;
		},

		init : (inner, self) => {
			
			inner.on('remove', {

				after : (originData) => {
					
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

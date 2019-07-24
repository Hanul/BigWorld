OVERRIDE(BigWorld.MapTileModel, (origin) => {

	BigWorld.MapTileModel = OBJECT({

		preset : () => {
			return origin;
		},

		init : (inner, self) => {
			
			inner.on('create', {

				after : (savedData) => {
					
					BigWorld.BROADCAST({
						roomName : 'Zone/' + savedData.col + ',' + savedData.row,
						methodName : 'putTile',
						data : savedData
					});
				}
			});
		}
	});
});

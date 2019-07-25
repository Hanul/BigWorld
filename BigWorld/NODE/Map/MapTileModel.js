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
			
			BigWorld.ROOM(self.getName(), (clientInfo, on) => {
				
				on('put', (data, ret) => {
					if (data !== undefined) {
						
						self.get({
							filter : {
								mapId : data.mapId,
								col : data.col,
								row : data.row
							}
						}, {
							
							// 존재하지 않으면 생성
							notExists : () => {
								self.create(data, ret);
							},
							
							// 존재하면 수정
							success : (savedData) => {
								
								data.id = savedData.id;
								
								self.update(data, ret);
							}
						});
					}
				});
			});
		}
	});
});

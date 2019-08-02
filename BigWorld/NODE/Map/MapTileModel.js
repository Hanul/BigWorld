OVERRIDE(BigWorld.MapTileModel, (origin) => {

	BigWorld.MapTileModel = OBJECT({

		preset : () => {
			return origin;
		},

		init : (inner, self) => {
			
			// 성능 향상을 위해 인덱싱 생성
			self.getDB().createIndex({
				mapId : 1,
				col : 1,
				row : 1
			});
			
			inner.on('create', {

				after : (savedData) => {
					
					BigWorld.BROADCAST({
						roomName : 'Zone/' + savedData.col + ',' + savedData.row,
						methodName : 'putTile',
						data : savedData
					});
					
					// 중복된 오래된 타일이 존재하는 경우 삭제합니다.
					self.find({
						filter : {
							id : {
								$ne : savedData.id
							},
							mapId : savedData.mapId,
							col : savedData.col,
							row : savedData.row,
							createTime : {
								$lte : savedData.createTime
							}
						}
					}, (existedMapTileDataSet) => {
						
						if (existedMapTileDataSet.length > 0) {
							
							EACH(existedMapTileDataSet, (existedMapTileData) => {
								self.remove(existedMapTileData.id);
							});
						}
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

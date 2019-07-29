OVERRIDE(BigWorld.MapObjectModel, (origin) => {

	BigWorld.MapObjectModel = OBJECT({

		preset : () => {
			return origin;
		},

		init : (inner, self) => {
			
			// 성능 향상을 위해 인덱싱 생성
			self.getDB().createIndex({
				mapId : 1,
				x : 1,
				y : 1
			});
			
			// 타일의 크기
			let tileWidth = CONFIG.BigWorld.sectionWidth * CONFIG.BigWorld.tileSectionLevel;
			let tileHeight = CONFIG.BigWorld.sectionHeight * CONFIG.BigWorld.tileSectionLevel;
			
			inner.on('create', {

				after : (savedData) => {
					
					BigWorld.BROADCAST({
						roomName : 'Zone/' + Math.round(savedData.x / tileWidth) + ',' + Math.round(savedData.y / tileHeight),
						methodName : 'putObject',
						data : savedData
					});
				}
			});
		}
	});
});

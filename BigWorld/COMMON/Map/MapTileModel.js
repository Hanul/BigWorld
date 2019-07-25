BigWorld.MapTileModel = OBJECT({
	
	preset : () => {
		return BigWorld.MODEL;
	},
	
	params : () => {
		
		let kindMapDetails = {};
		EACH(BigWorld.TILE_STATES, (tileState) => {
			kindMapDetails[tileState] = {
				notEmpty : true,
				integer : true
			};
		});

		let validDataSet = {
			
			mapId : {
				notEmpty : true,
				id : true
			},
			
			tileId : {
				notEmpty : true,
				id : true
			},
			
			kindMap : {
				notEmpty : true,
				data : true,
				details : kindMapDetails
			},
			
			col : {
				notEmpty : true,
				integer : true
			},
			
			row : {
				notEmpty : true,
				integer : true
			}
		};
		
		return {
			name : 'MapTile',
			methodConfig : {
				create : {
					valid : VALID(validDataSet),
					role : 'System'
				},
				update : {
					valid : VALID(validDataSet)
				}
			}
		};
	}
});

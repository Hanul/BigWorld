BigWorld.MapTileModel = OBJECT({
	
	preset : () => {
		return BigWorld.MODEL;
	},
	
	params : () => {

		let validDataSet = {
			
			mapId : {
				notEmpty : true,
				id : true
			},
			
			tileId : {
				notEmpty : true,
				id : true
			},
			
			kind : {
				notEmpty : true,
				integer : true
			},
			
			tileRow : {
				notEmpty : true,
				integer : true
			},
			
			tileCol : {
				notEmpty : true,
				integer : true
			}
		};
		
		return {
			name : 'MapTile',
			methodConfig : {
				create : {
					valid : VALID(validDataSet)
				},
				update : {
					valid : VALID(validDataSet)
				}
			}
		};
	}
});

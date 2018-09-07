BigWorld.StageTileModel = OBJECT({
	
	preset : () => {
		return BigWorld.MODEL;
	},
	
	params : () => {

		let validDataSet = {
			
			stageId : {
				notEmpty : true,
				id : true
			},
			
			objectId : {
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
			name : 'StageTile',
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

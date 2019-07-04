BigWorld.StageObjectModel = OBJECT({
	
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
			
			state : {
				notEmpty : true,
				size : {
					max : 255
				}
			},
			
			itemInfos : {
				array : true,
				element : {
					data : true,
					detail : {
						id : {
							notEmpty : true,
							id : true
						},
						kind : {
							notEmpty : true,
							integer : true
						}
					}
				}
			},
			
			direction : {
				notEmpty : true,
				one : ['down', 'right', 'up', 'left']
			},
			
			tileRow : {
				notEmpty : true,
				integer : true
			},
			
			tileCol : {
				notEmpty : true,
				integer : true
			},
			
			sectionRow : {
				notEmpty : true,
				integer : true
			},
			
			sectionCol : {
				notEmpty : true,
				integer : true
			},
			
			isReverse : {
				bool : true
			}
		};
		
		return {
			name : 'StageObject',
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

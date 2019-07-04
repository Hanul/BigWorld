BigWorld.MapObjectModel = OBJECT({
	
	preset : () => {
		return BigWorld.MODEL;
	},
	
	params : () => {

		let validDataSet = {
			
			mapId : {
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
			
			items : {
				notEmpty : true,
				
				array : true,
				element : {
					
					data : true,
					detail : {
						
						// 아이템 ID
						id : {
							notEmpty : true,
							id : true
						},
						
						// 아이템 종류 인덱스
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
			
			x : {
				notEmpty : true,
				integer : true
			},
			
			y : {
				notEmpty : true,
				integer : true
			},
			
			isReverse : {
				bool : true
			}
		};
		
		return {
			name : 'MapObject',
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

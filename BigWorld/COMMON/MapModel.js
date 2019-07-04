BigWorld.MapModel = OBJECT({
	
	preset : () => {
		return BigWorld.MODEL;
	},
	
	params : () => {

		let validDataSet = {
			
			folderId : {
				id : true
			},
			
			name : {
				notEmpty : true,
				data : true,
				detail : {
					en : {
						size : {
							max : 255
						}
					},
					ko : {
						size : {
							max : 255
						}
					},
					ja : {
						size : {
							max : 255
						}
					},
					'zh-TW' : {
						size : {
							max : 255
						}
					}
				}
			}
		};
		
		return {
			name : 'Map',
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

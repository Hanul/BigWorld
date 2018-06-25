BigWorld.ImageModel = OBJECT({
	
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
				size : {
					max : 255
				}
			},
			
			fileId : {
				notEmpty : true,
				id : true
			},
			
			fileSize : {
				notEmpty : true,
				integer : true
			},
			
			fileType : {
				notEmpty : true,
				size : {
					max : 255
				}
			}
		};
		
		return {
			name : 'Image',
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

BigWorld.FolderModel = OBJECT({
	
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
			
			factorCount : {
				notEmpty : true,
				integer : 0
			}
		};
		
		return {
			name : 'Folder',
			initData : {
				factorCount : 0
			},
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

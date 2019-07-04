BigWorld.FolderModel = OBJECT({
	
	preset : () => {
		return BigWorld.MODEL;
	},
	
	params : () => {

		let validDataSet = {
			
			// 부모 폴더 ID
			folderId : {
				id : true
			},
			
			name : {
				notEmpty : true,
				size : {
					max : 255
				}
			},
			
			elementCount : {
				notEmpty : true,
				integer : 0
			}
		};
		
		return {
			name : 'Folder',
			initData : {
				elementCount : 0
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

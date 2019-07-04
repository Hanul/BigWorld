BigWorld.SelectFolderPopup = CLASS({
	
	preset : () => {
		return BigWorld.SelectPopup;
	},
	
	params : () => {
		return {
			title : '폴더 선택'
		};
	},
	
	init : (inner, self, callback) => {
		//REQUIRED: callback
		
		inner.init(callback);
	}
});

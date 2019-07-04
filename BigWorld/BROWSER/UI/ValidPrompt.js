BigWorld.ValidPrompt = METHOD({
	
	run : (params, callback) => {
		//REQUIRED: params
		//OPTIONAL: params.title
		//OPTIONAL: params.inputName
		//OPTIONAL: params.placeholder
		//OPTIONAL: params.errorMsgs
		//OPTIONAL: params.okButtonTitle
		//REQUIRED: callback
		
		let title = params.title;
		let inputName = params.inputName;
		let placeholder = params.placeholder;
		let errorMsgs = params.errorMsgs;
		let okButtonTitle = params.okButtonTitle;
		
		let form;
		let input;
		let confirm = SkyDesktop.Confirm({
			okButtonTitle : okButtonTitle,
			msg : [title, form = UUI.VALID_FORM({
				style : {
					marginTop : 10
				},
				errorMsgs : errorMsgs,
				errorMsgStyle : {
					color : 'red'
				},
				c : [input = INPUT({
					style : {
						width : 222,
						padding : 8,
						border : '1px solid #999',
						borderRadius : 4
					},
					name : inputName,
					placeholder : placeholder
				})]
			})]
		}, () => {
			
			callback(input.getValue(), form.showErrors, confirm.remove);
			
			return false;
		});
		
		input.focus();
	}
});
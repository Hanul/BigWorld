BigWorld.ValidPrompt = METHOD({
	
	run : (params, callback) => {
		//REQUIRED: params
		//OPTIONAL: params.title
		//OPTIONAL: params.inputName
		//OPTIONAL: params.placeholder
		//OPTIONAL: params.errorMsgs
		//OPTIONAL: params.okButtonTitle
		//OPTIONAL: params.isToSelectObject
		//REQUIRED: callback
		
		let title = params.title;
		let inputName = params.inputName;
		let placeholder = params.placeholder;
		let errorMsgs = params.errorMsgs;
		let okButtonTitle = params.okButtonTitle;
		let isToSelectObject = params.isToSelectObject;
		
		let selectedObjectId;
		
		let form;
		let input;
		let confirm = SkyDesktop.Confirm({
			okButtonTitle : okButtonTitle,
			msg : [
			
			title,
			
			isToSelectObject === true ? UUI.BUTTON_H({
				style : {
					marginTop : 10,
					padding : 4,
					border : '1px solid #999',
					borderRadius : 4
				},
				icon : IMG({
					src : BigWorld.R('explorer/menu/object.png')
				}),
				spacing : 10,
				title : '대상 오브젝트 선택',
				on : {
					tap : () => {
						//TODO:
					}
				}
			}) : undefined,
			
			form = UUI.VALID_FORM({
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
			
			if (isToSelectObject === true) {
				callback(selectedObjectId, input.getValue(), form.showErrors, confirm.remove);
			} else {
				callback(input.getValue(), form.showErrors, confirm.remove);
			}
			
			return false;
		});
		
		input.focus();
	}
});
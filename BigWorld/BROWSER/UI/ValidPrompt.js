BigWorld.ValidPrompt = METHOD({
	
	run : (params, callback) => {
		//REQUIRED: params
		//OPTIONAL: params.title
		//OPTIONAL: params.isToSelectObject
		//OPTIONAL: params.inputName
		//OPTIONAL: params.placeholder
		//OPTIONAL: params.value
		//OPTIONAL: params.inputName2
		//OPTIONAL: params.placeholder2
		//OPTIONAL: params.value2
		//OPTIONAL: params.errorMsgs
		//OPTIONAL: params.okButtonTitle
		//REQUIRED: callback
		
		let title = params.title;
		
		let inputName = params.inputName;
		let placeholder = params.placeholder;
		let value = params.value;
		
		let inputName2 = params.inputName2;
		let placeholder2 = params.placeholder2;
		let value2 = params.value2;
		
		let errorMsgs = params.errorMsgs;
		
		let okButtonTitle = params.okButtonTitle;
		let isToSelectObject = params.isToSelectObject;
		
		let selectedObjectId;
		
		let form;
		let input;
		let input2;
		
		let confirm = SkyDesktop.Confirm({
			okButtonTitle : okButtonTitle,
			msg : [
			
			H2({
				style : {
					fontWeight : 'bold'
				},
				c : title
			}),
			
			isToSelectObject === true ? SkyDesktop.Button({
				style : {
					margin : 'auto',
					marginTop : 10
				},
				icon : IMG({
					src : BigWorld.R('explorer/menu/object.png')
				}),
				title : '대상 오브젝트 선택',
				on : {
					tap : (e, button) => {
						
						BigWorld.SelectObjectPopup((objectId, objectName) => {
							
							selectedObjectId = objectId;
							
							button.setTitle(objectName);
						});
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
					placeholder : placeholder,
					value : value
				}), inputName2 !== undefined ? input2 = INPUT({
					style : {
						marginTop : 10,
						width : 222,
						padding : 8,
						border : '1px solid #999',
						borderRadius : 4
					},
					name : inputName2,
					placeholder : placeholder2,
					value : value2
				}) : undefined]
			})]
		}, () => {
			
			if (isToSelectObject === true) {
				if (input2 !== undefined) {
					callback(selectedObjectId, input.getValue(), input2.getValue(), form.showErrors, confirm.remove);
				} else {
					callback(selectedObjectId, input.getValue(), form.showErrors, confirm.remove);
				}
			}
			
			else {
				if (input2 !== undefined) {
					callback(input.getValue(), input2.getValue(), form.showErrors, confirm.remove);
				} else {
					callback(input.getValue(), form.showErrors, confirm.remove);
				}
			}
			
			return false;
		});
		
		input.select();
	}
});
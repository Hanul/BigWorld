BigWorld.ExplorerElement = CLASS({
	
	preset : () => {
		return DIV;
	},
	
	params : () => {
		return {
			style : {
				flt : 'left'
			}
		};
	},
	
	init : (inner, self, params, tapHandler) => {
		//REQUIRED: params
		//REQUIRED: params.type
		//REQUIRED: params.name
		//REQUIRED: tapHandler
		
		let type = params.type;
		let name = params.name;
		
		self.append(UUI.BUTTON({
			icon : IMG({
				src : BigWorld.R('explorer/element/' + type + '.png')
			}),
			title : name,
			on : {
				tap : tapHandler
			}
		}));
	}
});

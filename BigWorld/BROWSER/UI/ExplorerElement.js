BigWorld.ExplorerElement = CLASS({
	
	preset : () => {
		return DIV;
	},
	
	params : () => {
		return {
			style : {
				flt : 'left',
				padding : 10
			}
		};
	},
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.type
		//REQUIRED: params.name
		
		let type = params.type;
		let name = params.name;
		
		let button;
		self.append(button = UUI.BUTTON({
			icon : IMG({
				src : BigWorld.R('explorer/element/' + type + '.png'),
				on : {
					touchstart : (e) => {
						e.stopDefault();
					}
				}
			}),
			title : name
		}));
		
		self.on('mouseover', () => {
			self.addStyle({
				backgroundColor : BROWSER_CONFIG.SkyDesktop !== undefined && BROWSER_CONFIG.SkyDesktop.theme === 'dark' ? '#003333' : '#AFCEFF'
			});
		});
		
		self.on('mouseout', () => {
			self.addStyle({
				backgroundColor : 'transparent'
			});
		});
		
		let changeName = self.changeName = (_name) => {
			//REQUIRED: name
			
			name = _name;
			
			button.setTitle(name);
		};
	}
});

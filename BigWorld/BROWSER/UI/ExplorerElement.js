BigWorld.ExplorerElement = CLASS({
	
	preset : () => {
		return DIV;
	},
	
	params : () => {
		return {
			style : {
				flt : 'left',
				padding : 10,
				paddingTop : 0
			}
		};
	},
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.type
		//REQUIRED: params.name
		
		let type = params.type;
		let name = params.name;
		
		self.append(UUI.BUTTON({
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
	}
});

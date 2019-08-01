BigWorld.SectionCollider = CLASS({
	
	preset : () => {
		return SkyEngine.Node;
	},
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.sectionMap
		//REQUIRED: params.sectionLevels
		//REQUIRED: params.direction
		
		let sectionMap = params.sectionMap;
		let sectionLevels = params.sectionLevels;
		let direction = params.direction;
		
		let halfTileSectionLevel = CONFIG.BigWorld.tileSectionLevel / 2;
		
		let refresh = self.refresh = RAR(() => {
			
			self.empty();
			
			EACH(sectionMap, (sections, sectionRow) => {
				EACH(sections, (section, sectionCol) => {
					
					if (section.isBlock === true) {
						
						let x, y;
						
						if (direction === 'down') {
							x = (sectionCol - sectionLevels.left) * CONFIG.BigWorld.sectionWidth;
							y = (sectionRow - sectionLevels.up) * CONFIG.BigWorld.sectionHeight;
						}
						if (direction === 'left') {
							x = -(sectionRow - sectionLevels.up) * CONFIG.BigWorld.sectionHeight;
							y = (sectionCol - sectionLevels.left) * CONFIG.BigWorld.sectionWidth;
						}
						if (direction === 'up') {
							x = -(sectionCol - sectionLevels.left) * CONFIG.BigWorld.sectionWidth;
							y = -(sectionRow - sectionLevels.up) * CONFIG.BigWorld.sectionHeight;
						}
						if (direction === 'right') {
							x = (sectionRow - sectionLevels.up) * CONFIG.BigWorld.sectionHeight;
							y = -(sectionCol - sectionLevels.left) * CONFIG.BigWorld.sectionWidth;
						}
						
						self.append(SkyEngine.Rect({
							
							x : x,
							y : y,
							
							width : CONFIG.BigWorld.sectionWidth,
							height : CONFIG.BigWorld.sectionHeight
						}));
					}
				});
			});
		});
	}
});
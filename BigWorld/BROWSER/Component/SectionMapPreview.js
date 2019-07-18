BigWorld.SectionMapPreview = CLASS({
	
	preset : () => {
		return SkyEngine.Node;
	},
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.sectionMap
		//REQUIRED: params.leftSectionLevel
		//REQUIRED: params.upSectionLevel
		//REQUIRED: params.rightSectionLevel
		//REQUIRED: params.downSectionLevel
		//REQUIRED: params.direction
		//REQUIRED: params.isEditMode
		//REQUIRED: params.selectSection
		
		let sectionMap = params.sectionMap;
		let leftSectionLevel = params.leftSectionLevel;
		let upSectionLevel = params.upSectionLevel;
		let rightSectionLevel = params.rightSectionLevel;
		let downSectionLevel = params.downSectionLevel;
		
		let direction = params.direction;
		let isEditMode = params.isEditMode;
		let selectSectionHandler = params.selectSection;
		
		let halfTileSectionLevel = CONFIG.BigWorld.tileSectionLevel / 2;
		
		let refresh = self.refresh = RAR(() => {
			
			self.empty();
			
			EACH(sectionMap, (sections, sectionRow) => {
				EACH(sections, (section, sectionCol) => {
					
					let x, y;
					
					if (direction === 'down') {
						x = (sectionCol - leftSectionLevel) * CONFIG.BigWorld.sectionWidth;
						y = (sectionRow - upSectionLevel) * CONFIG.BigWorld.sectionHeight;
					}
					if (direction === 'left') {
						x = -(sectionRow - upSectionLevel) * CONFIG.BigWorld.sectionHeight;
						y = (sectionCol - leftSectionLevel) * CONFIG.BigWorld.sectionWidth;
					}
					if (direction === 'up') {
						x = -(sectionCol - leftSectionLevel) * CONFIG.BigWorld.sectionWidth;
						y = -(sectionRow - upSectionLevel) * CONFIG.BigWorld.sectionHeight;
					}
					if (direction === 'right') {
						x = (sectionRow - upSectionLevel) * CONFIG.BigWorld.sectionHeight;
						y = -(sectionCol - leftSectionLevel) * CONFIG.BigWorld.sectionWidth;
					}
					
					self.append(SkyEngine.Rect({
						
						x : x,
						y : y,
						
						width : CONFIG.BigWorld.sectionWidth,
						height : CONFIG.BigWorld.sectionHeight,
						
						color : section.isTrigger === true ? 'rgb(0, 174, 221)' : (section.isBlock === true ? 'rgb(255, 0, 0)' : 'rgb(0, 255, 0)'),
						alpha : 0.2,
						
						touchArea : isEditMode === true ? SkyEngine.Rect({
							width : CONFIG.BigWorld.sectionWidth,
							height : CONFIG.BigWorld.sectionHeight
						}) : undefined,
						
						on : isEditMode === true ? {
							touchstart : (e) => {
								e.stop();
							},
							tap : () => {
								selectSectionHandler(sectionCol, sectionRow);
							}
						} : undefined
					}));
				});
			});
		});
	}
});
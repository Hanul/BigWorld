BigWorld.SectionMapPreview = CLASS({
	
	preset : () => {
		return SkyEngine.Node;
	},
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.sectionMap
		//REQUIRED: params.sectionLevels
		//OPTIONAL: params.touchAreaInfo
		//OPTIONAL: params.borderScale
		//REQUIRED: params.direction
		//REQUIRED: params.isEditMode
		//REQUIRED: params.selectSection
		
		let sectionMap = params.sectionMap;
		let sectionLevels = params.sectionLevels;
		let touchAreaInfo = params.touchAreaInfo;
		let borderScale = params.borderScale;
		
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
			
			if (touchAreaInfo !== undefined) {
				self.append(SkyEngine.Rect({
					
					x : touchAreaInfo.x,
					y : touchAreaInfo.y,
					
					width : touchAreaInfo.width,
					height : touchAreaInfo.height,
					
					border : borderScale + 'px solid #00FF00'
				}));
			}
		});
	}
});
BigWorld.SectionEditor = CLASS({
	
	preset : () => {
		return DIV;
	},
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.sectionMap
		//OPITONAL: params.y
		//REQUIRED: params.changeDirectionHandler
		//REQUIRED: params.refreshPreviewHandler
		
		let sectionMap = params.sectionMap;
		let y = params.y;
		
		if (y === undefined) {
			y = 0;
		}
		
		let changeDirectionHandler = params.changeDirection;
		let refreshPreviewHandler = params.refreshPreview;
		
		let sectionEditorStore = BigWorld.STORE('sectionEditorStore');
		
		let direction = 'down';
		
		let previewScreen;
		
		// 프리뷰 스크린 생성
		self.append(previewScreen = SkyEngine.SubScreen({
			style : {
				flt : 'left',
				backgroundColor : '#666',
				color : '#fff'
			},
			width : 400,
			height : 400,
			y : y
		}));
		
		self.append(UUI.FULL_INPUT({
			style : {
				marginLeft : 10,
				flt : 'left',
				width : 30
			},
			value : sectionEditorStore.get('scale'),
			placeholder : '배율',
			on : {
				change : (e, input) => {
					
					let previewScale = REAL(input.getValue());
					
					sectionEditorStore.save({
						name : 'scale',
						value : previewScale
					});
					
					previewScreen.setScale(previewScale);
					refreshPreview();
				}
			}
		}));
		
		if (sectionEditorStore.get('scale') != undefined) {
			previewScreen.setScale(sectionEditorStore.get('scale'));
		}
		
		self.append(CLEAR_BOTH());
		
		let refreshPreview = self.refreshPreview = RAR(() => {
			
			previewScreen.empty();
			
			EACH([SkyEngine.Rect({
				width : 3,
				height : 3,
				color : '#00FFFF'
			}), SkyEngine.Line({
				startX : -200 / previewScreen.getScaleX(),
				endX : 200 / previewScreen.getScaleX(),
				border : (1 / previewScreen.getScaleX()) + 'px solid #00FFFF'
			}), SkyEngine.Line({
				startY : (-200 - y) / previewScreen.getScaleX(),
				endY : (200 - y) / previewScreen.getScaleX(),
				border : (1 / previewScreen.getScaleX()) + 'px solid #00FFFF'
			})], previewScreen.append);
			
			refreshPreviewHandler(previewScreen, direction);
		});
		
		let getDirection = self.getDirection = () => {
			return direction;
		};
	}
});
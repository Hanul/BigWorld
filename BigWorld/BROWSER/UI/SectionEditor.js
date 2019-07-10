BigWorld.SectionEditor = CLASS({
	
	preset : () => {
		return DIV;
	},
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.sectionMap
		
		let sectionEditorStore = BigWorld.STORE('sectionEditorStore');
		
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
			y : 100,
			c : [SkyEngine.Rect({
				width : 3,
				height : 3,
				color : '#00FFFF'
			}), SkyEngine.Line({
				startX : -200,
				endX : 200,
				border : '1px solid #00FFFF'
			}), SkyEngine.Line({
				startY : -300,
				endY : 100,
				border : '1px solid #00FFFF'
			})]
		}));
		
		self.append(UUI.FULL_INPUT({
			style : {
				marginLeft : 10,
				flt : 'left',
				width : 30
			},
			placeholder : '배율',
			on : {
				change : (e, input) => {
					
					let previewScale = REAL(input.getValue());
					
					sectionEditorStore.save({
						name : 'scale',
						value : previewScale
					});
				}
			}
		}));
		
		self.append(CLEAR_BOTH());
		
		let refreshPreview = self.refreshPreview = () => {
			//TODO:
		};
		
		let getDirection = self.getDirection = () => {
			return 'down';
		};
	}
});
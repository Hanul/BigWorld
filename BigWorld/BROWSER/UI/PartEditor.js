BigWorld.PartEditor = CLASS({
	
	preset : () => {
		return DIV;
	},
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.stateInfo
		//REQUIRED: params.kind
		
		let stateInfo = params.stateInfo;
		let kind = params.kind;
		
		self.append(DIV({
			c : [
			
			// 파트 추가 버튼
			SkyDesktop.Button({
				style : {
					flt : 'left'
				},
				icon : IMG({
					src : BigWorld.R('parteditor/part.png')
				}),
				title : '파트 추가'
			}),
			
			// 모든 파트의 위치를 왼쪽으로 1px 이동시키는 버튼
			SkyDesktop.Button({
				style : {
					marginLeft : 10,
					flt : 'left'
				},
				icon : IMG({
					src : BigWorld.R('parteditor/left.png')
				}),
				spacing : 0
			}),
			
			// 모든 파트의 위치를 위로 1px 이동시키는 버튼
			SkyDesktop.Button({
				style : {
					marginLeft : 10,
					flt : 'left'
				},
				icon : IMG({
					src : BigWorld.R('parteditor/up.png')
				}),
				spacing : 0
			}),
			
			// 모든 파트의 위치를 오른쪽으로 1px 이동시키는 버튼
			SkyDesktop.Button({
				style : {
					marginLeft : 10,
					flt : 'left'
				},
				icon : IMG({
					src : BigWorld.R('parteditor/right.png')
				}),
				spacing : 0
			}),
			
			// 모든 파트의 위치를 아래로 1px 이동시키는 버튼
			SkyDesktop.Button({
				style : {
					marginLeft : 10,
					flt : 'left'
				},
				icon : IMG({
					src : BigWorld.R('parteditor/down.png')
				}),
				spacing : 0
			}),
			
			CLEAR_BOTH(),
			
			P({
				style : {
					marginTop : 5
				},
				c : '방향 버튼을 누르면 모든 파트들의 위치를 1픽셀 이동시킵니다.'
			})]
		}));
	}
});
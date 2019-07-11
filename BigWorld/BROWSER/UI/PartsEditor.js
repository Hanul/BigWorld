BigWorld.PartsEditor = CLASS({
	
	preset : () => {
		return DIV;
	},
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.stateInfos
		//REQUIRED: params.state
		//REQUIRED: params.kind
		//REQUIRED: params.saveTile
		
		let stateInfos = params.stateInfos;
		let state = params.state;
		let kind = params.kind;
		
		let saveTile = params.saveTile;
		
		let nowDirection;
		
		let partEditorList;
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
				title : '파트 추가',
				on : {
					tap : () => {
						
						let stateInfo = stateInfos[state];
						
						// 상태가 없으면 생성
						if (stateInfo === undefined) {
							stateInfo = stateInfos[state] = {
								sectionMap : BigWorld.Tile.getInitSectionMap(),
								parts : []
							};
						}
						
						let partInfo = {
							name : {
								ko : '파트 ' + stateInfo.parts.length
							},
							zIndex : 0,
							frameCount : 1,
							x : 0,
							y : 0,
							frames : []
						};
						
						stateInfo.parts.push(partInfo);
						
						addPartEditor(partInfo);
						
						saveTile();
					}
				}
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
				spacing : 0,
				on : {
					tap : () => {
						
						let stateInfo = stateInfos[state];
						if (stateInfo !== undefined) {
							EACH(partEditorList.getChildren(), (partEditor) => {
								partEditor.moveLeft1Pixel();
							});
							saveTile();
						}
					}
				}
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
				spacing : 0,
				on : {
					tap : () => {
						
						let stateInfo = stateInfos[state];
						if (stateInfo !== undefined) {
							EACH(partEditorList.getChildren(), (partEditor) => {
								partEditor.moveRight1Pixel();
							});
							saveTile();
						}
					}
				}
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
				spacing : 0,
				on : {
					tap : () => {
						
						let stateInfo = stateInfos[state];
						if (stateInfo !== undefined) {
							EACH(partEditorList.getChildren(), (partEditor) => {
								partEditor.moveUp1Pixel();
							});
							saveTile();
						}
					}
				}
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
				spacing : 0,
				on : {
					tap : () => {
						
						let stateInfo = stateInfos[state];
						if (stateInfo !== undefined) {
							EACH(partEditorList.getChildren(), (partEditor) => {
								partEditor.moveDown1Pixel();
							});
							saveTile();
						}
					}
				}
			}),
			
			CLEAR_BOTH(),
			
			P({
				style : {
					marginTop : 5
				},
				c : '방향 버튼을 누르면 모든 파트들의 위치를 1픽셀 이동시킵니다.'
			}),
			
			partEditorList = DIV()]
		}));
		
		let addPartEditor = (partInfo) => {
			
			partEditorList.append(BigWorld.PartEditor({
				style : {
					marginTop : 10
				},
				partInfo : partInfo,
				kind : kind,
				direction : nowDirection,
				saveTile : saveTile,
				removePart : () => {
					
					REMOVE({
						array : stateInfos[state].parts,
						value : partInfo
					});
					
					// 모든 파트가 제거되면 상태도 제거
					if (stateInfos[state].parts.length === 0) {
						delete stateInfos[state];
					}
					
					saveTile();
				}
			}));
		};
		
		let changeDirection = self.changeDirection = (direction) => {
			
			nowDirection = direction;
			
			partEditorList.empty();
			
			// 파트 에디터 열기
			let stateInfo = stateInfos[state];
			if (stateInfo !== undefined) {
				EACH(stateInfo.parts, addPartEditor);
			}
		};
	}
});
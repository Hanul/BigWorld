BigWorld.ObjectEditor = CLASS({
	
	preset : () => {
		return VIEW;
	},
	
	init : (inner, self) => {
		
		TITLE('BigWorld Object Editor');
		
		let wrapper;
		inner.on('paramsChange', (params) => {
			
			BigWorld.ObjectModel.get(params.objectId, (objectData) => {
				
				let kindList;
				let stateList;
				
				let content;
				wrapper = TABLE({
					style : {
						position : 'absolute',
						width : '100%',
						height : '100%'
					},
					c : [TR({
						c : TD({
							style : {
								height : 28
							},
							c : SkyDesktop.Toolbar({
								buttons : [SkyDesktop.ToolbarButton({
									icon : IMG({
										src : BigWorld.R('objecteditor/menu/edit.png')
									}),
									title : '기본 설정 화면'
								}), SkyDesktop.ToolbarButton({
									icon : IMG({
										src : BigWorld.R('objecteditor/menu/kind.png')
									}),
									title : '종류 추가',
									on : {
										tap : () => {
											
											let nameInput;
											
											SkyDesktop.Confirm({
												okButtonTitle : '추가',
												msg : DIV({
													c : [nameInput = INPUT({
														style : {
															width : 222,
															padding : 8,
															border : '1px solid #999',
															borderRadius : 4
														},
														name : 'name',
														placeholder : '종류 이름'
													})]
												})
											}, () => {
												
												let name = nameInput.getValue();
												
												let kinds = objectData.kinds;
												if (kinds === undefined) {
													kinds = [];
												}
												
												let kindData = {};
												if (VALID.notEmpty(name) === true) {
													kindData.name = name;
												}
												
												kinds.push(kindData);
												
												BigWorld.ObjectModel.update({
													id : objectData.id,
													kinds : kinds
												}, {
													notValid : () => {
														//TODO
													},
													success : () => {
														//TODO
													}
												});
											});
										}
									}
								}), SkyDesktop.ToolbarButton({
									icon : IMG({
										src : BigWorld.R('objecteditor/menu/state.png')
									}),
									title : '상태 추가',
									on : {
										tap : () => {
											
											let idInput;
											let nameInput;
											
											SkyDesktop.Confirm({
												okButtonTitle : '추가',
												msg : DIV({
													c : [idInput = INPUT({
														style : {
															width : 222,
															padding : 8,
															border : '1px solid #999',
															borderRadius : 4
														},
														name : 'id',
														placeholder : '상태 ID'
													}), nameInput = INPUT({
														style : {
															marginTop : 10,
															width : 222,
															padding : 8,
															border : '1px solid #999',
															borderRadius : 4
														},
														name : 'name',
														placeholder : '상태 이름'
													})]
												})
											}, () => {
												
												let id = idInput.getValue();
												if (VALID.notEmpty(id) === true) {
													
													let name = nameInput.getValue();
													
													let states = objectData.states;
													if (states === undefined) {
														states = {};
													}
													
													// 상태가 없어야만 생성, 아니면 오류
													if (states[id] === undefined) {
														states[id] = {};
														
														if (VALID.notEmpty(name) === true) {
															states[id].name = name;
														}
														
														BigWorld.ObjectModel.update({
															id : objectData.id,
															states : states
														}, {
															notValid : () => {
																//TODO
															},
															success : () => {
																//TODO
															}
														});
													}
													
													else {
														//TODO:
													}
												}
											});
										}
									}
								})]
							})
						})
					}), TR({
						c : TD({
							c : SkyDesktop.HorizontalTabList({
								tabs : [SkyDesktop.Tab({
									size : 15,
									c : kindList = SkyDesktop.FileTree()
								}), SkyDesktop.Tab({
									size : 15,
									c : stateList = SkyDesktop.FileTree()
								}), content = SkyDesktop.Tab({
									size : 70
								})]
							})
						})
					})]
				}).appendTo(BODY);
				
				let addKind = (kindData) => {
					console.log(kindData);
				};
				
				EACH(objectData.kinds, addKind);
				
				let addState = (stateData, state) => {
					console.log(stateData, state);
				};
				
				EACH(objectData.states, addState);
			});
		});
		
		// 새로고침 중단
		window.addEventListener('beforeunload', (e) => {
			e.returnValue = null;
			return null;
		});

		inner.on('close', () => {
			wrapper.remove();
		});
	}
});

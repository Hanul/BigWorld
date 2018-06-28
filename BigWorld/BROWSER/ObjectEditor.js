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
				
				let showBasicSetting = () => {
					
					content.empty();
					
					content.append(DIV({
						style : {
							padding : 10
						},
						c : [
						UUI.VALID_FORM({
							errorMsgs : {
								category : {
									size : (validParams) => {
										return '카테고리 ID는 ' + validParams.max + '글자 이하로 입력해주시기 바랍니다.';
									}
								},
								'name.ko' : {
									size : (validParams) => {
										return '이름은 ' + validParams.max + '글자 이하로 입력해주시기 바랍니다.';
									}
								}
							},
							errorMsgStyle : {
								marginTop : 5,
								color : 'red'
							},
							style : {
								flt : 'left',
								backgroundColor : '#ccc',
								padding : 10,
								width : 300
							},
							c : [UUI.FULL_INPUT({
								name : 'category',
								placeholder : '카테고리 ID'
							}), UUI.FULL_INPUT({
								style : {
									marginTop : 10
								},
								name : 'name.ko',
								placeholder : '이름 (한국어)'
							}), UUI.BUTTON({
								style : {
									marginTop : 10
								},
								title : '타겟 지정'
							}), UUI.FULL_SUBMIT({
								style : {
									marginTop : 10
								},
								value : '저장하기'
							})],
							on : {
								submit : (e, form) => {
									
									let data = form.getData();
									
									data.id = objectData.id;
									
									BigWorld.ObjectModel.update(data, {
										notValid : form.showErrors,
										success : (savedData) => {
											console.log(savedData);
										}
									});
								}
							}
						}),
						
						CLEAR_BOTH()]
					}));
				};
				
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
									title : '기본 설정 화면',
									on : {
										tap : () => {
											showBasicSetting();
										}
									}
								}), SkyDesktop.ToolbarButton({
									icon : IMG({
										src : BigWorld.R('objecteditor/menu/kind.png')
									}),
									title : '종류 추가',
									on : {
										tap : () => {
											
											let form;
											
											SkyDesktop.Confirm({
												okButtonTitle : '추가',
												msg : form = FORM({
													c : [INPUT({
														style : {
															width : 222,
															padding : 8,
															border : '1px solid #999',
															borderRadius : 4
														},
														name : 'name.ko',
														placeholder : '종류 이름 (한국어)'
													})]
												})
											}, () => {
												
												let kinds = objectData.kinds;
												if (kinds === undefined) {
													kinds = [];
												}
												
												let kindData = {
													name : form.getData()
												};
												
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
											
											let form;
											
											SkyDesktop.Confirm({
												okButtonTitle : '추가',
												msg : form = FORM({
													c : [INPUT({
														style : {
															width : 222,
															padding : 8,
															border : '1px solid #999',
															borderRadius : 4
														},
														name : 'id',
														placeholder : '상태 ID'
													}), INPUT({
														style : {
															marginTop : 10,
															width : 222,
															padding : 8,
															border : '1px solid #999',
															borderRadius : 4
														},
														name : 'name.ko',
														placeholder : '상태 이름 (한국어)'
													})]
												})
											}, () => {
												
												let data = form.getData();
												
												if (VALID.notEmpty(data.id) === true) {
													
													let states = objectData.states;
													if (states === undefined) {
														states = {};
													}
													
													// 상태가 없어야만 생성, 아니면 오류
													if (states[data.id] === undefined) {
														states[data.id] = {};
														
														if (VALID.notEmpty(data.name) === true) {
															states[data.id].name = data.name;
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
				
				showBasicSetting();
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

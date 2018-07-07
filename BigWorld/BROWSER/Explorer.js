BigWorld.Explorer = CLASS({
	
	preset : () => {
		return VIEW;
	},
	
	init : (inner, self) => {
		
		TITLE('BigWorld Explorer');
		
		let nowFolderId;
		
		let folderList;
		let fileList;
		let wrapper = TABLE({
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
								src : BigWorld.R('explorer/menu/back.png')
							}),
							title : '뒤로가기'
						}), SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('explorer/menu/forward.png')
							}),
							title : '앞으로'
						}), SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('explorer/menu/up.png')
							}),
							title : '위로'
						}), SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('explorer/menu/search.png')
							}),
							title : '검색'
						}), SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('explorer/menu/sort.png')
							}),
							title : '정렬'
						}), SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('explorer/menu/folder.png')
							}),
							title : '새 폴더'
						}), SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('explorer/menu/object.png')
							}),
							title : '새 오브젝트',
							on : {
								tap : () => {
									
									let form;
									let firstInput;
									SkyDesktop.Confirm({
										okButtonTitle : '생성',
										msg : form = UUI.VALID_FORM({
											errorMsgs : {
												name : {
													notEmpty : '저장할 오브젝트명을 입력해주세요.',
													size : (validParams) => {
														return '최대 ' + validParams.max + '글자입니다.';
													}
												}
											},
											errorMsgStyle : {
												color : 'red'
											},
											c : [firstInput = INPUT({
												style : {
													width : 222,
													padding : 8,
													border : '1px solid #999',
													borderRadius : 4
												},
												name : 'name.ko',
												placeholder : '오브젝트명 (한국어)'
											})]
										})
									}, () => {
										
										let data = form.getData();
										data.folderId = nowFolderId;
										
										let isNotValid = false;
										
										BigWorld.ObjectModel.create(data, {
											notValid : (validErrors) => {
												form.showErrors(validErrors);
												isNotValid = true;
											},
											success : (r) => {
												console.log(r);
											}
										});
										
										if (isNotValid === true) {
											return false;
										}
									});
									
									firstInput.focus();
								}
							}
						}), SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('explorer/menu/stage.png')
							}),
							title : '새 스테이지',
							on : {
								tap : () => {
									
									let form;
									let firstInput;
									SkyDesktop.Confirm({
										okButtonTitle : '생성',
										msg : form = UUI.VALID_FORM({
											errorMsgs : {
												name : {
													notEmpty : '저장할 스테이지명을 입력해주세요.',
													size : (validParams) => {
														return '최대 ' + validParams.max + '글자입니다.';
													}
												}
											},
											errorMsgStyle : {
												color : 'red'
											},
											c : [firstInput = INPUT({
												style : {
													width : 222,
													padding : 8,
													border : '1px solid #999',
													borderRadius : 4
												},
												name : 'name.ko',
												placeholder : '스테이지명 (한국어)'
											})]
										})
									}, () => {
										
										let data = form.getData();
										data.folderId = nowFolderId;
										
										let isNotValid = false;
										
										BigWorld.StageModel.create(data, {
											notValid : (validErrors) => {
												form.showErrors(validErrors);
												isNotValid = true;
											},
											success : (r) => {
												console.log(r);
											}
										});
										
										if (isNotValid === true) {
											return false;
										}
									});
									
									firstInput.focus();
								}
							}
						})]
					})
				})
			}), TR({
				style : {
					height : '100%'
				},
				c : TD({
					c : SkyDesktop.HorizontalTabList({
						tabs : [folderList = SkyDesktop.Tab({
							size : 23,
							c : SkyDesktop.FileTree({
								items : {
									'root' : SkyDesktop.File({
										icon : IMG({
											src : BigWorld.R('explorer/drive.png')
										}),
										title : 'root'
									})
								}
							})
						}), fileList = SkyDesktop.Tab({
							size : 77
						})]
					})
				})
			})]
		}).appendTo(BODY);
		
		BigWorld.ObjectModel.onNewAndFindWatching({
			filter : {
				folderId : nowFolderId === undefined ? TO_DELETE : nowFolderId
			},
			sort : {
				createTime : 1
			}
		}, (objectData) => {
			
			fileList.append(UUI.BUTTON({
				style : {
					flt : 'left',
					padding : 10
				},
				icon : IMG({
					src : BigWorld.R('explorer/object.png')
				}),
				title : MSG(objectData.name),
				href : BigWorld.HREF('object/' + objectData.id),
				target : '_blank'
			}));
		});
		
		BigWorld.StageModel.onNewAndFindWatching({
			filter : {
				folderId : nowFolderId === undefined ? TO_DELETE : nowFolderId
			},
			sort : {
				createTime : 1
			}
		}, (stageData) => {
			
			fileList.append(UUI.BUTTON({
				style : {
					flt : 'left',
					padding : 10
				},
				icon : IMG({
					src : BigWorld.R('explorer/stage.png')
				}),
				title : MSG(stageData.name),
				href : BigWorld.HREF('stage/' + stageData.id),
				target : '_blank'
			}));
		});

		inner.on('close', () => {
			wrapper.remove();
		});
	}
});

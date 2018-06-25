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
								src : BigWorld.R('explorer/menu/factor.png')
							}),
							title : '새 요소',
							on : {
								tap : () => {
									
									let form;
									let firstInput;
									SkyDesktop.Confirm({
										okButtonTitle : '생성',
										msg : form = UUI.VALID_FORM({
											errorMsgs : {
												name : {
													notEmpty : '저장할 요소명을 입력해주세요.',
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
												name : 'name',
												placeholder : '요소 명'
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
						})]
					})
				})
			}), TR({
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
		
		// 기본 드래그 앤 드롭 막기
		let uploadForm;
		EVENT('dragover', (e) => {
			
			if (uploadForm === undefined) {
				
				uploadForm = UUI.FULL_UPLOAD_FORM({
					box : BigWorld,
					isMultiple : true,
					style : {
						position : 'fixed',
						left : fileList.getLeft(),
						top : fileList.getTop(),
						width : fileList.getWidth() - 15,
						height : fileList.getHeight() - 15
					},
					formStyle : {
						height : '100%',
						border : '2px dashed #e65700'
					},
					uploadingStyle : {
						backgroundColor : 'rgba(0, 0, 0, 0.5)'
					}
				}, {
					overSizeFile : () => {
						alert('업로드 용량을 초과하였습니다. ' + CONFIG.maxUploadFileMB + 'MB 이하의 파일을 올려주세요.');
						
						uploadForm.remove();
						uploadForm = undefined;
					},
					success : (fileDataSet) => {
						
						EACH(fileDataSet, (fileData) => {

							if (fileData.type === 'image/png') {

								BigWorld.ImageModel.create({
									folderId : nowFolderId,
									name : fileData.name,
									fileId : fileData.id,
									fileSize : fileData.size,
									fileType : fileData.type
								});

							} else {
								alert('PNG 파일만 등록 가능합니다.');
							}
						});
						
						uploadForm.remove();
						uploadForm = undefined;
					}
				}).appendTo(fileList);
			}
			
			e.stop();
		});
		
		BigWorld.ImageModel.onNewAndFindWatching({
			filter : {
				folderId : nowFolderId === undefined ? TO_DELETE : nowFolderId
			},
			sort : {
				createTime : 1
			}
		}, (imageData) => {
			
			fileList.append(A({
				style : {
					flt : 'left'
				},
				c : '이미지',
				href : BigWorld.RF(imageData.fileId),
				target : '_blank'
			}));
		});
		
		BigWorld.ObjectModel.onNewAndFindWatching({
			filter : {
				folderId : nowFolderId === undefined ? TO_DELETE : nowFolderId
			},
			sort : {
				createTime : 1
			}
		}, (objectData) => {
			
			fileList.append(A({
				style : {
					flt : 'left'
				},
				c : objectData.name,
				href : BigWorld.HREF('object/' + objectData.id),
				target : '_blank'
			}));
		});

		inner.on('close', () => {
			wrapper.remove();
		});
	}
});

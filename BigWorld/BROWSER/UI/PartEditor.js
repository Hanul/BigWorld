BigWorld.PartEditor = CLASS({
	
	preset : () => {
		return DIV;
	},
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.partInfo
		//REQUIRED: params.kind
		//OPTIONAL: params.direction
		//REQUIRED: params.save
		//REQUIRED: params.removePart
		
		let partInfo = params.partInfo;
		let kind = params.kind;
		let direction = params.direction;
		
		let saveHandler = params.save;
		let removePartHandler = params.removePart;
		
		let imageId;
		let isChangeToSave;
		
		let form;
		let xInput, yInput;
		let imagePreviewWrapper;
		
		self.append(TABLE({
			c : TR({
				c : [
				// 정보 수정 폼
				TD({
					style : {
						width : 250
					},
					c : form = FORM({
						style : {
							position : 'relative',
							backgroundColor : '#ccc',
							padding : 10,
							width : 230
						},
						c : [
						UUI.FULL_INPUT({
							style : {
								flt : 'left',
								width : 100
							},
							name : 'name.ko',
							placeholder : '이름 (한국어)',
							on : {
								change : () => {
									if (isChangeToSave === true) {
										form.submit();
									}
								}
							}
						}),
						
						UUI.FULL_INPUT({
							style : {
								flt : 'right',
								width : 100
							},
							name : 'zIndex',
							placeholder : 'z-index',
							on : {
								change : () => {
									if (isChangeToSave === true) {
										form.submit();
									}
								}
							}
						}),
						
						UUI.FULL_INPUT({
							style : {
								marginTop : 10,
								flt : 'left',
								width : 100
							},
							name : 'frameCount',
							placeholder : '프레임 수',
							on : {
								change : () => {
									if (isChangeToSave === true) {
										form.submit();
									}
								}
							}
						}),
						
						UUI.FULL_INPUT({
							style : {
								marginTop : 10,
								flt : 'right',
								width : 100
							},
							name : 'fps',
							placeholder : 'FPS',
							on : {
								change : () => {
									if (isChangeToSave === true) {
										form.submit();
									}
								}
							}
						}),
						
						DIV({
							style : {
								marginTop : 10,
								flt : 'left',
								width : 110
							},
							c : [xInput = UUI.FULL_INPUT({
								style : {
									flt : 'left',
									width : 48
								},
								name : 'x',
								placeholder : 'X',
								on : {
									change : () => {
										if (isChangeToSave === true) {
											form.submit();
										}
									}
								}
							}), UUI.ICON_BUTTON({
								style : {
									flt : 'left',
									padding : 5,
									lineHeight : 0
								},
								icon : IMG({
									src : BigWorld.R('parteditor/left.png')
								}),
								on : {
									tap : () => {
										moveLeft1Pixel();
										saveHandler();
									}
								}
							}), UUI.ICON_BUTTON({
								style : {
									flt : 'left',
									padding : 5,
									lineHeight : 0
								},
								icon : IMG({
									src : BigWorld.R('parteditor/right.png')
								}),
								on : {
									tap : () => {
										moveRight1Pixel();
										saveHandler();
									}
								}
							})]
						}),
						
						DIV({
							style : {
								marginTop : 10,
								flt : 'right',
								width : 110
							},
							c : [yInput = UUI.FULL_INPUT({
								style : {
									flt : 'left',
									width : 48
								},
								name : 'y',
								placeholder : 'Y',
								on : {
									change : () => {
										if (isChangeToSave === true) {
											form.submit();
										}
									}
								}
							}), UUI.ICON_BUTTON({
								style : {
									flt : 'left',
									padding : 5,
									lineHeight : 0
								},
								icon : IMG({
									src : BigWorld.R('parteditor/up.png')
								}),
								on : {
									tap : () => {
										moveUp1Pixel();
										saveHandler();
									}
								}
							}), UUI.ICON_BUTTON({
								style : {
									flt : 'left',
									padding : 5,
									lineHeight : 0
								},
								icon : IMG({
									src : BigWorld.R('parteditor/down.png')
								}),
								on : {
									tap : () => {
										moveDown1Pixel();
										saveHandler();
									}
								}
							})]
						}),
						
						CLEAR_BOTH(),
						
						UUI.FULL_UPLOAD_FORM({
							style : {
								marginTop : 10
							},
							box : BigWorld
						}, {
							// 용량 초과
							overSizeFile : () => {
								SkyDesktop.Alert({
									msg : '업로드 용량을 초과했습니다. ' + CONFIG.maxUploadFileMB + 'MB 이하의 파일을 올려주세요.'
								});
							},
							
							success : (fileData) => {
								
								if (fileData.type === 'image/png') {
									setImageId(fileData.id);
									form.submit();
								}
								
								else {
									SkyDesktop.Alert({
										msg : 'PNG 파일만 등록할 수 있습니다.'
									});
								}
							}
						}),
						
						// 파트 제거 버튼
						UUI.ICON_BUTTON({
							style : {
								position : 'absolute',
								right : -10,
								top : -10
							},
							icon : IMG({
								src : BigWorld.R('parteditor/x.png')
							}),
							on : {
								tap : () => {
									
									SkyDesktop.Confirm({
										msg : '정말 [' + MSG(partInfo.name) + '] 파트를 제거하시겠습니까?'
									}, () => {
										removePartHandler();
										self.remove();
									});
								}
							}
						})],
						on : {
							submit : () => {
								
								let data = form.getData();
								
								partInfo.name = data.name;
								partInfo.zIndex = INTEGER(data.zIndex);
								partInfo.frameCount = INTEGER(data.frameCount);
								partInfo.fps = data.fps === '' ? TO_DELETE : INTEGER(data.fps);
								partInfo.x = INTEGER(data.x);
								partInfo.y = INTEGER(data.y);
								
								if (direction === undefined) {
									partInfo.frames[kind] = imageId;
								}
								
								else {
									
									if (partInfo.frames[kind] === undefined) {
										partInfo.frames[kind] = {};
									}
									
									partInfo.frames[kind][direction + 'ImageId'] = imageId;
								}
								
								saveHandler();
							}
						}
					})
				}),
				
				// 이미지 미리보기
				imagePreviewWrapper = TD({
					style : {
						paddingLeft : 15
					}
				})]
			})
		}));
		
		form.setData(partInfo);
		
		let setImageId = (_imageId) => {
			imageId = _imageId;
			
			imagePreviewWrapper.empty();
			imagePreviewWrapper.append(IMG({
				style : {
					border : '1px solid #ccc',
					maxHeight : 160
				},
				src : BigWorld.RF(imageId)
			}));
		};
		
		if (partInfo.frames[kind] !== undefined) {
			
			if (direction === undefined) {
				setImageId(partInfo.frames[kind]);
			}
			
			else if (partInfo.frames[kind][direction + 'ImageId'] !== undefined) {
				setImageId(partInfo.frames[kind][direction + 'ImageId']);
			}
		}
		
		isChangeToSave = true;
		
		// 왼쪽으로 1픽셀 이동시킵니다.
		let moveLeft1Pixel = self.moveLeft1Pixel = () => {
			isChangeToSave = false;
			
			partInfo.x -= 1;
			xInput.setValue(partInfo.x);
			
			isChangeToSave = true;
		};
		
		// 오른쪽으로 1픽셀 이동시킵니다.
		let moveRight1Pixel = self.moveRight1Pixel = () => {
			isChangeToSave = false;
			
			partInfo.x += 1;
			xInput.setValue(partInfo.x);
			
			isChangeToSave = true;
		};
		
		// 위로 1픽셀 이동시킵니다.
		let moveUp1Pixel = self.moveUp1Pixel = () => {
			isChangeToSave = false;
			
			partInfo.y -= 1;
			yInput.setValue(partInfo.y);
			
			isChangeToSave = true;
		};
		
		// 아래로 1픽셀 이동시킵니다.
		let moveDown1Pixel = self.moveDown1Pixel = () => {
			isChangeToSave = false;
			
			partInfo.y += 1;
			yInput.setValue(partInfo.y);
			
			isChangeToSave = true;
		};
	}
});
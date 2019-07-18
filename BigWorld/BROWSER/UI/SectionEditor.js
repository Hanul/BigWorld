BigWorld.SectionEditor = CLASS({
	
	preset : () => {
		return DIV;
	},
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.sectionMap
		//REQUIRED: params.elementData
		//OPITONAL: params.y
		//OPITONAL: params.isTileMode
		//REQUIRED: params.save
		//REQUIRED: params.changeDirection
		//REQUIRED: params.refresh
		
		let sectionMap = params.sectionMap;
		let elementData = params.elementData;
		
		let y = params.y;
		let isTileMode = params.isTileMode;
		
		if (y === undefined) {
			y = 0;
		}
		
		let saveHandler = params.save;
		let changeDirectionHandler = params.changeDirection;
		let refreshHandler = params.refresh;
		
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
		
		let isControlMode;
		
		let keydownEvent = EVENT('keydown', (e) => {
			if (e.getKey() === 'Control') {
				isControlMode = true;
			}
		});
		
		let keyupEvent = EVENT('keyup', (e) => {
			if (e.getKey() === 'Control') {
				isControlMode = false;
			}
		});
		
		self.on('remove', () => {
			keydownEvent.remove();
			keyupEvent.remove();
		});
		
		if (sectionEditorStore.get('isToShowSection') === undefined) {
			sectionEditorStore.save({
				name : 'isToShowSection',
				value : true
			});
		}
		
		let sectionMapPreview;
		
		let refresh = self.refresh = RAR(() => {
			
			previewScreen.empty();
			
			// 가운데 점과 선을 그립니다.
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
			
			refreshHandler(previewScreen, direction);
			
			previewScreen.append(sectionMapPreview = BigWorld.SectionMapPreview({
				
				sectionMap : sectionMap,
				
				leftSectionLevel : elementData.leftSectionLevel,
				upSectionLevel : elementData.upSectionLevel,
				rightSectionLevel : elementData.rightSectionLevel,
				downSectionLevel : elementData.downSectionLevel,
				
				direction : direction,
				isEditMode : true,
				selectSection : (sectionCol, sectionRow) => {
					
					let section = sectionMap[sectionRow][sectionCol];
					
					// Control을 누르고 있으면 트리거
					if (isControlMode === true) {
						
						if (section.isTrigger === true) {
							delete section.isTrigger;
						} else {
							section.isTrigger = true;
						}
						
						delete section.isBlock;
					}
					
					// 블록
					else {
						
						if (section.isTrigger !== true) {
							
							if (section.isBlock === true) {
								delete section.isBlock;
							} else {
								section.isBlock = true;
							}
						}
						
						delete section.isTrigger;
					}
					
					sectionMapPreview.refresh();
					
					saveHandler();
				}
			}));
			
			if (sectionEditorStore.get('isToShowSection') !== true) {
				sectionMapPreview.hide();
			}
		});
		
		self.addStyle({
			position : 'relative'
		});
		
		self.append(UUI.FULL_CHECKBOX({
			style : {
				position : 'absolute',
				left : 10,
				top : 7,
				fontSize : 12
			},
			label : '섹션 보기',
			value : sectionEditorStore.get('isToShowSection'),
			on : {
				change : (e, input) => {
					
					if (input.getValue() === true) {
						sectionMapPreview.show();
					} else {
						sectionMapPreview.hide();
					}
					
					sectionEditorStore.save({
						name : 'isToShowSection',
						value : input.getValue()
					});
				}
			}
		}));
		
		// 회전 컨트롤러
		if (isTileMode !== true) {
			
			self.append(DIV({
				style : {
					marginLeft : 10,
					flt : 'left'
				},
				c : [
				
				DIV({
					style : {
						backgroundColor : '#ccc',
						color : '#000',
						padding : 10
					},
					c : [H1({
						style : {
							marginBottom : 10,
							textAlign : 'center',
							fontWeight : 'bold'
						},
						c : '섹션 크기 늘리기'
					}), SkyDesktop.Button({
						style : {
							flt : 'left',
							padding : 7
						},
						icon : IMG({
							src : BigWorld.R('sectioneditor/arrow/rectangle/extend/left.png')
						}),
						spacing : 0,
						on : {
							tap : () => {
								
								elementData.leftSectionLevel += 1;
								
								EACH(sectionMap, (sections) => {
									sections.unshift({
										z : 0
									});
								});
								
								saveHandler();
							}
						}
					}), SkyDesktop.Button({
						style : {
							marginLeft : 10,
							flt : 'left',
							padding : 7
						},
						icon : IMG({
							src : BigWorld.R('sectioneditor/arrow/rectangle/extend/up.png')
						}),
						spacing : 0,
						on : {
							tap : () => {
								
								elementData.upSectionLevel += 1;
								
								let sections = [];
								REPEAT(elementData.leftSectionLevel + elementData.rightSectionLevel + 1, () => {
									sections.push({
										z : 0
									});
								});
								sectionMap.unshift(sections);
								
								saveHandler();
							}
						}
					}), SkyDesktop.Button({
						style : {
							marginLeft : 10,
							flt : 'left',
							padding : 7
						},
						icon : IMG({
							src : BigWorld.R('sectioneditor/arrow/rectangle/extend/right.png')
						}),
						spacing : 0,
						on : {
							tap : () => {
								
								elementData.rightSectionLevel += 1;
								
								EACH(sectionMap, (sections) => {
									sections.push({
										z : 0
									});
								});
								
								saveHandler();
							}
						}
					}), SkyDesktop.Button({
						style : {
							marginLeft : 10,
							flt : 'left',
							padding : 7
						},
						icon : IMG({
							src : BigWorld.R('sectioneditor/arrow/rectangle/extend/down.png')
						}),
						spacing : 0,
						on : {
							tap : () => {
								
								elementData.downSectionLevel += 1;
								
								let sections = [];
								REPEAT(elementData.leftSectionLevel + elementData.rightSectionLevel + 1, () => {
									sections.push({
										z : 0
									});
								});
								sectionMap.push(sections);
								
								saveHandler();
							}
						}
					}), CLEAR_BOTH()]
				}),
				
				DIV({
					style : {
						marginTop : 10,
						backgroundColor : '#ccc',
						color : '#000',
						padding : 10
					},
					c : [H1({
						style : {
							marginBottom : 10,
							textAlign : 'center',
							fontWeight : 'bold'
						},
						c : '섹션 크기 줄이기'
					}), SkyDesktop.Button({
						style : {
							flt : 'left',
							padding : 7
						},
						icon : IMG({
							src : BigWorld.R('sectioneditor/arrow/rectangle/shrink/right.png')
						}),
						spacing : 0,
						on : {
							tap : () => {
								
								if (elementData.leftSectionLevel >= 1) {
									elementData.leftSectionLevel -= 1;
									
									EACH(sectionMap, (sections) => {
										sections.shift();
									});
									
									saveHandler();
								}
							}
						}
					}), SkyDesktop.Button({
						style : {
							marginLeft : 10,
							flt : 'left',
							padding : 7
						},
						icon : IMG({
							src : BigWorld.R('sectioneditor/arrow/rectangle/shrink/down.png')
						}),
						spacing : 0,
						on : {
							tap : () => {
								
								if (elementData.upSectionLevel >= 1) {
									elementData.upSectionLevel -= 1;
									
									sectionMap.shift();
									
									saveHandler();
								}
							}
						}
					}), SkyDesktop.Button({
						style : {
							marginLeft : 10,
							flt : 'left',
							padding : 7
						},
						icon : IMG({
							src : BigWorld.R('sectioneditor/arrow/rectangle/shrink/left.png')
						}),
						spacing : 0,
						on : {
							tap : () => {
								
								if (elementData.rightSectionLevel >= 1) {
									elementData.rightSectionLevel-= 1;
									
									EACH(sectionMap, (sections) => {
										sections.pop();
									});
									
									saveHandler();
								}
							}
						}
					}), SkyDesktop.Button({
						style : {
							marginLeft : 10,
							flt : 'left',
							padding : 7
						},
						icon : IMG({
							src : BigWorld.R('sectioneditor/arrow/rectangle/shrink/up.png')
						}),
						spacing : 0,
						on : {
							tap : () => {
								
								if (elementData.downSectionLevel >= 1) {
									elementData.downSectionLevel -= 1;
									
									sectionMap.pop();
									
									saveHandler();
								}
							}
						}
					}), CLEAR_BOTH()]
				}),
				
				DIV({
					style : {
						marginTop : 10,
						backgroundColor : '#ccc',
						color : '#000',
						padding : 10
					},
					c : [H1({
						style : {
							marginBottom : 10,
							textAlign : 'center',
							fontWeight : 'bold'
						},
						c : '회전시키기'
					}), SkyDesktop.Button({
						style : {
							flt : 'left'
						},
						icon : IMG({
							src : BigWorld.R('sectioneditor/rotate/down.png')
						}),
						spacing : 0,
						on : {
							tap : () => {
								direction = 'down';
								changeDirectionHandler(direction);
								refresh();
							}
						}
					}), SkyDesktop.Button({
						style : {
							marginLeft : 10,
							flt : 'left'
						},
						icon : IMG({
							src : BigWorld.R('sectioneditor/rotate/left.png')
						}),
						spacing : 0,
						on : {
							tap : () => {
								direction = 'left';
								changeDirectionHandler(direction);
								refresh();
							}
						}
					}), SkyDesktop.Button({
						style : {
							marginLeft : 10,
							flt : 'left'
						},
						icon : IMG({
							src : BigWorld.R('sectioneditor/rotate/up.png')
						}),
						spacing : 0,
						on : {
							tap : () => {
								direction = 'up';
								changeDirectionHandler(direction);
								refresh();
							}
						}
					}), SkyDesktop.Button({
						style : {
							marginLeft : 10,
							flt : 'left'
						},
						icon : IMG({
							src : BigWorld.R('sectioneditor/rotate/right.png')
						}),
						spacing : 0,
						on : {
							tap : () => {
								direction = 'right';
								changeDirectionHandler(direction);
								refresh();
							}
						}
					}), CLEAR_BOTH()]
				})]
			}));
		}
		
		self.append(CLEAR_BOTH());
		
		let setScale = self.setScale = (scale) => {
			previewScreen.setScale(scale);
			refresh();
		};
		
		let getDirection = self.getDirection = () => {
			return direction;
		};
	}
});
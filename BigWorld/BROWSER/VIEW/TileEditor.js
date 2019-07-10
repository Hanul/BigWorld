BigWorld.TileEditor = CLASS({
	
	preset : () => {
		return VIEW;
	},
	
	init : (inner, self) => {
		
		TITLE('BigWorld 타일 에디터');
		
		let tileEditorStore = BigWorld.STORE('tileEditorStore');
		
		let nowTileId;
		let nowTileData;
		let nowKind;
		let nowState;
		
		let rootKind;
		let rootState;
		let selectedKind;
		let selectedState;
		let editorWrapper;
		
		let isRemoved;
		
		let wrapper = TABLE({
			style : {
				position : 'absolute',
				width : '100%',
				height : '100%'
			},
			c : [
			
			// 상단 메뉴
			TR({
				c : TD({
					style : {
						height : 28
					},
					c : SkyDesktop.Toolbar({
						buttons : [
						
						// 종류 추가 버튼
						SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('tileeditor/menu/kind.png')
							}),
							title : '종류 추가',
							on : {
								tap : () => {
									
									BigWorld.ValidPrompt({
										title : '종류 추가',
										inputName : 'name.ko',
										placeholder : '종류 이름',
										errorMsgs : {
											'name.ko' : {
												size : (validParams) => {
													return '최대 ' + validParams.max + '글자입니다.';
												}
											}
										},
										okButtonTitle : '추가'
									}, (kindName, showErrors, removePrompt) => {
										
										if (kindName.trim() === '') {
											SkyDesktop.Alert({
												msg : '추가할 종류 이름을 입력해주세요.'
											});
										} else {
											
											let kindInfo = {
												name : {
													ko : kindName
												}
											};
											
											// 타일을 수정합니다.
											BigWorld.TileModel.update({
												id : nowTileId,
												$push : {
													kinds : kindInfo
												}
											}, {
												notValid : showErrors,
												success : () => {
													
													addKind(nowTileData.kinds.length, kindInfo);
													nowTileData.kinds.push(kindInfo);
													
													removePrompt();
												}
											});
										}
									});
								}
							}
						}),
						
						// 삭제 버튼
						SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('tileeditor/menu/remove.png')
							}),
							title : '타일 삭제',
							on : {
								tap : () => {
									
									SkyDesktop.Confirm({
										msg : '타일을 삭제하시겠습니까?',
										okButtonTitle : '삭제'
									}, () => {
										
										let loadingBar = SkyDesktop.LoadingBar('lime');
										
										BigWorld.TileModel.remove(nowTileId, () => {
											isRemoved = true;
											close();
										});
									});
								}
							}
						})]
					})
				})
			}),
			
			// 하단 내용
			TR({
				style : {
					height : '100%'
				},
				c : TD({
					c : SkyDesktop.HorizontalTabList({
						tabs : [
						
						// 종류 목록
						SkyDesktop.Tab({
							size : 15,
							c : SkyDesktop.FileTree({
								items : {
									
									// root 종류
									root : rootKind = SkyDesktop.Folder({
										style : {
											cursor : 'pointer'
										},
										icon : IMG({
											src : BigWorld.R('tileeditor/menu/kind.png')
										}),
										title : '종류',
										isToNotSort : true,
										on : {
											
											// 열리고 닫혀도 아이콘의 변경이 없어야 합니다.
											open : (e, item) => {
												item.setIcon(IMG({
													src : BigWorld.R('tileeditor/menu/kind.png')
												}));
											},
											close : (e, item) => {
												item.setIcon(IMG({
													src : BigWorld.R('tileeditor/menu/kind.png')
												}));
											}
										}
									})
								}
							})
						}),
						
						// 상태 목록
						SkyDesktop.Tab({
							size : 15,
							c : SkyDesktop.FileTree({
								items : {
									
									// root 상태
									root : rootState = SkyDesktop.Folder({
										style : {
											cursor : 'pointer'
										},
										icon : IMG({
											src : BigWorld.R('tileeditor/menu/state.png')
										}),
										title : '상태',
										isToNotSort : true,
										on : {
											
											// 열리고 닫혀도 아이콘의 변경이 없어야 합니다.
											open : (e, item) => {
												item.setIcon(IMG({
													src : BigWorld.R('tileeditor/menu/state.png')
												}));
											},
											close : (e, item) => {
												item.setIcon(IMG({
													src : BigWorld.R('tileeditor/menu/state.png')
												}));
											}
										}
									})
								}
							})
						}),
						
						// 편집 뷰
						SkyDesktop.Tab({
							size : 70,
							c : editorWrapper = DIV({
								style : {
									padding : 10
								}
							})
						})]
					})
				})
			})]
		}).appendTo(BODY);
		
		// root 종류와 상태는 처음부터 열려있습니다.
		rootKind.open();
		rootState.open();
		
		// 현재 선택된 종류와 상태의 내용을 수정하는 에디터를 엽니다.
		let openEditor = () => {
			editorWrapper.empty();
			
			if (nowKind !== undefined && nowState !== undefined) {
				
				editorWrapper.append(H3({
					c : '선택된 종류: ' + selectedKind.getTitle() + ' / 선택된 상태: ' + selectedState.getTitle()
				}));
				
				// 섹션 편집
				editorWrapper.append(BigWorld.SectionEditor({
					style : {
						marginTop : 10
					},
					sectionMap : nowTileData.sectionMap
				}));
				
				// 파트 편집
				editorWrapper.append(BigWorld.PartEditor({
					style : {
						marginTop : 10
					},
					stateInfo : nowTileData.states[nowState],
					kind : nowKind
				}));
			}
		};
		
		EACH([
			'center',
			'left',
			'leftTop',
			'top',
			'rightTop',
			'right',
			'rightBottom',
			'bottom',
			'leftBottom',
			'fillLeftBottom',
			'fillLeftTop',
			'fillRightTop',
			'fillRightBottom'
		], (stateName) => {
			
			let state;
			
			rootState.addItem({
				key : stateName,
				item : state = SkyDesktop.File({
					style : {
						cursor : 'pointer'
					},
					icon : IMG({
						src : BigWorld.R('tileeditor/state/' + stateName + '.png')
					}),
					title : stateName.replace(/([A-Z]+)*([A-Z][a-z])/g, '$1 $2').toLowerCase(),
					on : {
						tap : () => {
							
							if (selectedState !== undefined) {
								selectedState.deselect();
							}
							
							state.select();
							selectedState = state;
							
							nowState = stateName;
							openEditor();
						}
					}
				})
			});
		});
		
		let addKind = (index, kindInfo) => {
			
			let kind;
			
			rootKind.addItem({
				key : index,
				item : kind = SkyDesktop.File({
					style : {
						cursor : 'pointer'
					},
					title : MSG(kindInfo.name),
					on : {
						tap : () => {
							
							if (selectedKind !== undefined) {
								selectedKind.deselect();
							}
							
							kind.select();
							selectedKind = kind;
							
							nowKind = index;
							openEditor();
						}
					}
				})
			});
		};
		
		inner.on('paramsChange', (params) => {
			nowTileId = params.tileId;
			
			// 초기화
			selectedKind = undefined;
			rootKind.removeAllItems();
			editorWrapper.empty();
			
			// 타일 데이터를 불러옵니다.
			BigWorld.TileModel.get(nowTileId, (tileData) => {
				nowTileData = tileData;
				
				console.log(tileData);
				
				// 종류들 생성
				EACH(tileData.kinds, (kindInfo, i) => {
					addKind(i, kindInfo);
				});
				
				// 맨 처음에는 첫 종류와 첫 상태를 열기
				rootKind.getItem(0).tap();
				rootState.getItem('center').tap();
			});
		});
		
		// 새로고침 막기
		window.addEventListener('beforeunload', (e) => {
			if (isRemoved !== true) {
				e.returnValue = null;
				return null;
			}
		});
		
		// 틀 어긋난 부분 수정
		DELAY(0.2, () => {
			EVENT.fireAll('resize');
		});

		inner.on('close', () => {
			wrapper.remove();
		});
	}
});
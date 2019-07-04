
						}), SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('explorer/menu/item.png')
							}),
							title : '새 아이템',
							on : {
								tap : () => {
									
									let selectedObjectId;
									
									let form;
									let firstInput;
									SkyDesktop.Confirm({
										okButtonTitle : '생성',
										msg : form = UUI.VALID_FORM({
											errorMsgs : {
												name : {
													notEmpty : '저장할 오브젝트명을 입력해주세요.'
												},
												'name.ko' : {
													size : (validParams) => {
														return '최대 ' + validParams.max + '글자입니다.';
													}
												}
											},
											errorMsgStyle : {
												color : 'red'
											},
											c : [UUI.BUTTON_H({
												icon : IMG({
													src : BigWorld.R('stageeditor/object.png')
												}),
												spacing : 10,
												title : '대상 객체 선택',
												on : {
													tap : (e, button) => {
														BigWorld.CreateSelectObjectPopup((selectedObjectData) => {
															selectedObjectId = selectedObjectData.id;
															button.setTitle(MSG(selectedObjectData.name));
														});
													}
												}
											}), firstInput = INPUT({
												style : {
													marginTop : 10,
													width : 222,
													padding : 8,
													border : '1px solid #999',
													borderRadius : 4
												},
												name : 'name.ko',
												placeholder : '아이템명 (한국어)'
											})]
										})
									}, () => {
										
										let data = form.getData();
										data.objectId = selectedObjectId;
										data.folderId = nowFolderId;
										
										let isNotValid = false;
										
										BigWorld.ItemModel.create(data, {
											notValid : (validErrors) => {
												form.showErrors(validErrors);
												
												if (validErrors.objectId !== undefined) {
													SkyDesktop.Alert({
														msg : '대상 객체를 선택해주세요.'
													});
												}
												
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
				
		let loadFolders = (parentFolderList, folderId) => {
			
			let folderList = folderId === undefined ? rootFolderList : parentFolderList;
			
			// 폴더들을 불러옵니다.
			let exitFoldersWatchingRoom = BigWorld.FolderModel.onNewAndFindWatching({
				properties : {
					folderId : folderId === undefined ? TO_DELETE : folderId
				},
				sort : {
					createTime : 1
				}
			}, (folderData, addUpdateHandler, addRemoveHandler, exit) => {
				
				let item;
				folderList.addItem({
					key : folderData.id,
					item : item = SkyDesktop.Folder({

							contextmenu : (e) => {
								
								let contextMenu = SkyDesktop.ContextMenu({
									e : e,
									c : [SkyDesktop.ContextMenuItem({
										title : '이름 변경',
										icon : IMG({
											src : BigWorld.R('objecteditor/menu/edit.png')
										}),
										on : {
											tap : () => {
												
												let form;
												
												SkyDesktop.Confirm({
													okButtonTitle : '저장',
													msg : form = FORM({
														c : [INPUT({
															style : {
																width : 222,
																padding : 8,
																border : '1px solid #999',
																borderRadius : 4
															},
															name : 'name',
															placeholder : '폴더 이름'
														})]
													})
												}, () => {
													
													let loadingBar = SkyDesktop.LoadingBar('lime');
													
													let isValid = true;
													BigWorld.FolderModel.update({
														id : folderData.id,
														name : form.getData().name
													}, {
														notValid : (validErrors) => {
															loadingBar.done();
															
															SkyDesktop.Alert({
																msg : '검증에 실패하였습니다. 값에 오류가 없는지 확인해주시기 바랍니다.'
															});
															isValid = false;
														},
														success : () => {
															loadingBar.done();
														}
													});
													
													return isValid;
												});
												
												form.setData(folderData);
												
												contextMenu.remove();
											}
										}
									}), SkyDesktop.ContextMenuItem({
										title : '삭제',
										icon : IMG({
											src : BigWorld.R('objecteditor/menu/delete.png')
										}),
										on : {
											tap : () => {
												
												SkyDesktop.Confirm({
													msg : '정말 삭제하시겠습니까?'
												}, () => {
													
													let loadingBar = SkyDesktop.LoadingBar('lime');
													
													BigWorld.FolderModel.remove(folderData.id, () => {
														loadingBar.done();
													});
												});
												
												contextMenu.remove();
											}
										}
									})]
								});
								
								e.stop();
							}
						}
					})
				});
				
				if (folderData.id === nowFolderId) {
					
					if (selectedItem !== undefined) {
						selectedItem.deselect();
					}
					item.select();
					selectedItem = item;
				}
				
				addUpdateHandler((newFolderData) => {
					if (newFolderData.folderId !== folderId) {
						exit();
						item.remove();
					} else {
						item.setTitle(newFolderData.name);
					}
				});
				
				addRemoveHandler(() => {
					folderList.removeItem(folderData.id);
				});
			});
			
			folderList.on('remove', () => {
				exitFoldersWatchingRoom();
			});
		};
		
			NEXT([
			(next) => {
				
				// 폴더들을 불러옵니다.
				exitSubFoldersWatchingRoom = BigWorld.FolderModel.onNewAndFindWatching({
					properties : {
						folderId : nowFolderId === undefined ? TO_DELETE : nowFolderId
					},
					sort : {
						createTime : 1
					}
				}, {
					handler : (folderData, addUpdateHandler, addRemoveHandler, exit) => {
						
						let item;
						fileList.append(item = UUI.BUTTON({
							style : {
								flt : 'left',
								padding : 10,
								height : 120
							},
							icon : IMG({
								src : BigWorld.R('explorer/factor/folder.png'),
								on : {
									touchstart : (e) => {
										e.stopDefault();
									}
								}
							}),
							title : folderData.name,
							on : {

								contextmenu : (e) => {
									
									let contextMenu = SkyDesktop.ContextMenu({
										e : e,
										c : [SkyDesktop.ContextMenuItem({
											title : '이름 변경',
											icon : IMG({
												src : BigWorld.R('objecteditor/menu/edit.png')
											}),
											on : {
												tap : () => {
													
													let form;
													
													SkyDesktop.Confirm({
														okButtonTitle : '저장',
														msg : form = FORM({
															c : [INPUT({
																style : {
																	width : 222,
																	padding : 8,
																	border : '1px solid #999',
																	borderRadius : 4
																},
																name : 'name',
																placeholder : '폴더 이름'
															})]
														})
													}, () => {
														
														let loadingBar = SkyDesktop.LoadingBar('lime');
														
														let isValid = true;
														BigWorld.FolderModel.update({
															id : folderData.id,
															name : form.getData().name
														}, {
															notValid : (validErrors) => {
																loadingBar.done();
																
																SkyDesktop.Alert({
																	msg : '검증에 실패하였습니다. 값에 오류가 없는지 확인해주시기 바랍니다.'
																});
																isValid = false;
															},
															success : () => {
																loadingBar.done();
															}
														});
														
														return isValid;
													});
													
													form.setData(folderData);
													
													contextMenu.remove();
												}
											}
										}), SkyDesktop.ContextMenuItem({
											title : '삭제',
											icon : IMG({
												src : BigWorld.R('objecteditor/menu/delete.png')
											}),
											on : {
												tap : () => {
													
													SkyDesktop.Confirm({
														msg : '정말 삭제하시겠습니까?'
													}, () => {
														
														let loadingBar = SkyDesktop.LoadingBar('lime');
														
														BigWorld.FolderModel.remove(folderData.id, () => {
															loadingBar.done();
														});
													});
													
													contextMenu.remove();
												}
											}
										})]
									});
									
									e.stop();
								}
							}
						}));
						
						addUpdateHandler((newFolderData) => {
							if (newFolderData.folderId !== nowFolderId) {
								exit();
								item.remove();
							} else {
								item.setTitle(newFolderData.name);
							}
						});
						
						addRemoveHandler(() => {
							item.remove();
						});
					},
					success : next
				});
			},
			
			(next) => {
				return () => {
					
					// 스테이지들을 불러옵니다.
					exitStagesWatchingRoom = BigWorld.StageModel.onNewAndFindWatching({
						properties : {
							folderId : nowFolderId === undefined ? TO_DELETE : nowFolderId
						},
						sort : {
							createTime : 1
						}
					}, {
						handler : (stageData, addUpdateHandler, addRemoveHandler) => {
							
							let item;
							fileList.append(item = UUI.BUTTON({
								style : {
									flt : 'left',
									padding : 10,
									height : 120
								},
								icon : IMG({
									src : BigWorld.R('explorer/factor/stage.png'),
									on : {
										touchstart : (e) => {
											e.stopDefault();
										}
									}
								}),
								title : MSG(stageData.name) === undefined ? 'Unknown' : MSG(stageData.name),
								href : BigWorld.HREF('stage/' + stageData.id),
								target : '_blank',
								on : {
									touchstart : (e) => {
										
										draggingInfo = {
											type : 'stage',
											id : stageData.id,
											title : MSG(stageData.name) === undefined ? 'Unknown' : MSG(stageData.name)
										};
										
										startDraggingLeft = e.getLeft();
										startDraggingTop = e.getTop();
									},
									contextmenu : (e) => {
										
										let contextMenu = SkyDesktop.ContextMenu({
											e : e,
											c : [SkyDesktop.ContextMenuItem({
												title : '이름 변경',
												icon : IMG({
													src : BigWorld.R('objecteditor/menu/edit.png')
												}),
												on : {
													tap : () => {
														
														let form;
														
														SkyDesktop.Confirm({
															okButtonTitle : '저장',
															msg : form = FORM({
																c : [INPUT({
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
															
															let loadingBar = SkyDesktop.LoadingBar('lime');
															
															let isValid = true;
															BigWorld.StageModel.update({
																id : stageData.id,
																name : form.getData().name
															}, {
																notValid : (validErrors) => {
																	loadingBar.done();
																	
																	SkyDesktop.Alert({
																		msg : '검증에 실패하였습니다. 값에 오류가 없는지 확인해주시기 바랍니다.'
																	});
																	isValid = false;
																},
																success : () => {
																	loadingBar.done();
																}
															});
															
															return isValid;
														});
														
														form.setData(stageData);
														
														contextMenu.remove();
													}
												}
											}), SkyDesktop.ContextMenuItem({
												title : '삭제',
												icon : IMG({
													src : BigWorld.R('objecteditor/menu/delete.png')
												}),
												on : {
													tap : () => {
														
														SkyDesktop.Confirm({
															msg : '정말 삭제하시겠습니까?'
														}, () => {
															
															let loadingBar = SkyDesktop.LoadingBar('lime');
															
															BigWorld.StageModel.remove(stageData.id, () => {
																loadingBar.done();
															});
														});
														
														contextMenu.remove();
													}
												}
											})]
										});
										
										e.stop();
									}
								}
							}));
							
							addUpdateHandler((newStageData) => {
								item.setTitle(MSG(newStageData.name) === undefined ? 'Unknown' : MSG(newStageData.name));
							});
							
							addRemoveHandler(() => {
								item.remove();
							});
						},
						success : next
					});
				};
			},
			
			(next) => {
				return () => {
					
					// 타일들을 불러옵니다.
					exitTilesWatchingRoom = BigWorld.TileModel.onNewAndFindWatching({
						properties : {
							folderId : nowFolderId === undefined ? TO_DELETE : nowFolderId
						},
						sort : {
							createTime : 1
						}
					}, {
						handler : (tileData, addUpdateHandler, addRemoveHandler) => {
							
							let item;
							fileList.append(item = UUI.BUTTON({
								style : {
									flt : 'left',
									padding : 10,
									height : 120
								},
								icon : IMG({
									src : BigWorld.R('explorer/factor/tile.png'),
									on : {
										touchstart : (e) => {
											e.stopDefault();
										}
									}
								}),
								title : MSG(tileData.name) === undefined ? 'Unknown' : MSG(tileData.name),
								href : BigWorld.HREF('tile/' + tileData.id),
								target : '_blank',
								on : {
									touchstart : (e) => {
										
										draggingInfo = {
											type : 'tile',
											id : tileData.id,
											title : MSG(tileData.name) === undefined ? 'Unknown' : MSG(tileData.name)
										};
										
										startDraggingLeft = e.getLeft();
										startDraggingTop = e.getTop();
									},
									contextmenu : (e) => {
										
										let contextMenu = SkyDesktop.ContextMenu({
											e : e,
											c : [SkyDesktop.ContextMenuItem({
												title : '이름 변경',
												icon : IMG({
													src : BigWorld.R('objecteditor/menu/edit.png')
												}),
												on : {
													tap : () => {
														
														let form;
														
														SkyDesktop.Confirm({
															okButtonTitle : '저장',
															msg : form = FORM({
																c : [INPUT({
																	style : {
																		width : 222,
																		padding : 8,
																		border : '1px solid #999',
																		borderRadius : 4
																	},
																	name : 'name.ko',
																	placeholder : '타일명 (한국어)'
																})]
															})
														}, () => {
															
															let loadingBar = SkyDesktop.LoadingBar('lime');
															
															let isValid = true;
															BigWorld.TileModel.update({
																id : tileData.id,
																name : form.getData().name
															}, {
																notValid : (validErrors) => {
																	loadingBar.done();
																	
																	SkyDesktop.Alert({
																		msg : '검증에 실패하였습니다. 값에 오류가 없는지 확인해주시기 바랍니다.'
																	});
																	isValid = false;
																},
																success : () => {
																	loadingBar.done();
																}
															});
															
															return isValid;
														});
														
														form.setData(tileData);
														
														contextMenu.remove();
													}
												}
											}), SkyDesktop.ContextMenuItem({
												title : '삭제',
												icon : IMG({
													src : BigWorld.R('objecteditor/menu/delete.png')
												}),
												on : {
													tap : () => {
														
														SkyDesktop.Confirm({
															msg : '정말 삭제하시겠습니까?'
														}, () => {
															
															let loadingBar = SkyDesktop.LoadingBar('lime');
															
															BigWorld.TileModel.remove(tileData.id, () => {
																loadingBar.done();
															});
														});
														
														contextMenu.remove();
													}
												}
											})]
										});
										
										e.stop();
									}
								}
							}));
							
							addUpdateHandler((newTileData) => {
								item.setTitle(MSG(newTileData.name) === undefined ? 'Unknown' : MSG(newTileData.name));
							});
							
							addRemoveHandler(() => {
								item.remove();
							});
						},
						success : next
					});
				};
			},
			
			(next) => {
				return () => {
					
					// 객체들을 불러옵니다.
					exitObjectsWatchingRoom = BigWorld.ObjectModel.onNewAndFindWatching({
						properties : {
							folderId : nowFolderId === undefined ? TO_DELETE : nowFolderId
						},
						sort : {
							createTime : 1
						}
					}, {
						handler : (objectData, addUpdateHandler, addRemoveHandler) => {
							
							let item;
							fileList.append(item = UUI.BUTTON({
								style : {
									flt : 'left',
									padding : 10,
									height : 120
								},
								icon : IMG({
									src : BigWorld.R('explorer/factor/object.png'),
									on : {
										touchstart : (e) => {
											e.stopDefault();
										}
									}
								}),
								title : MSG(objectData.name) === undefined ? 'Unknown' : MSG(objectData.name),
								href : BigWorld.HREF('object/' + objectData.id),
								target : '_blank',
								on : {
									touchstart : (e) => {
										
										draggingInfo = {
											type : 'object',
											id : objectData.id,
											title : MSG(objectData.name) === undefined ? 'Unknown' : MSG(objectData.name)
										};
										
										startDraggingLeft = e.getLeft();
										startDraggingTop = e.getTop();
									},
									contextmenu : (e) => {
										
										let contextMenu = SkyDesktop.ContextMenu({
											e : e,
											c : [SkyDesktop.ContextMenuItem({
												title : '이름 변경',
												icon : IMG({
													src : BigWorld.R('objecteditor/menu/edit.png')
												}),
												on : {
													tap : () => {
														
														let form;
														
														SkyDesktop.Confirm({
															okButtonTitle : '저장',
															msg : form = FORM({
																c : [INPUT({
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
															
															let loadingBar = SkyDesktop.LoadingBar('lime');
															
															let isValid = true;
															BigWorld.ObjectModel.update({
																id : objectData.id,
																name : form.getData().name
															}, {
																notValid : (validErrors) => {
																	loadingBar.done();
																	
																	SkyDesktop.Alert({
																		msg : '검증에 실패하였습니다. 값에 오류가 없는지 확인해주시기 바랍니다.'
																	});
																	isValid = false;
																},
																success : () => {
																	loadingBar.done();
																}
															});
															
															return isValid;
														});
														
														form.setData(objectData);
														
														contextMenu.remove();
													}
												}
											}), SkyDesktop.ContextMenuItem({
												title : '삭제',
												icon : IMG({
													src : BigWorld.R('objecteditor/menu/delete.png')
												}),
												on : {
													tap : () => {
														
														SkyDesktop.Confirm({
															msg : '정말 삭제하시겠습니까?'
														}, () => {
															
															let loadingBar = SkyDesktop.LoadingBar('lime');
															
															BigWorld.ObjectModel.remove(objectData.id, () => {
																loadingBar.done();
															});
														});
														
														contextMenu.remove();
													}
												}
											})]
										});
										
										e.stop();
									}
								}
							}));
							
							addUpdateHandler((newObjectData) => {
								item.setTitle(MSG(newObjectData.name) === undefined ? 'Unknown' : MSG(newObjectData.name));
							});
							
							addRemoveHandler(() => {
								item.remove();
							});
						},
						success : next
					});
				};
			},
			
			() => {
				return () => {
					
					// 아이템들을 불러옵니다.
					exitItemsWatchingRoom = BigWorld.ItemModel.onNewAndFindWatching({
						properties : {
							folderId : nowFolderId === undefined ? TO_DELETE : nowFolderId
						},
						sort : {
							createTime : 1
						}
					}, (itemData, addUpdateHandler, addRemoveHandler) => {
						
						let item;
						fileList.append(item = UUI.BUTTON({
							style : {
								flt : 'left',
								padding : 10,
								height : 120
							},
							icon : IMG({
								src : BigWorld.R('explorer/factor/item.png'),
								on : {
									touchstart : (e) => {
										e.stopDefault();
									}
								}
							}),
							title : MSG(itemData.name) === undefined ? 'Unknown' : MSG(itemData.name),
							href : BigWorld.HREF('item/' + itemData.id),
							target : '_blank',
							on : {
								touchstart : (e) => {
									
									draggingInfo = {
										type : 'item',
										id : itemData.id,
										title : MSG(itemData.name) === undefined ? 'Unknown' : MSG(itemData.name)
									};
									
									startDraggingLeft = e.getLeft();
									startDraggingTop = e.getTop();
								},
								contextmenu : (e) => {
									
									let contextMenu = SkyDesktop.ContextMenu({
										e : e,
										c : [SkyDesktop.ContextMenuItem({
											title : '이름 변경',
											icon : IMG({
												src : BigWorld.R('objecteditor/menu/edit.png')
											}),
											on : {
												tap : () => {
													
													let form;
													
													SkyDesktop.Confirm({
														okButtonTitle : '저장',
														msg : form = FORM({
															c : [INPUT({
																style : {
																	width : 222,
																	padding : 8,
																	border : '1px solid #999',
																	borderRadius : 4
																},
																name : 'name.ko',
																placeholder : '아이템명 (한국어)'
															})]
														})
													}, () => {
														
														let loadingBar = SkyDesktop.LoadingBar('lime');
														
														let isValid = true;
														BigWorld.ItemModel.update({
															id : itemData.id,
															name : form.getData().name
														}, {
															notValid : (validErrors) => {
																loadingBar.done();
																
																SkyDesktop.Alert({
																	msg : '검증에 실패하였습니다. 값에 오류가 없는지 확인해주시기 바랍니다.'
																});
																isValid = false;
															},
															success : () => {
																loadingBar.done();
															}
														});
														
														return isValid;
													});
													
													form.setData(itemData);
													
													contextMenu.remove();
												}
											}
										}), SkyDesktop.ContextMenuItem({
											title : '삭제',
											icon : IMG({
												src : BigWorld.R('objecteditor/menu/delete.png')
											}),
											on : {
												tap : () => {
													
													SkyDesktop.Confirm({
														msg : '정말 삭제하시겠습니까?'
													}, () => {
														
														let loadingBar = SkyDesktop.LoadingBar('lime');
														
														BigWorld.ItemModel.remove(itemData.id, () => {
															loadingBar.done();
														});
													});
													
													contextMenu.remove();
												}
											}
										})]
									});
									
									e.stop();
								}
							}
						}));
						
						addUpdateHandler((newItemData) => {
							item.setTitle(MSG(newItemData.name) === undefined ? 'Unknown' : MSG(newItemData.name));
						});
						
						addRemoveHandler(() => {
							item.remove();
						});
					});
				};
			}]);
		});
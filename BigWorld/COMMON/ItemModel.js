BigWorld.ItemModel = OBJECT({
	
	preset : () => {
		return BigWorld.MODEL;
	},
	
	params : () => {
		
		let partDirectionValidDataSet = {
			
			// 파트의 표기 순서
			zIndex : {
				notEmpty : true,
				integer : true
			},
			
			frameCount : {
				notEmpty : true,
				integer : true
			},
			
			fps : {
				integer : true
			},
			
			x : {
				notEmpty : true,
				integer : true
			},
			
			y : {
				notEmpty : true,
				integer : true
			},
			
			// 종류별 프레임 이미지들
			frames : {
				notEmpty : true,
				
				array : true,
				element : {
					id : true
				}
			}
		};

		let validDataSet = {
			
			folderId : {
				id : true
			},
			
			// 아이템을 적용시킬 대상이 되는 오브젝트 ID
			objectId : {
				notEmpty : true,
				id : true
			},
			
			// 오브젝트의 어떤 부분에 부착이 될 지
			objectPart : {
				notEmpty : true,
				size : {
					max : 255
				}
			},
			
			name : {
				notEmpty : true,
				data : true,
				detail : {
					en : {
						size : {
							max : 255
						}
					},
					ko : {
						size : {
							max : 255
						}
					},
					ja : {
						size : {
							max : 255
						}
					},
					'zh-TW' : {
						size : {
							max : 255
						}
					}
				}
			},
			
			kinds : {
				notEmpty : true,
				
				array : true,
				element : {
					
					data : true,
					detail : {
						
						// 종류 이름
						name : {
							notEmpty : true,
							data : true,
							detail : {
								en : {
									size : {
										max : 255
									}
								},
								ko : {
									size : {
										max : 255
									}
								},
								ja : {
									size : {
										max : 255
									}
								},
								'zh-TW' : {
									size : {
										max : 255
									}
								}
							}
						}
					}
				}
			},
			
			states : {
				notEmpty : true,
				
				data : true,
				property : {
					
					data : true,
					detail : {
						
						// 상태별 파트
						parts : {
							notEmpty : true,
							
							array : true,
							element : {
								
								data : true,
								detail : {
									
									// 파트 이름
									name : {
										notEmpty : true,
										data : true,
										detail : {
											en : {
												size : {
													max : 255
												}
											},
											ko : {
												size : {
													max : 255
												}
											},
											ja : {
												size : {
													max : 255
												}
											},
											'zh-TW' : {
												size : {
													max : 255
												}
											}
										}
									},
									
									down : {
										data : true,
										detail : partDirectionValidDataSet
									},
									left : {
										data : true,
										detail : partDirectionValidDataSet
									},
									up : {
										data : true,
										detail : partDirectionValidDataSet
									},
									right : {
										data : true,
										detail : partDirectionValidDataSet
									}
								}
							}
						}
					}
				}
			}
		};
		
		return {
			name : 'Item',
			initData : {
				
				kinds : [{
					name : {
						en : 'Kind 1'
					}
				}],
				
				states : {}
			},
			methodConfig : {
				create : {
					valid : VALID(validDataSet)
				},
				update : {
					valid : VALID(validDataSet)
				}
			}
		};
	}
});

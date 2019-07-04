BigWorld.ItemModel = OBJECT({
	
	preset : () => {
		return BigWorld.MODEL;
	},
	
	params : () => {

		let validDataSet = {
			
			folderId : {
				id : true
			},
			
			// 아이템을 적용시킬 대상이 되는 오브젝트 ID
			objectId : {
				notEmpty : true,
				id : true
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
				
				data : true,
				property : {
					
					data : true,
					detail : {
						
						// 상태별 파트
						parts : {
							
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
											data : true,
											detail : {
												
												// 방향별 이미지들
												downImageId : {
													id : true
												},
												leftImageId : {
													id : true
												},
												upImageId : {
													id : true
												},
												rightImageId : {
													id : true
												}
											}
										}
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

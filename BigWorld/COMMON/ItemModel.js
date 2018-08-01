BigWorld.ItemModel = OBJECT({
	
	preset : () => {
		return BigWorld.MODEL;
	},
	
	params : () => {

		let validDataSet = {
			
			objectId : {
				notEmpty : true,
				id : true
			},
			
			folderId : {
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
			
			// 종류
			kinds : {
				array : true,
				element : {
					data : true,
					detail : {
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
			
			// 상태
			states : {
				data : true,
				property : {
					data : true,
					detail : {
						
						// 상태 별 파트
						parts : {
							array : true,
							element : {
								data : true,
								detail : {
									
									// 파트의 이름
									name : {
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
									
									// 파트의 Z Index
									zIndex : {
										integer : true
									},
									
									frameCount : {
										integer : true
									},
									
									fps : {
										integer : true
									},
									
									x : {
										real : true
									},
									
									y : {
										real : true
									},
									
									// 종류별 프레임 이미지들
									frames : {
										array : true,
										element : {
											data : true,
											detail : {
												// 방향 별 이미지들
												left : {
													id : true
												},
												up : {
													id : true
												},
												right : {
													id : true
												},
												down : {
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

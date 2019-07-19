BigWorld.ObjectModel = OBJECT({
	
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
			
			leftSectionLevel : {
				notEmpty : true,
				integer : true,
				min : 0
			},
			
			upSectionLevel : {
				notEmpty : true,
				integer : true,
				min : 0
			},
			
			rightSectionLevel : {
				notEmpty : true,
				integer : true,
				min : 0
			},
			
			downSectionLevel : {
				notEmpty : true,
				integer : true,
				min : 0
			},
			
			sectionMap : {
				notEmpty : true,
				
				// row
				array : true,
				element : {
					
					array : true,
					element : {
						
						// col
						data : true,
						detail : {
							
							// 섹션의 높이
							z : {
								notEmpty : true,
								integer : true
							},
							
							// 섹션이 지나갈 수 없는 부분인지
							isBlock : {
								bool : true
							},
							
							// 섹션 위에 올라서면 특정 액션을 실행하는 트리거인지
							isTrigger : {
								bool : true
							}
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
						
						// 상태 이름
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
			name : 'Object',
			initData : {
				
				upSectionLevel : 0,
				rightSectionLevel : 0,
				downSectionLevel : 0,
				leftSectionLevel : 0,
				
				sectionMap : [
					[{
						z : 0
					}]
				],
				
				kinds : [{
					name : {
						en : 'Kind 1'
					}
				}],
				
				states : {
					idle : {
						name : {
							en : 'Idle'
						},
						parts : []
					}
				}
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

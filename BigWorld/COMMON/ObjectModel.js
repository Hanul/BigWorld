BigWorld.ObjectModel = OBJECT({
	
	preset : () => {
		return BigWorld.MODEL;
	},
	
	params : () => {

		let validDataSet = {
			
			folderId : {
				id : true
			},
			
			category : {
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
			
			sectionUpLevel : {
				notEmpty : true,
				integer : true,
				min : 0
			},
			sectionRightLevel : {
				notEmpty : true,
				integer : true,
				min : 0
			},
			sectionDownLevel : {
				notEmpty : true,
				integer : true,
				min : 0
			},
			sectionLeftLevel : {
				notEmpty : true,
				integer : true,
				min : 0
			},
			
			// 섹션 맵
			sectionMap : {
				notEmpty : true,
				array : true,
				element : {
					array : true,
					element : {
						data : true,
						detail : {
							z : {
								notEmpty : true,
								integer : true
							},
							isBlock : {
								bool : true
							},
							isTrigger : {
								bool : true
							}
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
						frameCount : {
							integer : true
						},
						fps : {
							integer : true
						},
						parts : {
							array : true,
							element : {
								data : true,
								detail : {
									name : {
										notEmpty : true,
										size : {
											max : 255
										}
									},
									states : {
										array : true,
										element : {
											data : true,
											detail : {
												name : {
													notEmpty : true,
													size : {
														max : 255
													}
												},
												zIndex : {
													integer : true
												},
												frameImageId : {
													id : true
												},
												frameImageIds : {
													array : true,
													element : {
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
			}
		};
		
		return {
			name : 'Object',
			initData : {
				sectionUpLevel : 0,
				sectionRightLevel : 0,
				sectionDownLevel : 0,
				sectionLeftLevel : 0,
				sectionMap : [[{
					z : 0
				}]]
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

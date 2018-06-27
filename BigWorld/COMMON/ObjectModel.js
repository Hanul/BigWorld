BigWorld.ObjectModel = OBJECT({
	
	preset : () => {
		return BigWorld.MODEL;
	},
	
	params : () => {

		let validDataSet = {
			
			folderId : {
				id : true
			},
			
			name : {
				notEmpty : true,
				size : {
					max : 255
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
							size : {
								max : 255
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
							size : {
								max : 255
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

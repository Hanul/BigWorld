BigWorld.ObjectEditor = CLASS({
	
	preset : () => {
		return VIEW;
	},
	
	init : (inner, self) => {
		
		TITLE('BigWorld Object Editor');
		
		let wrapper = TABLE({
			style : {
				position : 'absolute',
				width : '100%',
				height : '100%'
			},
			c : [TR({
				c : TD({
					style : {
						height : 28
					},
					c : SkyDesktop.Toolbar({
						buttons : [SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('objecteditor/menu/test.png')
							}),
							title : '기본 설정 화면'
						})]
					})
				})
			}), TR({
				c : TD({
					c : SkyDesktop.HorizontalTabList({
						tabs : [SkyDesktop.Tab({
							size : 15,
							c : SkyDesktop.FileTree({
								items : {
									'root' : SkyDesktop.File({
										icon : IMG({
											src : BigWorld.R('explorer/drive.png')
										}),
										title : 'root'
									})
								}
							})
						}), SkyDesktop.Tab({
							size : 15,
							c : SkyDesktop.FileTree({
								items : {
									'root' : SkyDesktop.File({
										icon : IMG({
											src : BigWorld.R('explorer/drive.png')
										}),
										title : 'root'
									})
								}
							})
						}), SkyDesktop.Tab({
							size : 70
						})]
					})
				})
			})]
		}).appendTo(BODY);
		
		inner.on('paramsChange', (params) => {
			
			BigWorld.ObjectModel.get(params.objectId, (objectData) => {
				
				console.log(objectData);
			});
		});
		
		// 새로고침 중단
		window.addEventListener('beforeunload', (e) => {
			e.returnValue = null;
			return null;
		});

		inner.on('close', () => {
			wrapper.remove();
		});
	}
});

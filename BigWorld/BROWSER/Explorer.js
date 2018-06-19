BigWorld.Explorer = CLASS({
	
	preset : () => {
		return VIEW;
	},
	
	init : (inner, self) => {
		
		TITLE('BigWorld Explorer');
		
		let fileList;
		let savedFileListSize;
		
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
								src : BigWorld.R('explorer/menu/back.png')
							}),
							title : '뒤로가기'
						}), SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('explorer/menu/forward.png')
							}),
							title : '앞으로'
						}), SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('explorer/menu/up.png')
							}),
							title : '위로'
						}), SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('explorer/menu/search.png')
							}),
							title : '검색'
						}), SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('explorer/menu/sort.png')
							}),
							title : '정렬'
						}), SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('explorer/menu/folder.png')
							}),
							title : '새 폴더'
						}), SkyDesktop.ToolbarButton({
							icon : IMG({
								src : BigWorld.R('explorer/menu/factor.png')
							}),
							title : '새 요소'
						})]
					})
				})
			}), TR({
				c : TD({
					c : SkyDesktop.HorizontalTabList({
						tabs : [fileList = SkyDesktop.Tab({
							size : 23,
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
							size : 77
						})]
					})
				})
			})]
		}).appendTo(BODY);

		inner.on('close', () => {
			wrapper.remove();
		});
	}
});

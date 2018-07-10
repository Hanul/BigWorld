BigWorld.CreateSelectObjectPopup = METHOD({
	
	run : (callback) => {
		//REQUIRED: callback
		
		let tree;
		let filenameInput;
		SkyDesktop.Confirm({
			okButtonTitle : '불러오기',
			style : {
				onDisplayResize : (width, height) => {
					
					if (width > 600) {
						return {
							width : 500
						};
					} else {
						return {
							width : '90%'
						};
					}
				}
			},
			msg : [H2({
				style : {
					fontWeight : 'bold'
				},
				c : '스테이지에 놓을 객체를 선택해주세요.'
			}), tree = SkyDesktop.FileTree({
				style : {
					border : '1px solid #999',
					marginTop : 8,
					overflowY : 'scroll',
					padding : 8,
					borderRadius : 4,
					textAlign : 'left',
					color : '#fff',
					onDisplayResize : (width, height) => {
						
						if (height > 500) {
							return {
								height : 300
							};
						} else {
							return {
								height : 150
							};
						}
					}
				}
			})]
		}, () => {
			
		});
		
		
	}
});

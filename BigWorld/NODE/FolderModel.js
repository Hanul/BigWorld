OVERRIDE(BigWorld.FolderModel, (origin) => {

	BigWorld.FolderModel = OBJECT({

		preset : () => {
			return origin;
		},

		init : (inner, self) => {
			
			inner.on('update', {

				before : (data, next, ret) => {
					
					if (data.folderId !== undefined && data.folderId !== TO_DELETE) {
						
						if (data.id === data.folderId) {
							
							ret({
								validErrors : {
									folderId : {
										type : 'notAllowed'
									}
								}
							});
						}
						
						else {
							
							let check = (parentFolderId) => {
								
								self.get(parentFolderId, (parentFolderData) => {
									
									if (parentFolderData.folderId === undefined) {
										next();
									}
									
									else if (parentFolderData.folderId === data.id) {
										
										ret({
											validErrors : {
												folderId : {
													type : 'notAllowed'
												}
											}
										});
									}
									
									else {
										check(parentFolderData.folderId);
									}
								});
							};
							
							check(data.folderId);
						}
						
						return false;
					}
				}
			});
		}
	});
});

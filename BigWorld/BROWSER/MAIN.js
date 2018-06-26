BigWorld.MAIN = METHOD({

	run : (params) => {
		
		BigWorld.MATCH_VIEW({
			uri : ['explorer', 'explorer/{folderId}'],
			target : BigWorld.Explorer
		});
		
		BigWorld.MATCH_VIEW({
			uri : 'object/{objectId}',
			target : BigWorld.ObjectEditor
		});
		
		BigWorld.MATCH_VIEW({
			uri : 'map/{mapId}',
			target : BigWorld.MapEditor
		});
	}
});

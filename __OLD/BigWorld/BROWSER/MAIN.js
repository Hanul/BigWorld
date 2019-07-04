BigWorld.MAIN = METHOD({

	run : (params) => {
		
		BigWorld.MATCH_VIEW({
			uri : ['explorer', 'explorer/{folderId}'],
			target : BigWorld.Explorer
		});
		
		BigWorld.MATCH_VIEW({
			uri : 'stage/{stageId}',
			target : BigWorld.StageEditor
		});
		
		BigWorld.MATCH_VIEW({
			uri : 'tile/{tileId}',
			target : BigWorld.TileEditor
		});
		
		BigWorld.MATCH_VIEW({
			uri : 'object/{objectId}',
			target : BigWorld.ObjectEditor
		});
		
		BigWorld.MATCH_VIEW({
			uri : 'item/{itemId}',
			target : BigWorld.ItemEditor
		});
	}
});

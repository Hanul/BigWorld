BigWorld.MAIN = METHOD({

	run : (params) => {
		
		BigWorld.MATCH_VIEW({
			uri : ['', 'folder/{folderId}'],
			target : BigWorld.Explorer
		});
		
		BigWorld.MATCH_VIEW({
			uri : 'map/{mapId}',
			target : BigWorld.MapEditor
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

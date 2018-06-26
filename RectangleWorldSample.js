require(process.env.UPPERCASE_PATH + '/LOAD.js');

BOOT({
	CONFIG : {
		defaultBoxName : 'RectangleWorldSample',
		
		title : 'Rectangle World Sample',
		
		isDevMode : true,
		webServerPort : 8621,
		
		BigWorld : {
			tileType : 'rectangle',
			tileSectionLevel : 3,
			sectionWidth : 16,
			sectionHeight : 16,
			categories : [
				'human'
			]
		}
	},
	
	NODE_CONFIG : {
		// 테스트 목적이기 때문에 CPU 클러스터링 기능을 사용하지 않습니다.
		isNotUsingCPUClustering : true,
		
		dbName : 'RectangleWorldSample-test'
	}
});

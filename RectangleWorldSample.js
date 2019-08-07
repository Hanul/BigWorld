require(process.env.UPPERCASE_PATH + '/LOAD.js');

BOOT({
	CONFIG : {
		defaultBoxName : 'RectangleWorldSample',
		
		title : 'Rectangle World Sample',
		
		isDevMode : true,
		webServerPort : 8621,
		
		BigWorld : {
			tileType : 'rectangle',
			/*tileSectionLevel : 5,
			sectionWidth : 40,
			sectionHeight : 40*/
			tileSectionLevel : 1,
			sectionWidth : 256,
			sectionHeight : 256
		}
	},
	
	BROWSER_CONFIG : {
		
		SkyDesktop : {
			theme : 'dark'
		},
		
		SkyEngine : {
			//isDebugMode : true
		}
	},
	
	NODE_CONFIG : {
		// 테스트 목적이기 때문에 CPU 클러스터링 기능을 사용하지 않습니다.
		isSingleCoreMode : true,
		
		dbName : 'RectangleWorldSample-test'
	}
});

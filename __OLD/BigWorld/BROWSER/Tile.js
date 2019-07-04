BigWorld.Tile = CLASS({
	
	preset : () => {
		return SkyEngine.Node;
	},
	
	params : () => {
		return {
			isY2ZIndex : true
		};
	},
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//OPTIONAL: params.id
		//REQUIRED: params.tileData
		//REQUIRED: params.kind
		//REQUIRED: params.state
		//REQUIRED: params.direction
		//OPTIONAL: params.itemDataSet
		//OPTIONAL: params.itemKinds
		//OPTIONAL: params.isReverse
		
		let id = params.id;
		let tileData = params.tileData;
		let kind = params.kind;
		let state = params.state;
		let direction = params.direction;
		let itemDataSet = params.itemDataSet;
		let itemKinds = params.itemKinds;
		let isReverse = params.isReverse;
		
		if (itemDataSet === undefined) {
			itemDataSet = [];
		}
		if (itemKinds === undefined) {
			itemKinds = [];
		}
		if (isReverse === undefined) {
			isReverse = false;
		}
		if (isReverse === true) {
			self.flipX();
		}
		
		let refresh = RAR(() => {
			
			self.empty();
			
			if (tileData.states !== undefined) {
				
				let stateData = tileData.states[state];
				
				if (stateData !== undefined) {
					
					EACH(stateData.parts, (part) => {
						
						if (part.frames !== undefined) {
							
							let kindFrames = part.frames[kind];
							
							if (kindFrames !== undefined && kindFrames !== TO_DELETE) {
								
								let fileId = kindFrames[direction];
								
								if (fileId !== undefined) {
									
									SkyEngine.Sprite({
										src : BigWorld.RF(fileId),
										fps : part.fps,
										frameCount : part.frameCount,
										zIndex : part.zIndex,
										x : part.x,
										y : part.y,
										on : {
											load : (e, sprite) => {
									
												self.addTouchArea(SkyEngine.Silhouette({
													src : BigWorld.RF(fileId),
													width : sprite.getSpriteWidth(),
													x : part.x,
													y : part.y
												}));
											}
										}
									}).appendTo(self);
								}
							}
						}
					});
				}
			}
			
			EACH(itemDataSet, (itemData, i) => {
				
				if (itemData.states !== undefined) {
					
					let stateData = itemData.states[state];
					
					if (stateData !== undefined) {
						
						EACH(stateData.parts, (part) => {
							
							if (part.frames !== undefined) {
								
								let kindFrames = part.frames[itemKinds[i]];
								
								if (kindFrames !== undefined && kindFrames !== TO_DELETE) {
									
									let fileId = kindFrames[direction];
									
									if (fileId !== undefined) {
										
										SkyEngine.Sprite({
											src : BigWorld.RF(fileId),
											fps : part.fps,
											frameCount : part.frameCount,
											zIndex : part.zIndex,
											x : part.x,
											y : part.y
										}).appendTo(self);
									}
								}
							}
						});
					}
				}
			});
		});
		
		let getId = self.getId = () => {
			return id;
		};
		
		let changeKind = self.changeKind = (_kind) => {
			//REQUIRED: _kind
			
			kind = _kind;
			refresh();
		};
		
		let getKind = self.getKind = () => {
			return kind;
		};
		
		let changeState = self.changeState = (_state) => {
			//REQUIRED: _state
			
			state = _state;
			refresh();
		};
		
		let getState = self.getState = () => {
			return state;
		};
		
		let changeDirection = self.changeDirection = (_direction) => {
			//REQUIRED: _direction
			
			direction = _direction;
			refresh();
		};
		
		let getDirection = self.getDirection = () => {
			return direction;
		};
		
		let addItem = self.addItem = (params) => {
			//REQUIRED: params
			//REQUIRED: params.itemData
			//REQUIRED: params.kind
			
			let itemData = params.itemData;
			let kind = params.kind;
			
			removeItem(itemData.id);
			
			itemDataSet.push(itemData);
			itemKinds.push(kind);
			refresh();
		};
		
		let checkItemExists = self.checkItemExists = (params) => {
			//REQUIRED: params
			//REQUIRED: params.itemId
			//REQUIRED: params.kind
			
			let itemId = params.itemId;
			let kind = params.kind;
			
			let exists = false;
			
			EACH(itemDataSet, (itemData, i) => {
				if (itemData.id === itemId && itemKinds[i] === kind) {
					exists = true;
					return false;
				}
			});
			
			return exists;
		};
		
		let removeItem = self.removeItem = (itemId) => {
			//REQUIRED: itemId
			
			EACH(itemDataSet, (itemData, i) => {
				if (itemData.id === itemId) {
					
					itemDataSet.splice(i, 1);
					itemKinds.splice(i, 1);
					
					return false;
				}
			});
			
			refresh();
		};
		
		let getItemInfos = self.getItemInfos = () => {
			
			let itemInfos = [];
			
			EACH(itemDataSet, (itemData, i) => {
				itemInfos.push({
					id : itemData.id,
					kind : itemKinds[i]
				});
			});
			
			return itemInfos;
		};
		
		let reverse = self.reverse = () => {
			isReverse = isReverse !== true;
			self.flipX();
		};
		
		let checkIsReverse = self.checkIsReverse = () => {
			return isReverse;
		};
	}
});

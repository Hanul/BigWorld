OVERRIDE(BigWorld.MapTileModel, (origin) => {

	BigWorld.MapTileModel = OBJECT({

		preset : () => {
			return origin;
		},

		init : (inner, self) => {
			
			let put = self.put = (data, callback) => {
				//REQUIRED: data
				//OPTIONAL: callback
				
				self.getRoom().send({
					methodName : 'put',
					data : data
				}, callback);
			};
		}
	});
});

Dubtrack.View.RoomInfo  = Backbone.View.extend({
	
	events : {},
	
	initialize : function(){
	
	},
	
	refresh : function(){
		var self = this;
		$.ajax({
			url:  dubtrackMain.config.getRolesRoom + this.model.get('id'), 
			data: {},
			type: 'GET',
			success: function(response){ 
				try{
					if(response.success){
						
						self.update(response);			
					}						
				}
				catch(err){
					//window.console.log(err);
				}
			},
			error: function(){
			}
		},"json");
			
	},
	
	update : function(response){
		console.log("DUBTRACK ROOM INFO UPDATED", response);
		this.model.set({ 
			"room.allowed_dj" : response.data.allowed_djs, 
			"room.moderators" :  response.data.moderators, 
			"room.djs" : response.data.djs 
		});
		
		this.updateUsersData(response.data.allowed_djs, response.data.moderators);
	},
	
	updateUsersData : function($data, mods){
		_.each( $data, function(user){
			$user = dubtrackMain.app.roomAvatarList.collection.get(user);
			if($user){
				$user.set({ 'is_dj' : true });
			}
		});
		
		_.each( $data, function(user){
			if(dubtrackMain.user.id == user){ 
				dubtrackMain.user.set({"is_mod" : true});  
			}
		});
		
		dubtrackMain.app.chatView.setMod();
		
		dubtrackMain.app.roomAvatarList.resetEl();
	},
	
	setAutoRefresh : function(){
		
		var self = this;
		
		if( this.refreshInterval ){
			try{
				clearInterval(this.refreshInterval);
			}catch(ex){} 
		}
		
		this.refreshInterval = setInterval(function(){
			self.refresh();
		}, 40000);
		
	},
	
	isDJ : function(id){
	
		$djs = this.model.get('room.djs')
		
		$res = $.inArray( id, $djs);
		
		if($res === -1) return false;
		return true;
	}
	
});
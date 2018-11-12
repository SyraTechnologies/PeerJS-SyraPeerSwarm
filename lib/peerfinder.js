export var PeerFinder = function(peer){
	this._bindSocket(peer.SwarmSocket);
};

PeerFinder.prototype.GetBestPeer = function(callback){
	this.onFindPeer = callback;
	this.socket.emit("get peer list");
};
PeerFinder.prototype._highestpeer = function(){
	var peers = this.PeerList;
	if ( Object.keys(peers).length > 0) {
		var hpeer = null;
		var hRating = 0;
		for (var p in peers) {
			var Clients = peers[p].Clients ? peers[p].Clients : 0;
			if (peers[p].Rating >= hRating && Clients <= peers[p].Max) { //Grab the hpeer rating connection with less than four connections.
				hRating = peers[p].Rating;
				hpeer = peers[p];	
				hpeer.Name = p;
			}
		}
		if (hpeer) {
			return hpeer;
		}
	}else{
		return false;
	}
};
PeerFinder.prototype._randompeer = function(){
	var peers = this.PeerList;
	var num = self.getRandomNumber(length);
	var i = 0;
	var hpeer = null;
	if ( Object.keys(peers).length > 0) {
		for (var p in peers) {
			i = i + 1;
			if (i == num) { //Grab the hpeer rating connection with less than four connections.
				hpeer = peers[p];	
				hpeer.Name = p;	
			}
		}
		if (hpeer) {
			return hpeer;
		}
	}else{
		return false;
	}
};
function onPeerList(peers,self){
	console.log(peers);
	self.PeerList = peers;
	if (Object.keys(peers).length > 0) {
		var BestPeer = self._highestpeer();
		if(!BestPeer)
			BestPeer = self._randompeer();
		if (BestPeer) {
			self.BestPeer = peers[BestPeer.Name];
			if(self.onFindPeer)
				self.onFindPeer(BestPeer.Name);
		}
	}
}
PeerFinder.prototype.determineDepth = function(amt,depth) {
	var a = amt/3;
	if(a > 1) {
		depth = depth + 1;
		return this.determineDepth(a,depth);
	}else{
		return depth;
	}
};
PeerFinder.prototype._bindSocket = function(socket){
	var self = this;
	this.socket = socket;
	this.socket.on("peer list",function(peers) {onPeerList(peers,self); });
	this.socket.on("joined channel",function(){
		
	});
	this.socket.on("channel clients", function(m){
        self.availabletiers = self.determineDepth(parseFloat(m),0);
    });
};
PeerFinder.prototype.getRandomNumber = function(upto){
	var raw = Math.random();
	var number = Math.floor(raw * upto);
	return number;
};

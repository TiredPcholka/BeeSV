function getClientInfo() {
  return {
    "name": SV.T("Follow Playhead Play"),
	"category" : "BeeSV",
    "author": "TiredBee",
    "versionNumber": 1,
    "minEditorVersion": 0
  };
}

var mainEditorPlaybackFollower;
var arrangementPlaybackFollower;

function main() {
	SV.getPlayback().play();
	
	mainEditorPlaybackFollower = makePlaybackFollower(SV.getMainEditor().getNavigation());	
	//Remove double slash on lines 19 and 55 if u want Arrangement View to follow playhead as well
	//arrangementPlaybackFollower = makePlaybackFollower(SV.getArrangement().getNavigation());
	setInterval(15, checkPlayhead);
}

function setInterval(t, callback) {
  callback();
  SV.setTimeout(t, setInterval.bind(null, t, callback));
}

function makePlaybackFollower(coordSystem) {
	var playback = SV.getPlayback();
	var timeAxis = SV.getProject().getTimeAxis();
	
	return function() {
	var position = timeAxis.getBlickFromSeconds(playback.getPlayhead())
	var viewRange = coordSystem.getTimeViewRange();
	
	// Change the value below to change the playhead position while playing
	// 1.5 - shifted to the left, 1 - middle, 0.5 - shifted to the right
	// You can also use your custom value, but keep it in (0;2] range
	var multiplier = 1.5;
	
	coordSystem.setTimeRight(position+((viewRange[1]-viewRange[0])/2)*multiplier);
	}
}

function checkPlayhead() {
  var playback = SV.getPlayback();
  if(playback.getStatus() == "stopped") {
    SV.finish();
    return;
  }
  
  mainEditorPlaybackFollower();

  //Here ↓
  //arrangementPlaybackFollower();
}


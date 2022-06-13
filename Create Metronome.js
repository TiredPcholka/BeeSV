
function getClientInfo() {
  return {
    "name": SV.T("Create Metronome"),
	"category" : "BeeSV",
    "author": "TiredBee",
    "versionNumber": 1,
    "minEditorVersion": 0
  };
}


function main() {
	var project = SV.getProject()
	var duration = SV.blick2Quarter(project.getDuration())
	var tr = SV.create("Track")
	var newTrackIndex = project.addTrack(tr)
	var newTrack = project.getTrack(newTrackIndex)
	newTrack.setName("Metronome")
	var scope = SV.getMainEditor().getCurrentGroup()
    var noteGroup = scope.getTarget()
	var nt
	for (var i = 0; i < duration; i++)
	{
		nt = SV.create("Note")
		nt.setTimeRange(SV.quarter2Blick(i),SV.QUARTER/8)
		nt.setPitch(67)
		nt.setLyrics("boop")
		noteGroup.addNote(nt)
	}

}
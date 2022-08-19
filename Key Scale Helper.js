
function getClientInfo() {
  return {
    "name": SV.T("Key/Scale helper"),
	"category" : "BeeSV",
    "author": "TiredBee",
    "versionNumber": 1,
    "minEditorVersion": 0
  };
}

const scales = [
	"B/G# minor/Cb/Ab minor",
	"F#/D# minor/Gb/Eb minor",
	"C#/A# minor/Db/Bb minor",
	"G#/Ab/F minor",
	"D#/Eb/C minor",
	"A#/Bb/G minor",
	"F/D minor",
	"C/A minor",
	"G/E minor",
	"D/B minor",
	"A/F# minor/Gb minor",
	"E/C# minor/Db minor"
]

const keys = [
	[35,37,39,40,42,44,46],
	[37,39,41,42,44,46,47],
	[37,39,41,42,44,46,48],
	[36,37,39,41,43,44,46],
	[36,38,39,41,43,44,46],
	[36,38,39,41,43,45,46],
	[36,38,40,41,43,45,46],
	[36,38,40,41,43,45,47],
	[36,38,40,42,43,45,47],
	[37,38,40,42,43,45,47],
	[37,38,40,42,44,45,47],
	[37,39,40,42,44,45,47],
	[35,37,39,40,42,44,46],
	[37,39,41,42,44,46,47],
	[37,39,41,42,44,46,48]
]

function main() {
	var scaleForm = {
	"title" : "Key/Scale helper",
	"message" : "Select the key/scale",
	"buttons" : "OkCancel",
	"widgets" : [
			{
			"name" : "scaleBox", "type" : "ComboBox",
			"label" : "Choose scale:",
			"choices" : scales,
			"default" : 0
			}
		]
	};
	var project = SV.getProject()
	var tr = SV.create("Track")
	var newTrackIndex = project.addTrack(tr)
	var newTrack = project.getTrack(newTrackIndex)
	//You can set up your own track color and title with these two parameters!
	newTrack.setName("Keys")
	newTrack.setDisplayColor("#636363")
	
	var scope = SV.getMainEditor().getCurrentGroup()
    var noteGroup = scope.getTarget()
	var nt = SV.create("Note")
	var scalePick = SV.showCustomDialog(scaleForm);
    var theScale = scalePick.answers.scaleBox;
	if(scalePick.status)
	{
		for(var octave = 0;octave<=48;octave+=12)
		{
			keys[theScale].forEach(function(num){
				nt = SV.create("Note")
				nt.setTimeRange(SV.quarter2Blick(0),SV.QUARTER*1000)
				nt.setPitch(num+octave)
				nt.setLyrics("")
				noteGroup.addNote(nt)
				}
			);
		}
	}
	else
		project.removeTrack(newTrackIndex)
	SV.finish()
}


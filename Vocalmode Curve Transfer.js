
function getClientInfo() {
  return {
    "name": SV.T("Vocalmode Curve Transfer"),
	"category" : "BeeSV",
    "author": "TiredBee",
    "versionNumber": 2,
    "minEditorVersion": 0
  };
}

const vocalModeTable =[
	"Adult",
	"Airy",
	"Attacky",
	"Ballade",
	"Belt",
	"Bold",
	"Breathy",
	"Bright",
	"Charm",
	"Chest",
	"Chill",
	"Clear",
	"Closed",
	"Cool",
	"Crispy",
	"Dark",
	"Delicate",
	"Emotional",
	"Emotional",
	"Emotive",
	"Falsetto",
	"Firm",
	"Gentle",
	"Happy",
	"Kawaii",
	"Light",
	"Lucid",
	"Melancholic",
	"Muted",
	"Nasal",
	"Open",
	"Opera",
	"Overdrive",
	"Passionate",
	"Piano_Ballade",
	"Pops",
	"Power",
	"Power_Pop",
	"Powerful",
	"Resonant",
	"Rock",
	"Rough",
	"Soft",
	"Solid",
	"Soul",
	"Soulful",
	"Steady",
	"Straight",
	"Strained",
	"Sweet",
	"Tender",
	"Theatrical",
	"Tight",
	"Tsubaki",
	"Twangy",
	"Vivid",
	"Warm",
	"Whisper"
]

function main() {
	var dialog = {
		"title" : "Vocalmode Curve Transfer",
		"buttons" : "OkCancel",
		"message" : "By TiredBee",
		"widgets" : [
			{
				"name" : "OGCB", "type" : "ComboBox",
				"label" : "Source Vocalmode name",
				"choices" : vocalModeTable,
				"default" : 0
			},
			{
				"name" : "OG", "type" : "TextBox",
				"label" : "Manual input",
				"default" : ""
			},
			{
				"name" : "TGCB", "type" : "ComboBox",
				"label" : "Target Vocalmode name",
				"choices" : vocalModeTable,
				"default" : 0
			},
			{
				"name" : "TG", "type" : "TextBox",
				"label" : "Manual input",
				"default" : ""
			},
			{
				"name" : "DeleteOG", "type" : "CheckBox",
				"text" : "Delete Source Automation",
				"default" : false
			},
			{
				"name" : "DeleteTG", "type" : "CheckBox",
				"text" : "Clear Tagret Automation",
				"default" : false
			}
			]
	};

	var result = SV.showCustomDialog(dialog);

	if (result.status)
	{
		var scope = SV.getMainEditor().getCurrentGroup()
    	var noteGroup = scope.getTarget()
		if(result.answers.OG != ""){var OGAutomation = noteGroup.getParameter("vocalMode_"+result.answers.OG)}
		else{var OGAutomation = noteGroup.getParameter("vocalMode_"+vocalModeTable[result.answers.OGCB])}
		if(result.answers.TG != ""){var TGAutomation = noteGroup.getParameter("vocalMode_"+result.answers.TG)}
		else{var TGAutomation = noteGroup.getParameter("vocalMode_"+vocalModeTable[result.answers.TGCB])}
		if(result.answers.DeleteTG){
			TGAutomation.removeAll()
		}
		var points = OGAutomation.getAllPoints()
		for (var currentPoint = 0; currentPoint < points.length; currentPoint++)
		{
			point = points[currentPoint]
			TGAutomation.add(point[0],point[1])
		}

		if(result.answers.DeleteOG){OGAutomation.removeAll()}
		SV.showMessageBox("Transfer","Successful!")
	}

	SV.finish();
}
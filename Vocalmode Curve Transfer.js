
function getClientInfo() {
  return {
    "name": SV.T("Vocalmode Curve Transfer"),
	"category" : "BeeSV",
    "author": "TiredBee",
    "versionNumber": 1,
    "minEditorVersion": 0
  };
}

const vocalModeTable =[
	"Chest",
	"Airy",
	"Open",
	"Soft",
	"Kawaii",
	"Pops",
	"Emotional",
	"Ballade",
	"Adult",
	"Breathy",
	"Power_Pop",
	"Twangy",
	"Whisper",
	"Attacky",
	"Crispy",
	"Power",
	"Sweet",
	"Emotive",
	"Charm",
	"Chill",
	"Light",
	"Clear",
	"Passionate",
	"Solid",
	"Bright",
	"Straight",
	"Tight",
	"Nasal",
	"Resonant",
	"Belt",
	"Cool",
	"Dark",
	"Emotional",
	"Happy",
	"Falsetto",
	"Opera",
	"Delicate",
	"Tender",
	"Lucid",
	"Firm",
	"Powerful",
	"Warm",
	"Gentle",
	"Soulful",
	"Steady",
	"Bold",
	"Rock",
	"Piano_Ballade",
	"Strained",
	"Rough",
	"Closed",
	"Theatrical",
	"Vivid",
	"Melancholic",
	"Overdrive",
	"Muted"
]

function main() {
	var dialog = {
		"title" : "Vocalmode Curve Transfer",
		"buttons" : "OkCancel",
		"message" : "By TiredBee",
		"widgets" : [
			{
				"name" : "OGCB", "type" : "ComboBox",
				"label" : "OG Vocalmode name",
				"choices" : vocalModeTable,
				"default" : 0
			},
			{
				"name" : "IsManualOG", "type" : "CheckBox",
				"text" : "Use Manual Input",
				"default" : false
			},
			{
				"name" : "OG", "type" : "TextBox",
				"label" : "Input here",
				"default" : ""
			},
			{
				"name" : "TGCB", "type" : "ComboBox",
				"label" : "Target Vocalmode name",
				"choices" : vocalModeTable,
				"default" : 0
			},
			{
				"name" : "IsManualTG", "type" : "CheckBox",
				"text" : "Use Manual Input",
				"default" : false
			},
			{
				"name" : "TG", "type" : "TextBox",
				"label" : "Input here",
				"default" : ""
			},
			{
				"name" : "DeleteOG", "type" : "CheckBox",
				"text" : "Delete OG Automation","height" : 100,
				"default" : false
			}
			]
	};

	var result = SV.showCustomDialog(dialog);

	if (result.status)
	{
		var scope = SV.getMainEditor().getCurrentGroup()
    	var noteGroup = scope.getTarget()
		if(result.answers.IsManualOG){var OGAutomation = noteGroup.getParameter("vocalMode_"+result.answers.OG)}
		else{var OGAutomation = noteGroup.getParameter("vocalMode_"+vocalModeTable[result.answers.OGCB])}
		if(result.answers.IsManualTG){var TGAutomation = noteGroup.getParameter("vocalMode_"+result.answers.TG)}
		else{var TGAutomation = noteGroup.getParameter("vocalMode_"+vocalModeTable[result.answers.TGCB])}
			
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
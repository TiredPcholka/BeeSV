
function getClientInfo() {
	return {
	  "name": "End-breath Note",
	  "category" : "BeeSV",
	  "author": "TiredBee",
	  "versionNumber": 1,
	  "minEditorVersion": 0
	};
  }

  const languages = {
	1: 'japanese',
	2: 'english',
	3: 'mandarin',
	4: 'cantonese'
  }

  // lil customization
  const lyrics = '.hh' // input your lyrics here
  const languageIndex = 2 // select a language from the table above

  function main() 
  {
	var selectedNote = SV.getMainEditor().getSelection().getSelectedNotes()
    if (selectedNote < 1)
	{
		SV.showMessageBox("Error","Select a note first :P")
	}
	else
	{
		selectedNote[0].setLanguageOverride(languages[languageIndex])
		selectedNote[0].setLyrics(lyrics)
	}
	SV.finish()
  }
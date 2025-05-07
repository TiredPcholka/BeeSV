function getClientInfo()
  return {
      name = "Track Color Setter",
      category = "BeeSV",
      author = "TiredBee",
      versionNumber = 1,
      minEditorVersion = 0
  }
end

function main()
  local osType = SV:getHostInfo().osType
  local track = SV:getMainEditor():getCurrentTrack()
  local tempClipBoard = SV:getHostClipboard()
  if osType == 'macOS' then
    local command = [[osascript -e 'tell application "System Events" to activate' \
      -e 'set theColor to choose color' \
      -e 'set r to (item 1 of theColor) div 256' \
      -e 'set g to (item 2 of theColor) div 256' \
      -e 'set b to (item 3 of theColor) div 256' \
      -e 'on dec2hex(n)
              set hexList to {"0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"}
              set x to n div 16
              set y to n mod 16
              return item (x + 1) of hexList & item (y + 1) of hexList
          end dec2hex' \
      -e 'set hexColor to "FF" & dec2hex(r) & dec2hex(g) & dec2hex(b)' \
      -e 'do shell script "echo " & quoted form of hexColor & " | pbcopy"' ]]
    os.execute(command)
  elseif osType == 'Windows' then
    local psCommand = [[Add-Type -AssemblyName System.Windows.Forms; $cd=New-Object System.Windows.Forms.ColorDialog; $cd.Color=[System.Drawing.Color]::FromArgb(255,128,0); if($cd.ShowDialog() -eq 'OK'){ $c=$cd.Color; $h='ff{0:X2}{1:X2}{2:X2}' -f $c.R,$c.G,$c.B; Set-Clipboard -Value $h }]]
    local command = 'powershell -WindowStyle Hidden -Command "' .. psCommand .. '"'
    os.execute(command)
  else
    SV:showMessageBox("Error", "Unsupported OS. Please use macOS or Windows.")
  end
  track:setDisplayColor(SV:getHostClipboard())
  SV:setHostClipboard(tempClipBoard)
  SV:finish()
end
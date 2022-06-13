function getClientInfo()
    return {
        name = "Scale pitch",
		category = "BeeSV",
        author = "TiredBee",
        versionNumber = 1,
        minEditorVersion = 0
    }
end

local function scale(option, PitchBend)
	local mul = option.multiplier
	pointArray = PitchBend:getAllPoints()
	for i=1, #pointArray, 1 do
		Point = pointArray[i]
		PitchBend:add(Point[1],Point[2]*mul)
	end
end

function main()
	local scope = SV:getMainEditor():getCurrentGroup()
	local group = scope:getTarget()
	local myPitchBend = group:getParameter("PitchDelta")
	local inputForm = {
	title = SV:T("Scale pitch"),
	buttons = "OkCancel",
	widgets = 
	{
		{
		name = "multiplier", type = "TextBox",
		label = "Multiplier",
		format = "%1.0f",
		default = 0.5
		}
	}
	}
	local results = SV:showCustomDialog(inputForm)
	if(results.status) then
	scale(results.answers,myPitchBend)
	end
end

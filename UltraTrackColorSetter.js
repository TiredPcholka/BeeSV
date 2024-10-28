function getClientInfo() {
  return {
    "name": SV.T("Ultra Track Color Setter"),
	"category" : "BeeSV",
    "author": "TiredBee",
    "versionNumber": 1,
    "minEditorVersion": 0
  };
}

var answers;

function main() {
    answers = rgbToHsl(hexToRgb(SV.getMainEditor().getCurrentTrack().getDisplayColor()));

    while(true)
    {
        var dialog = {
            "title" : "Ultra Track Color Setter",
            "buttons" : "OkCancel",
            "message" : "By TiredBee\n\nPress Ok to Refresh\n\nPress Cancel to Confirm",
            "widgets" : [
                {
                    "name": "h",
                    "type": "Slider",
                    "label": "Hue",
                    "minValue": 0,
                    "maxValue": 359, 
                    "interval": 1,
                    "format": "%1.0f",
                    "default": answers.h
                },{
                    "name": "s",
                    "type": "Slider",
                    "label": "Saturation",
                    "minValue": 0,
                    "maxValue": 100, 
                    "interval": 1, 
                    "format": "%1.0f",
                    "default": answers.s*100
                },{
                    "name": "l",
                    "type": "Slider",
                    "label": "Lightness",
                    "minValue": 0,
                    "maxValue": 100, 
                    "interval": 1, 
                    "format": "%1.0f",
                    "default": answers.l*100
                }
                ]
        };
        var results = SV.showCustomDialog(dialog);
        if (results.status == 1)
        {
            var track = SV.getMainEditor().getCurrentTrack();

            answers = results.answers;
            var hueTemp = answers.h;
            answers.s = answers.s/100;
            answers.l = answers.l/100;

            var colors = hslToRgb(answers);

            answers.h = hueTemp;

            var rHex = ("0" + colors.r.toString(16)).slice(-2);
            var gHex = ("0" + colors.g.toString(16)).slice(-2);
            var bHex = ("0" + colors.b.toString(16)).slice(-2);
        
            var newHex = "ff" + rHex + gHex + bHex;
        
            track.setDisplayColor(newHex)
        }
        else
        {
            break;
        }
        
    }
    
}

function hexToRgb(hex) {
    var r = parseInt(hex.substring(2, 4), 16);
    var g = parseInt(hex.substring(4, 6), 16);
    var b = parseInt(hex.substring(6, 8), 16);
    return {r: r, g: g, b: b };
}

function rgbToHsl(ob) {
    ob.r /= 255;
    ob.g /= 255;
    ob.b /= 255;

    var max = Math.max(ob.r, ob.g, ob.b);
    var min = Math.min(ob.r, ob.g, ob.b);
    var h, s, l;

    l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case ob.r:
                h = ((ob.g - ob.b) / d);
                if (ob.g < ob.b) h += 6;
                break;
            case ob.g:
                h = ((ob.b - ob.r) / d) + 2;
                break;
            case ob.b:
                h = ((ob.r - ob.g) / d) + 4;
                break;
        }
        h *= 60;
    }

    return { h: h, s: s, l: l };
}

function hslToRgb(ob) {
    var r, g, b;

    if (ob.s === 0) {
        r = g = b = ob.l;
    } else {
        function hue2rgb(p, q, t) {
            if (t < 0)
                t += 1;
            if (t > 1)
                t -= 1;
            if (t < 1 / 6)
                return p + (q - p) * 6 * t;
            if (t < 1 / 2)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        ob.h /= 360;

        var q = ob.l < 0.5 ? ob.l * (1 + ob.s) : ob.l + ob.s - ob.l * ob.s;
        var p = 2 * ob.l - q;
        r = hue2rgb(p, q, ob.h + 1 / 3);
        g = hue2rgb(p, q, ob.h);
        b = hue2rgb(p, q, ob.h - 1 / 3);
    }

    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);

    return { r: r, g: g, b: b };
}
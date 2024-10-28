function getClientInfo() {
  return {
    "name": SV.T("Rainbow Track"),
	"category" : "BeeSV",
    "author": "TiredBee",
    "versionNumber": 1,
    "minEditorVersion": 0
  };
}

var project;

function main() {
    project = SV.getProject();
	setInterval(5, setTrackColors); //number is the speed change, in ms
}

function setInterval(t, callback) {
  callback();
  SV.setTimeout(t, setInterval.bind(null, t, callback));
}

function setTrackColors() {
    var numTracks = project.getNumTracks();
    for (var t = 0; t < numTracks; t++)
    {
        var track = project.getTrack(t);
	    var color = track.getDisplayColor();
        track.setDisplayColor(adjustHueBy1Percent(color))
    }
	
}

function hexToRgb(hex) {
    var r = parseInt(hex.substring(2, 4), 16);
    var g = parseInt(hex.substring(4, 6), 16);
    var b = parseInt(hex.substring(6, 8), 16);
    return {r: r, g: g, b: b };
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h, s, l;

    l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = ((g - b) / d);
                if (g < b) h += 6;
                break;
            case g:
                h = ((b - r) / d) + 2;
                break;
            case b:
                h = ((r - g) / d) + 4;
                break;
        }
        h *= 60;
    }

    return { h: h, s: s, l: l };
}

function hslToRgb(h, s, l) {
    var r, g, b;

    if (s === 0) {
        r = g = b = l;
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

        h /= 360;

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);

    return { r: r, g: g, b: b };
}

function adjustHueBy1Percent(hex) {
    var rgb = hexToRgb(hex);
    var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.h += 1;
    if (hsl.h >= 360)
        hsl.h -= 360;
    var rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    var rHex = ("0" + rgb.r.toString(16)).slice(-2);
    var gHex = ("0" + rgb.g.toString(16)).slice(-2);
    var bHex = ("0" + rgb.b.toString(16)).slice(-2);

    var newHex = "ff" + rHex + gHex + bHex;
    return newHex;
}
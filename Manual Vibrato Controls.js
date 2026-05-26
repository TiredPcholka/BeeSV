var SCRIPT_TITLE = "Manual Vibrato Controls";
var BATCH_ID_KEY = "mpv_ID";
var POINT_BATCH_KEY = "mpv_pcID";

function getClientInfo() {
    return {
        "name": SCRIPT_TITLE,
        "category": "BeeSV",
        "author": "TiredBee",
        "versionNumber": 4,
        "minEditorVersion": 131329,
        "type": "SidePanelSection"
    };
}

var controls = {
    vibratoStart: {
        value: SV.create("WidgetValue"),
        defaultValue: 0.25,
        paramKey: "mpv_VS"
    },
    vibratoLeft: {
        value: SV.create("WidgetValue"),
        defaultValue: 0.2,
        paramKey: "mpv_VL"
    },
    vibratoRight: {
        value: SV.create("WidgetValue"),
        defaultValue: 0.2,
        paramKey: "mpv_VR"
    },
    vibratoDepth: {
        value: SV.create("WidgetValue"),
        defaultValue: 1.0,
        paramKey: "mpv_VD"
    },
    vibratoFreq: {
        value: SV.create("WidgetValue"),
        defaultValue: 5.5,
        paramKey: "mpv_VF"
    },
    vibratoPhase: {
        value: SV.create("WidgetValue"),
        defaultValue: 0.0,
        paramKey: "mpv_VP"
    },
    intermediaryPoints: {
        value: SV.create("WidgetValue"),
        defaultValue: 0,
        paramKey: "mpv_IP"
    }
};

var statusTextValue = SV.create("WidgetValue");
var resetButtonValue = SV.create("WidgetValue");
var applyDefaultsButtonValue = SV.create("WidgetValue");
var nextBatchId = 1;

for (var key in controls) {
    controls[key].value.setValue(controls[key].defaultValue);
}
statusTextValue.setValue("No notes selected");
statusTextValue.setEnabled(false);


function secondsToBlicks(sec, tempo) {
    return sec * tempo * SV.QUARTER / 60.0;
}

function dedupeSorted(times) {
    if (times.length === 0) {
        return times;
    }
    var out = [times[0]];
    for (var i = 1; i < times.length; i++) {
        if (times[i] !== out[out.length - 1]) {
            out.push(times[i]);
        }
    }
    return out;
}

function getVibratoTiming(note, params, tempo) {
    var duration = note.getDuration();
    var vibStart = secondsToBlicks(params.vibratoStart, tempo);
    var fadeIn = secondsToBlicks(params.vibratoLeft, tempo);
    var fadeOut = secondsToBlicks(params.vibratoRight, tempo);
    var vibLen = duration - vibStart;

    if (vibLen < fadeIn + fadeOut && vibLen > 0) {
        var scale = vibLen / (fadeIn + fadeOut) * 2.0;
        fadeIn *= scale;
        fadeOut *= scale;
    }

    return {
        vibStart: vibStart,
        vibEnd: duration,
        fadeIn: fadeIn,
        fadeOut: fadeOut,
        vibLen: vibLen
    };
}

function getVibratoEnvelope(t, timing) {
    var env = 1.0;
    var vibStart = timing.vibStart;
    var vibEnd = timing.vibEnd;
    var fadeIn = timing.fadeIn;
    var fadeOut = timing.fadeOut;
    var vibLen = timing.vibLen;

    if (vibLen >= fadeIn + fadeIn) {
        if (t < vibStart + fadeIn) {
            env = (t - vibStart) / fadeIn;
        } else if (t > vibEnd - fadeOut) {
            env = (vibEnd - t) / fadeOut;
        }
    } else if (vibLen > 0) {
        var mid = (vibStart * fadeOut + vibEnd * fadeIn) / (fadeIn + fadeOut);
        if (t < mid) {
            env = (t - vibStart) / fadeIn;
        } else {
            env = (vibEnd - t) / fadeOut;
        }
    }

    return Math.max(0, Math.min(1, env));
}

function clearBatch(groupRef, batchId) {
    if (batchId == null) {
        return;
    }
    for (var i = groupRef.getNumPitchControls() - 1; i >= 0; i--) {
        if (groupRef.getPitchControl(i).getScriptData(POINT_BATCH_KEY) === batchId) {
            groupRef.removePitchControl(i);
        }
    }
}

function generateVibratoPointTimes(note, params, tempo) {
    var timing = getVibratoTiming(note, params, tempo);
    if (params.vibratoFreq <= 0 || timing.vibLen <= 0) {
        return [];
    }

    var blicksPerSec = tempo * SV.QUARTER / 60.0;
    var vibSec = timing.vibLen / blicksPerSec;
    var twoPi = 2 * Math.PI;
    var omega = twoPi * params.vibratoFreq;
    var phase = params.vibratoPhase;
    var anchors = [];

    function tryAnchor(theta) {
        var tSec = (theta - phase) / omega;
        if (tSec < 0 || tSec > vibSec) {
            return;
        }
        var t = timing.vibStart + tSec * blicksPerSec;
        if (getVibratoEnvelope(t, timing) > 0) {
            anchors.push(t);
        }
    }

    function scanAnchors(thetaBase, step) {
        var kMin = Math.ceil((phase - thetaBase) / step);
        var kMax = Math.floor((phase + omega * vibSec - thetaBase) / step);
        for (var k = kMin; k <= kMax; k++) {
            tryAnchor(thetaBase + step * k);
        }
    }

    scanAnchors(Math.PI / 2, twoPi);
    scanAnchors(3 * Math.PI / 2, twoPi);
    scanAnchors(0, Math.PI);

    anchors.sort(function(a, b) { return a - b; });
    anchors = dedupeSorted(anchors);
    if (anchors.length === 0) {
        return anchors;
    }

    var steps = Math.max(0, Math.round(params.intermediaryPoints));
    if (steps === 0) {
        return anchors;
    }

    var times = [];
    for (var i = 0; i < anchors.length - 1; i++) {
        var t0 = anchors[i];
        var t1 = anchors[i + 1];
        times.push(t0);
        for (var j = 1; j <= steps; j++) {
            times.push(t0 + (t1 - t0) * j / (steps + 1));
        }
    }
    times.push(anchors[anchors.length - 1]);

    times.sort(function(a, b) { return a - b; });
    return dedupeSorted(times);
}

function applyVibratoToNote(groupRef, note, params, tempo, batchId) {
    var timing = getVibratoTiming(note, params, tempo);
    var depth = params.vibratoDepth / 2.0;
    var blicksPerSec = tempo * SV.QUARTER / 60.0;
    var onset = note.getOnset();
    var basePitch = note.getPitch();
    var times = generateVibratoPointTimes(note, params, tempo);

    for (var i = 0; i < times.length; i++) {
        var t = times[i];
        var env = getVibratoEnvelope(t, timing);
        var tSec = (t - timing.vibStart) / blicksPerSec;
        var pitch = basePitch + depth * env * Math.sin(2 * Math.PI * params.vibratoFreq * tSec + params.vibratoPhase);
        var pt = SV.create("PitchControlPoint");
        pt.setPosition(onset + t);
        pt.setPitch(pitch);
        pt.setScriptData(POINT_BATCH_KEY, batchId);
        groupRef.addPitchControl(pt);
    }

    if (times.length > 0) {
        note.setAttributes({ dF0VbrMod: 0 });
    }
}

function resetVibratoOnNote(groupRef, note) {
    var batchId = note.getScriptData(BATCH_ID_KEY);
    var hadVibrato = batchId != null || loadNoteParameters(note).enabled;
    clearBatch(groupRef, batchId);
    resetNoteParameters(note);
    if (hadVibrato) {
        note.setAttributes({ dF0VbrMod: 1.0 });
    }
}

function loadNoteParameters(note) {
    var ret = { enabled: false };
    for (var key in controls) {
        var stored = note.getScriptData(controls[key].paramKey);
        if (stored !== undefined) {
            ret[key] = stored;
            ret.enabled = true;
        } else {
            ret[key] = controls[key].defaultValue;
        }
    }
    return ret;
}

function saveNoteParameters(note, params) {
    for (var key in controls) {
        note.setScriptData(controls[key].paramKey, params[key]);
    }
}

function resetNoteParameters(note) {
    for (var key in controls) {
        note.removeScriptData(controls[key].paramKey);
    }
    note.removeScriptData(BATCH_ID_KEY);
}

function updateWidgetValues(params) {
    for (var key in controls) {
        controls[key].value.setValue(params[key]);
    }
}

function loadNoteParametersFromWidgetValues() {
    var ret = {};
    for (var key in controls) {
        ret[key] = controls[key].value.getValue();
    }
    return ret;
}

function resetWidgetValues() {
    for (var key in controls) {
        controls[key].value.setValue(controls[key].defaultValue);
    }
}

function applyToSelectedNotes(isReset) {
    var editor = SV.getMainEditor();
    var selection = editor.getSelection();
    var selectedNotes = selection.getSelectedNotes();

    if (selectedNotes.length === 0) {
        statusTextValue.setValue("No notes selected");
        return;
    }

    var groupRef = editor.getCurrentGroup().getTarget();
    var params = loadNoteParametersFromWidgetValues();
    SV.getProject().newUndoRecord();

    for (var i = 0; i < selectedNotes.length; i++) {
        var note = selectedNotes[i];
        if (isReset) {
            resetVibratoOnNote(groupRef, note);
            continue;
        }

        clearBatch(groupRef, note.getScriptData(BATCH_ID_KEY));
        var batchId = "mpv_" + note.getOnset() + "_" + (nextBatchId++);
        note.setScriptData(BATCH_ID_KEY, batchId);
        saveNoteParameters(note, params);

        var tempo = SV.getProject().getTimeAxis().getTempoMarkAt(note.getOnset()).bpm;
        applyVibratoToNote(groupRef, note, params, tempo, batchId);
    }

    for (var s = 0; s < selectedNotes.length; s++) {
        selection.selectNote(selectedNotes[s]);
    }

    statusTextValue.setValue((isReset ? "Reset " : "Applied to ") + selectedNotes.length + " note(s)");
}

function onSelectionChanged() {
    var selectedNotes = SV.getMainEditor().getSelection().getSelectedNotes();

    if (selectedNotes.length > 0) {
        var params = loadNoteParameters(selectedNotes[0]);
        updateWidgetValues(params);
        statusTextValue.setValue(
            selectedNotes.length + " note(s) selected\nManual Vibrato Points: " + (params.enabled ? "enabled" : "disabled")
        );
    } else {
        statusTextValue.setValue("No notes selected");
    }

    for (var key in controls) {
        controls[key].value.setEnabled(selectedNotes.length > 0);
    }
}

resetButtonValue.setValueChangeCallback(function() {
    resetWidgetValues();
    applyToSelectedNotes(true);
});

applyDefaultsButtonValue.setValueChangeCallback(function() {
    resetWidgetValues();
    applyToSelectedNotes(false);
});

SV.getMainEditor().getSelection().registerSelectionCallback(function(selectionType) {
    if (selectionType == "note") {
        onSelectionChanged();
    }
});

SV.getMainEditor().getSelection().registerClearCallback(function(selectionType) {
    if (selectionType == "notes") {
        onSelectionChanged();
    }
});

for (var key in controls) {
    controls[key].value.setValueChangeCallback(function() {
        applyToSelectedNotes(false);
    });
}

function sliderRow(controlKey, text, format, minValue, maxValue, interval) {
    return {
        "type": "Container",
        "columns": [{
            "type": "Slider",
            "text": text,
            "format": format,
            "minValue": minValue,
            "maxValue": maxValue,
            "interval": interval,
            "value": controls[controlKey].value,
            "width": 1.0
        }]
    };
}

function getSidePanelSectionState() {
    return {
        "title": SCRIPT_TITLE,
        "rows": [
            { "type": "Label", "text": "TiredBee" },
            sliderRow("vibratoStart", "Vibrato Start", "%1.2f s", 0, 1, 0.01),
            sliderRow("vibratoLeft", "Vibrato Left", "%1.2f s", 0.02, 0.5, 0.01),
            sliderRow("vibratoRight", "Vibrato Right", "%1.2f s", 0.02, 0.5, 0.01),
            sliderRow("vibratoDepth", "Vibrato Depth", "%1.2f", 0, 2, 0.01),
            sliderRow("vibratoFreq", "Vibrato Frequency", "%1.1f Hz", 3, 10, 0.01),
            sliderRow("vibratoPhase", "Vibrato Phase", "%1.2f", -1, 1, 0.01),
            sliderRow("intermediaryPoints", "Intermediary Points", "%3.0f points", 0, 5, 1),
            {
                "type": "Container",
                "columns": [
                    { "type": "Button", "text": "Reset", "width": 0.5, "value": resetButtonValue },
                    { "type": "Button", "text": "Default", "width": 0.5, "value": applyDefaultsButtonValue }
                ]
            },
            {
                "type": "Container",
                "columns": [{
                    "type": "TextArea",
                    "value": statusTextValue,
                    "height": 60,
                    "width": 1.0,
                    "readOnly": true
                }]
            }
        ]
    };
}

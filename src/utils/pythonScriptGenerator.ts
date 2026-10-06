import { ProductionPlan } from '../types/ableton';

/**
 * Generates the full standalone Python script `ableton_builder.py`
 */
export function generatePythonScriptCode(defaultPlan?: ProductionPlan): string {
  const planJsonStr = defaultPlan 
    ? JSON.stringify(defaultPlan, null, 4).replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"')
    : '';

  return `#!/usr/bin/env python3
"""
Ableton Builder & Injector Module (ableton_builder.py)
------------------------------------------------------
Converts production plans (production_plan.json) into native Ableton Live (.adg / .als)
and MIDI (.mid) files, injecting directly into your Ableton Live User Library.

Stack: Python 3 standard library (gzip, xml.etree.ElementTree, json, argparse, struct, os, pathlib)
Compatibility: Ableton Live 11 & 12 (macOS & Windows)

Usage:
  python ableton_builder.py --input production_plan.json --target-library
  python ableton_builder.py --input production_plan.json --output-dir ./export
  python ableton_builder.py --test
"""

import os
import sys
import json
import gzip
import struct
import platform
import argparse
from pathlib import Path
import xml.etree.ElementTree as ET

DEFAULT_EMBEDDED_PLAN = """${planJsonStr}"""

def get_ableton_user_library_path():
    """
    Detects the standard Ableton User Library path across operating systems.
    """
    home = Path.home()
    system = platform.system()
    
    if system == "Darwin":  # macOS
        base = home / "Music" / "Ableton" / "User Library"
    elif system == "Windows":  # Windows
        base = home / "Documents" / "Ableton" / "User Library"
    else:  # Linux / Wine
        base = home / ".wine" / "drive_c" / "users" / os.environ.get("USER", "user") / "Documents" / "Ableton" / "User Library"
        if not base.exists():
            base = home / "Ableton" / "User Library"

    rack_folder = base / "Presets" / "Audio Effects" / "Audio Effect Rack"
    return base, rack_folder

def build_rack_xml(plan_data):
    """
    Constructs the Ableton Live Audio Effect Rack (.adg) XML ElementTree.
    """
    rack_name = plan_data.get("rackName", "AI Production Rack")
    genre = plan_data.get("genre", "Electronic")
    macros = plan_data.get("macros", [])
    chains = plan_data.get("chains", [])

    # Root element
    root = ET.Element("Ableton", {
        "MajorVersion": "5",
        "MinorVersion": "11.0_438",
        "SchemaChangeCount": "3",
        "Creator": "Ableton Live 11.3.10",
        "Revision": "7a8bc94e"
    })

    rack = ET.SubElement(root, "AudioEffectGroupDevice", {"Id": "0"})
    ET.SubElement(rack, "LomId", {"Value": "0"})
    ET.SubElement(rack, "IsExpanded", {"Value": "true"})
    on_elem = ET.SubElement(rack, "On")
    ET.SubElement(on_elem, "Manual", {"Value": "true"})
    ET.SubElement(rack, "UserName", {"Value": rack_name})
    ET.SubElement(rack, "Annotation", {"Value": f"Generated for {genre} via ableton_builder.py"})

    # Macro Controls (16 Macros)
    macro_controls = ET.SubElement(rack, "MacroControls")
    for idx in range(16):
        macro_info = next((m for m in macros if m.get("id") == idx + 1), None)
        macro_elem = ET.SubElement(macro_controls, "MacroControl", {"Id": str(idx)})
        if macro_info:
            ET.SubElement(macro_elem, "UserName", {"Value": macro_info.get("name", f"Macro {idx + 1}")})
            ET.SubElement(macro_elem, "Value", {"Value": str(macro_info.get("value", 0.5))})
            ET.SubElement(macro_elem, "DefaultValue", {"Value": str(macro_info.get("defaultValue", 0.5))})
            ET.SubElement(macro_elem, "Min", {"Value": str(macro_info.get("min", 0.0))})
            ET.SubElement(macro_elem, "Max", {"Value": str(macro_info.get("max", 1.0))})
        else:
            ET.SubElement(macro_elem, "UserName", {"Value": f"Macro {idx + 1}"})
            ET.SubElement(macro_elem, "Value", {"Value": "0.0"})

    # Branches (Chains)
    branches = ET.SubElement(rack, "Branches")
    for b_idx, chain in enumerate(chains):
        branch = ET.SubElement(branches, "AudioEffectBranch", {"Id": str(b_idx)})
        ET.SubElement(branch, "LomId", {"Value": "0"})
        ET.SubElement(branch, "Name", {"Value": chain.get("name", f"Chain {b_idx + 1}")})
        ET.SubElement(branch, "Color", {"Value": str(b_idx % 16)})
        ET.SubElement(branch, "IsExpanded", {"Value": "true"})
        ET.SubElement(branch, "Solo", {"Value": "true" if chain.get("solo") else "false"})
        ET.SubElement(branch, "Mute", {"Value": "true" if chain.get("muted") else "false"})

        # Mixer (Volume & Pan)
        mixer = ET.SubElement(branch, "Mixer")
        vol_db = chain.get("volumeDb", 0.0)
        vol_linear = 10.0 ** (vol_db / 20.0)
        vol_elem = ET.SubElement(mixer, "Volume")
        ET.SubElement(vol_elem, "Manual", {"Value": f"{vol_linear:.4f}"})
        pan_elem = ET.SubElement(mixer, "Pan")
        ET.SubElement(pan_elem, "Manual", {"Value": f"{chain.get('pan', 0.0):.3f}"})

        # Device Chain
        dev_chain = ET.SubElement(branch, "DeviceChain")
        devices_elem = ET.SubElement(dev_chain, "Devices")

        for d_idx, dev in enumerate(chain.get("devices", [])):
            dev_type = dev.get("type", "Utility")
            dev_name = dev.get("name", dev_type)
            params = dev.get("parameters", {})
            dev_elem = ET.SubElement(devices_elem, dev_type, {"Id": str(100 * (b_idx + 1) + d_idx)})
            ET.SubElement(dev_elem, "LomId", {"Value": "0"})
            ET.SubElement(dev_elem, "IsExpanded", {"Value": "true"})
            d_on = ET.SubElement(dev_elem, "On")
            ET.SubElement(d_on, "Manual", {"Value": "true" if dev.get("enabled", True) else "false"})
            ET.SubElement(dev_elem, "UserName", {"Value": dev_name})

            # Append core parameters
            if dev_type == "Eq8":
                bands = ET.SubElement(dev_elem, "Bands")
                for band_id in range(3):
                    b_elem = ET.SubElement(bands, "Eq8Band", {"Id": str(band_id)})
                    freq_val = params.get("lowCutFreq" if band_id == 0 else ("midFreq" if band_id == 1 else "highFreq"), 1000)
                    gain_val = params.get("lowGain" if band_id == 0 else ("midGain" if band_id == 1 else "highGain"), 0.0)
                    f_elem = ET.SubElement(b_elem, "Freq")
                    ET.SubElement(f_elem, "Manual", {"Value": str(freq_val)})
                    g_elem = ET.SubElement(b_elem, "Gain")
                    ET.SubElement(g_elem, "Manual", {"Value": str(gain_val)})
            elif dev_type == "Compressor2":
                th = ET.SubElement(dev_elem, "Threshold")
                ET.SubElement(th, "Manual", {"Value": str(params.get("thresholdDb", -18.0))})
                rt = ET.SubElement(dev_elem, "Ratio")
                ET.SubElement(rt, "Manual", {"Value": str(params.get("ratio", 4.0))})
            elif dev_type == "Saturator":
                drv = ET.SubElement(dev_elem, "Drive")
                ET.SubElement(drv, "Manual", {"Value": str(params.get("driveDb", 4.5))})

    # Macro Display Names
    macro_names = ET.SubElement(rack, "MacroDisplayNames")
    for m in macros:
        ET.SubElement(macro_names, "MacroDisplayName", {
            "Index": str(m.get("id", 1) - 1),
            "Value": m.get("name", "")
        })

    return ET.tostring(root, encoding="utf-8", xml_declaration=True)

def build_als_xml(plan_data):
    """
    Constructs a full Ableton Live Set (.als) project template XML.
    """
    project_name = plan_data.get("projectName", "Production Plan")
    tempo = plan_data.get("tempo", 128.0)
    markers = plan_data.get("markers", [])

    root = ET.Element("Ableton", {
        "MajorVersion": "5",
        "MinorVersion": "11.0_438",
        "SchemaChangeCount": "3",
        "Creator": "Ableton Live 11.3.10",
        "Revision": "7a8bc94e"
    })

    live_set = ET.SubElement(root, "LiveSet")
    tracks = ET.SubElement(live_set, "Tracks")

    # Audio Track 1
    audio_track = ET.SubElement(tracks, "AudioTrack", {"Id": "1"})
    t_name = ET.SubElement(audio_track, "Name")
    ET.SubElement(t_name, "UserName", {"Value": plan_data.get("rackName", "Vocal Bus")})

    # Master Track
    master_track = ET.SubElement(live_set, "MasterTrack", {"Id": "0"})
    master_mixer = ET.SubElement(live_set, "MasterTrackMixer")
    tempo_elem = ET.SubElement(master_mixer, "Tempo")
    ET.SubElement(tempo_elem, "Manual", {"Value": str(tempo)})

    # Locators (Markers)
    locators_wrapper = ET.SubElement(live_set, "Locators")
    locators = ET.SubElement(locators_wrapper, "Locators")
    for idx, marker in enumerate(markers):
        loc = ET.SubElement(locators, "Locator", {"Id": str(idx)})
        ET.SubElement(loc, "Time", {"Value": str(marker.get("timeInBeats", 0))})
        ET.SubElement(loc, "Name", {"Value": marker.get("name", "Marker")})

    return ET.tostring(root, encoding="utf-8", xml_declaration=True)

def encode_variable_length(value):
    """Encodes an integer into MIDI variable-length quantity bytes."""
    buf = value & 0x7F
    bytes_arr = []
    while value > 0x7F:
        value >>= 7
        buf <<= 8
        buf |= ((value & 0x7F) | 0x80)
    while True:
        bytes_arr.append(buf & 0xFF)
        if buf & 0x80:
            buf >>= 8
        else:
            break
    return bytes(bytes_arr)

def build_midi_file(plan_data):
    """
    Generates a Standard MIDI File (SMF Format 1) with markers and chord progression.
    """
    ticks_per_quarter = 480
    tempo = plan_data.get("tempo", 120)
    us_per_beat = int(round(60000000 / tempo))

    # Track 1: Conductor
    trk1 = bytearray()
    # Time Sig 4/4
    trk1.extend(b'\\x00\\xFF\\x58\\x04\\x04\\x02\\x18\\x08')
    # Tempo
    trk1.extend(b'\\x00\\xFF\\x51\\x03' + struct.pack(">I", us_per_beat)[1:])

    # Markers
    last_tick = 0
    for marker in sorted(plan_data.get("markers", []), key=lambda m: m.get("timeInBeats", 0)):
        target_tick = int(round(marker.get("timeInBeats", 0) * ticks_per_quarter))
        delta = max(0, target_tick - last_tick)
        last_tick = target_tick
        name_bytes = marker.get("name", "").encode("utf-8")
        trk1.extend(encode_variable_length(delta))
        trk1.extend(b'\\xFF\\x06' + bytes([len(name_bytes)]) + name_bytes)

    # End of track 1
    trk1.extend(b'\\x00\\xFF\\x2F\\x00')

    # Track 2: Chords
    trk2 = bytearray()
    trk_name = f"Chords {plan_data.get('key', 'C')} {plan_data.get('scale', 'Major')}".encode("utf-8")
    trk2.extend(b'\\x00\\xFF\\x03' + bytes([len(trk_name)]) + trk_name)

    events = []
    for chord in plan_data.get("chords", []):
        start_tick = int(round(chord.get("timeInBeats", 0) * ticks_per_quarter))
        dur_tick = int(round(chord.get("durationInBeats", 4) * ticks_per_quarter))
        end_tick = start_tick + dur_tick
        for note in chord.get("notes", []):
            events.append((start_tick, 0x90, note, chord.get("velocity", 90)))
            events.append((end_tick, 0x80, note, 0))

    events.sort(key=lambda x: (x[0], 0 if x[1] == 0x80 else 1))

    last_tick = 0
    for tick, ev_type, note, vel in events:
        delta = max(0, tick - last_tick)
        last_tick = tick
        trk2.extend(encode_variable_length(delta))
        trk2.extend(bytes([ev_type, note & 0x7F, vel & 0x7F]))

    # End of track 2
    trk2.extend(b'\\x00\\xFF\\x2F\\x00')

    # MIDI File Header
    header = b'MThd\\x00\\x00\\x00\\x06\\x00\\x01\\x00\\x02' + struct.pack(">H", ticks_per_quarter)
    trk1_chunk = b'MTrk' + struct.pack(">I", len(trk1)) + bytes(trk1)
    trk2_chunk = b'MTrk' + struct.pack(">I", len(trk2)) + bytes(trk2)

    return header + trk1_chunk + trk2_chunk

def export_plan_to_ableton(plan_data, output_dir=None, inject_library=False):
    """
    Main builder routine: creates .adg, .als, and .mid files.
    """
    rack_name = plan_data.get("rackName", "AI_Production_Rack").replace(" ", "_")
    project_name = plan_data.get("projectName", "Ableton_Session").replace(" ", "_")

    if inject_library:
        _, rack_dir = get_ableton_user_library_path()
        target_dir = rack_dir / plan_data.get("userLibraryTargetSubfolder", "AI Generated Racks")
    elif output_dir:
        target_dir = Path(output_dir)
    else:
        target_dir = Path("./ableton_output")

    target_dir.mkdir(parents=True, exist_ok=True)
    results = {}

    # 1. Build & Gzip Audio Effect Rack (.adg)
    rack_xml = build_rack_xml(plan_data)
    adg_path = target_dir / f"{rack_name}.adg"
    with gzip.open(adg_path, "wb", compresslevel=9) as f:
        f.write(rack_xml)
    results["adg"] = str(adg_path)

    # 2. Build & Gzip Project Set (.als)
    als_xml = build_als_xml(plan_data)
    als_path = target_dir / f"{project_name}_Template.als"
    with gzip.open(als_path, "wb", compresslevel=9) as f:
        f.write(als_xml)
    results["als"] = str(als_path)

    # 3. Build MIDI (.mid)
    midi_bytes = build_midi_file(plan_data)
    mid_path = target_dir / f"{project_name}_Structure.mid"
    with open(mid_path, "wb") as f:
        f.write(midi_bytes)
    results["mid"] = str(mid_path)

    return results

def main():
    parser = argparse.ArgumentParser(description="Ableton Builder & Injector Tool (ableton_builder.py)")
    parser.add_argument("--input", "-i", help="Path to production_plan.json input file")
    parser.add_argument("--output-dir", "-o", help="Target output directory for .adg, .als, and .mid")
    parser.add_argument("--target-library", "-l", action="store_true", help="Directly inject into Ableton User Library folder")
    parser.add_argument("--test", action="store_true", help="Run self-test with embedded production plan")

    args = parser.parse_args()

    plan_data = None
    if args.input:
        with open(args.input, "r", encoding="utf-8") as f:
            plan_data = json.load(f)
    elif args.test or DEFAULT_EMBEDDED_PLAN.strip():
        if DEFAULT_EMBEDDED_PLAN.strip():
            plan_data = json.loads(DEFAULT_EMBEDDED_PLAN)
        else:
            print("No input provided. Generating demo vocal rack plan...")
            plan_data = {
                "projectName": "Hyperpop_Vocal_Studio",
                "genre": "Hyperpop / Modern Pop",
                "tempo": 140,
                "key": "F#",
                "scale": "Minor",
                "rackName": "Hyperpop Vocal Magic Bus",
                "macros": [
                    {"id": 1, "name": "Air / High Sparkle", "value": 0.75},
                    {"id": 2, "name": "Vocal Body Comp", "value": 0.60},
                    {"id": 3, "name": "Tube Warmth Drive", "value": 0.40},
                    {"id": 4, "name": "Space Reverb Wet", "value": 0.35}
                ],
                "chains": [
                    {"name": "Dry Direct Vocal", "volumeDb": 0.0, "devices": [{"type": "Eq8", "name": "Vocal Cleanup EQ", "enabled": True, "parameters": {"lowCutFreq": 90, "midGain": 1.5, "highGain": 3.0}}]},
                    {"name": "Parallel Comp + Saturator", "volumeDb": -6.0, "devices": [{"type": "Compressor2", "name": "Slammer Comp", "enabled": True, "parameters": {"thresholdDb": -24, "ratio": 8.0}}]}
                ],
                "markers": [
                    {"timeInBeats": 0, "name": "Intro"},
                    {"timeInBeats": 32, "name": "Verse 1"},
                    {"timeInBeats": 64, "name": "Chorus (Drop)"},
                    {"timeInBeats": 96, "name": "Outro"}
                ],
                "chords": [
                    {"timeInBeats": 0, "durationInBeats": 8, "chordName": "F#m", "notes": [54, 57, 61, 66], "velocity": 90},
                    {"timeInBeats": 8, "durationInBeats": 8, "chordName": "D", "notes": [50, 54, 57, 62], "velocity": 90},
                    {"timeInBeats": 16, "durationInBeats": 8, "chordName": "A", "notes": [57, 61, 64, 69], "velocity": 90},
                    {"timeInBeats": 24, "durationInBeats": 8, "chordName": "E", "notes": [52, 56, 59, 64], "velocity": 90}
                ]
            }

    if not plan_data:
        parser.print_help()
        sys.exit(1)

    print("================================================================")
    print("  Ableton Live Builder & Injector (ableton_builder.py)          ")
    print("================================================================")
    print(f"Project: {plan_data.get('projectName')}")
    print(f"Rack:    {plan_data.get('rackName')}")
    print(f"Tempo:   {plan_data.get('tempo')} BPM | Key: {plan_data.get('key')} {plan_data.get('scale')}")
    
    results = export_plan_to_ableton(plan_data, output_dir=args.output_dir, inject_library=args.target_library)

    print("\\n[SUCCESS] Generated Ableton native files:")
    print(f"  [+] Audio Effect Rack (.adg): {results['adg']}")
    print(f"  [+] Live Set Template  (.als): {results['als']}")
    print(f"  [+] MIDI Structure     (.mid): {results['mid']}")
    print("\\nFiles are compressed with Gzip and ready to drag directly into Ableton Live!")

if __name__ == "__main__":
    main()
`;
}

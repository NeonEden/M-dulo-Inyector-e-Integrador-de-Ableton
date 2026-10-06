import { gzip, ungzip } from 'pako';
import { ProductionPlan, AbletonDevice, ChainBranch, MacroControl } from '../types/ableton';

/**
 * Escapes XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Generates XML for an individual Ableton Live Device
 */
function generateDeviceXml(device: AbletonDevice, deviceId: number): string {
  const isEnabled = device.enabled ? 'true' : 'false';
  const name = escapeXml(device.name || device.type);

  switch (device.type) {
    case 'Eq8':
      return `
        <Eq8 Id="${deviceId}">
          <LomId Value="0" />
          <IsExpanded Value="true" />
          <On>
            <Manual Value="${isEnabled}" />
          </On>
          <UserName Value="${name}" />
          <Bands>
            <Eq8Band Id="0">
              <Freq><Manual Value="${device.parameters.lowCutFreq ?? 80}" /></Freq>
              <Gain><Manual Value="${device.parameters.lowGain ?? 0.0}" /></Gain>
              <Q><Manual Value="0.71" /></Q>
              <Mode Value="1" />
              <IsOn Value="true" />
            </Eq8Band>
            <Eq8Band Id="1">
              <Freq><Manual Value="${device.parameters.midFreq ?? 1200}" /></Freq>
              <Gain><Manual Value="${device.parameters.midGain ?? 1.5}" /></Gain>
              <Q><Manual Value="1.0" /></Q>
              <Mode Value="3" />
              <IsOn Value="true" />
            </Eq8Band>
            <Eq8Band Id="2">
              <Freq><Manual Value="${device.parameters.highFreq ?? 8500}" /></Freq>
              <Gain><Manual Value="${device.parameters.highGain ?? 3.0}" /></Gain>
              <Q><Manual Value="0.8" /></Q>
              <Mode Value="4" />
              <IsOn Value="true" />
            </Eq8Band>
          </Bands>
        </Eq8>`;

    case 'Compressor2':
      return `
        <Compressor2 Id="${deviceId}">
          <LomId Value="0" />
          <IsExpanded Value="true" />
          <On>
            <Manual Value="${isEnabled}" />
          </On>
          <UserName Value="${name}" />
          <Threshold><Manual Value="${device.parameters.thresholdDb ?? -18.0}" /></Threshold>
          <Ratio><Manual Value="${device.parameters.ratio ?? 4.0}" /></Ratio>
          <Attack><Manual Value="${device.parameters.attackMs ?? 15.0}" /></Attack>
          <Release><Manual Value="${device.parameters.releaseMs ?? 100.0}" /></Release>
          <Gain><Manual Value="${device.parameters.makeupGainDb ?? 3.0}" /></Gain>
          <DryWet><Manual Value="${device.parameters.dryWet ?? 1.0}" /></DryWet>
        </Compressor2>`;

    case 'Saturator':
      return `
        <Saturator Id="${deviceId}">
          <LomId Value="0" />
          <IsExpanded Value="true" />
          <On>
            <Manual Value="${isEnabled}" />
          </On>
          <UserName Value="${name}" />
          <Drive><Manual Value="${device.parameters.driveDb ?? 4.5}" /></Drive>
          <CurveType Value="${device.parameters.curveType ?? 1}" />
          <Output><Manual Value="${device.parameters.outputDb ?? -1.0}" /></Output>
          <DryWet><Manual Value="${device.parameters.dryWet ?? 0.8}" /></DryWet>
          <Color Value="true" />
        </Saturator>`;

    case 'Reverb':
      return `
        <Reverb Id="${deviceId}">
          <LomId Value="0" />
          <IsExpanded Value="true" />
          <On>
            <Manual Value="${isEnabled}" />
          </On>
          <UserName Value="${name}" />
          <DecayTime><Manual Value="${device.parameters.decayTimeSec ?? 2.8}" /></DecayTime>
          <PreDelay><Manual Value="${device.parameters.preDelayMs ?? 20.0}" /></PreDelay>
          <RoomSize><Manual Value="${device.parameters.roomSize ?? 75.0}" /></RoomSize>
          <DryWet><Manual Value="${device.parameters.dryWet ?? 0.35}" /></DryWet>
          <StereoSeparation><Manual Value="${device.parameters.stereoWidth ?? 100.0}" /></StereoSeparation>
        </Reverb>`;

    case 'Delay':
      return `
        <Delay Id="${deviceId}">
          <LomId Value="0" />
          <IsExpanded Value="true" />
          <On>
            <Manual Value="${isEnabled}" />
          </On>
          <UserName Value="${name}" />
          <DelayMode Value="0" />
          <Feedback><Manual Value="${device.parameters.feedback ?? 0.45}" /></Feedback>
          <DryWet><Manual Value="${device.parameters.dryWet ?? 0.25}" /></DryWet>
          <PingPong Value="true" />
        </Delay>`;

    case 'AutoFilter':
      return `
        <AutoFilter Id="${deviceId}">
          <LomId Value="0" />
          <IsExpanded Value="true" />
          <On>
            <Manual Value="${isEnabled}" />
          </On>
          <UserName Value="${name}" />
          <Cutoff><Manual Value="${device.parameters.cutoffFreq ?? 3500}" /></Cutoff>
          <Resonance><Manual Value="${device.parameters.resonance ?? 0.3}" /></Resonance>
          <FilterType Value="${device.parameters.filterType ?? 0}" />
        </AutoFilter>`;

    case 'Utility':
      return `
        <Utility Id="${deviceId}">
          <LomId Value="0" />
          <IsExpanded Value="true" />
          <On>
            <Manual Value="${isEnabled}" />
          </On>
          <UserName Value="${name}" />
          <Gain><Manual Value="${device.parameters.gainDb ?? 0.0}" /></Gain>
          <Pan><Manual Value="${device.parameters.pan ?? 0.0}" /></Pan>
          <Width><Manual Value="${device.parameters.width ?? 1.2}" /></Width>
          <BassMono Value="${device.parameters.bassMono ? 'true' : 'false'}" />
          <BassMonoFreq Value="120" />
        </Utility>`;

    case 'Limiter':
      return `
        <Limiter Id="${deviceId}">
          <LomId Value="0" />
          <IsExpanded Value="true" />
          <On>
            <Manual Value="${isEnabled}" />
          </On>
          <UserName Value="${name}" />
          <Gain><Manual Value="${device.parameters.gainDb ?? 2.0}" /></Gain>
          <Ceiling><Manual Value="${device.parameters.ceilingDb ?? -0.3}" /></Ceiling>
          <Lookahead Value="1" />
          <Release><Manual Value="100.0" /></Release>
        </Limiter>`;

    default:
      return `
        <GenericDevice Id="${deviceId}">
          <LomId Value="0" />
          <IsExpanded Value="true" />
          <On><Manual Value="${isEnabled}" /></On>
          <UserName Value="${name}" />
        </GenericDevice>`;
  }
}

/**
 * Generates XML for a Rack Branch (Chain)
 */
function generateBranchXml(branch: ChainBranch, branchId: number): string {
  let devIdCounter = 100 * (branchId + 1);
  const devicesXml = branch.devices
    .map((dev) => generateDeviceXml(dev, devIdCounter++))
    .join('\n');

  const volLinear = Math.pow(10, (branch.volumeDb || 0) / 20);

  return `
    <AudioEffectBranch Id="${branchId}">
      <LomId Value="0" />
      <Name Value="${escapeXml(branch.name)}" />
      <Color Value="${branchId % 16}" />
      <IsExpanded Value="true" />
      <Solo Value="${branch.solo ? 'true' : 'false'}" />
      <Mute Value="${branch.muted ? 'true' : 'false'}" />
      <Mixer>
        <Volume>
          <Manual Value="${volLinear.toFixed(4)}" />
        </Volume>
        <Pan>
          <Manual Value="${(branch.pan || 0).toFixed(3)}" />
        </Pan>
      </Mixer>
      <DeviceChain>
        <Devices>
          ${devicesXml}
        </Devices>
      </DeviceChain>
    </AudioEffectBranch>`;
}

/**
 * Generates the full Ableton Live Audio Effect Rack XML string (.adg structure)
 */
export function generateAbletonRackXml(plan: ProductionPlan): string {
  const rackName = escapeXml(plan.rackName || plan.projectName || 'AI Production Rack');
  const branchesXml = plan.chains
    .map((branch, idx) => generateBranchXml(branch, idx))
    .join('\n');

  // Fill 16 Macros
  const macrosXml = Array.from({ length: 16 }).map((_, idx) => {
    const macro = plan.macros.find((m) => m.id === idx + 1);
    const name = macro ? escapeXml(macro.name) : `Macro ${idx + 1}`;
    const value = macro ? (macro.value ?? 0.5).toFixed(4) : '0.0000';
    return `
      <MacroControl Id="${idx}">
        <UserName Value="${name}" />
        <Value Value="${value}" />
        <DefaultValue Value="${macro?.defaultValue ?? 0.5}" />
        <Min Value="${macro?.min ?? 0.0}" />
        <Max Value="${macro?.max ?? 1.0}" />
      </MacroControl>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<Ableton MajorVersion="5" MinorVersion="11.0_438" SchemaChangeCount="3" Creator="Ableton Live 11.3.10" Revision="7a8bc94e">
  <AudioEffectGroupDevice Id="0">
    <LomId Value="0" />
    <IsExpanded Value="true" />
    <On>
      <Manual Value="true" />
    </On>
    <UserName Value="${rackName}" />
    <Annotation Value="Generated automatically by Ableton Builder &amp; Injector Studio for ${escapeXml(plan.genre)}." />
    <MacroControls>
      ${macrosXml}
    </MacroControls>
    <Branches>
      ${branchesXml}
    </Branches>
    <MacroDisplayNames>
      ${plan.macros.map(m => `<MacroDisplayName Index="${m.id - 1}" Value="${escapeXml(m.name)}" />`).join('\n      ')}
    </MacroDisplayNames>
  </AudioEffectGroupDevice>
</Ableton>`;
}

/**
 * Generates the full Ableton Live Project XML string (.als structure)
 */
export function generateAbletonProjectXml(plan: ProductionPlan): string {
  const projectName = escapeXml(plan.projectName || 'Production Plan Set');
  const rackXml = generateAbletonRackXml(plan);
  
  // Locators (Song Structure Markers)
  const locatorsXml = plan.markers.map((marker, idx) => `
    <Locator Id="${idx}">
      <Time Value="${marker.timeInBeats}" />
      <Name Value="${escapeXml(marker.name)}" />
      <Annotation Value="" />
      <IsSongStart Value="${idx === 0 ? 'true' : 'false'}" />
    </Locator>
  `).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<Ableton MajorVersion="5" MinorVersion="11.0_438" SchemaChangeCount="3" Creator="Ableton Live 11.3.10" Revision="7a8bc94e">
  <LiveSet>
    <Tracks>
      <!-- Audio Track 1 with Injected Audio Effect Rack -->
      <AudioTrack Id="1">
        <LomId Value="1" />
        <Name>
          <EffectiveName Value="${escapeXml(plan.rackName || 'Vocal Chain')}" />
          <UserName Value="${escapeXml(plan.rackName || 'Vocal Chain')}" />
        </Name>
        <Color Value="12" />
        <DeviceChain>
          <Devices>
            ${rackXml.replace('<?xml version="1.0" encoding="UTF-8"?>', '').replace(/<Ableton[^>]*>/, '').replace('</Ableton>', '')}
          </Devices>
        </DeviceChain>
      </AudioTrack>

      <!-- MIDI Chord / Harmony Track -->
      <MidiTrack Id="2">
        <LomId Value="2" />
        <Name>
          <EffectiveName Value="Harmonic Structure [${escapeXml(plan.key)} ${escapeXml(plan.scale)}]" />
          <UserName Value="Harmonic Structure [${escapeXml(plan.key)} ${escapeXml(plan.scale)}]" />
        </Name>
        <Color Value="8" />
        <DeviceChain>
          <Devices />
        </DeviceChain>
      </MidiTrack>
    </Tracks>
    
    <MasterTrack Id="0">
      <Name>
        <EffectiveName Value="Master" />
      </Name>
      <DeviceChain>
        <Devices />
      </DeviceChain>
    </MasterTrack>

    <MasterTrackMixer>
      <Tempo>
        <Manual Value="${plan.tempo || 128}" />
      </Tempo>
      <TimeSignature>
        <Numerator Value="${plan.timeSignature?.numerator || 4}" />
        <Denominator Value="${plan.timeSignature?.denominator || 4}" />
      </TimeSignature>
    </MasterTrackMixer>

    <Locators>
      <Locators>
        ${locatorsXml}
      </Locators>
    </Locators>
  </LiveSet>
</Ableton>`;
}

/**
 * Compresses an XML string into a GZIP binary buffer (.adg or .als)
 */
export function compressToAbletonBinary(xmlString: string): Uint8Array {
  const textEncoder = new TextEncoder();
  const rawBytes = textEncoder.encode(xmlString);
  return gzip(rawBytes, { level: 9 });
}

/**
 * Decompresses an Ableton binary buffer (.adg or .als) back to XML string
 */
export function decompressAbletonBinary(binaryData: Uint8Array): string {
  const decompressed = ungzip(binaryData);
  const textDecoder = new TextDecoder('utf-8');
  return textDecoder.decode(decompressed);
}

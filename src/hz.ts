const PT_OFFSET = 25.58;
const PT_SLOPE = 63.07;

export function getPitchHz(modelPitch: number): number {
  const fmin = 10.0;
  const bins_per_octave = 12.0;
  const cqt_bin = modelPitch * PT_SLOPE + PT_OFFSET;
  return fmin * Math.pow(2.0, (1.0 * cqt_bin) / bins_per_octave);
}

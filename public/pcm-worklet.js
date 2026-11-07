const TARGET_RATE = 16000;

class PCMWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.step = sampleRate / TARGET_RATE;
    this.pos = 0;
    this.carry = new Float32Array(0);
  }

  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input) return true;
    const buffer = new Float32Array(this.carry.length + input.length);
    buffer.set(this.carry);
    buffer.set(input, this.carry.length);
    const output = [];
    while (this.pos + 1 < buffer.length) {
      const index = Math.floor(this.pos);
      const fraction = this.pos - index;
      const sample = Math.max(-1, Math.min(1, buffer[index] * (1 - fraction) + buffer[index + 1] * fraction));
      output.push(sample < 0 ? sample * 0x8000 : sample * 0x7fff);
      this.pos += this.step;
    }
    const used = Math.floor(this.pos);
    this.carry = buffer.slice(used);
    this.pos -= used;
    if (output.length) {
      const pcm = Int16Array.from(output);
      this.port.postMessage(pcm.buffer, [pcm.buffer]);
    }
    return true;
  }
}

registerProcessor('pcm-worklet', PCMWorklet);

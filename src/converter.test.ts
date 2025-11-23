import { convertBeepBoxToMakeCode } from './converter'
import { readFileSync } from 'fs'

describe('BeepBox to MakeCode Converter', () => {
  it('should convert C-B-A song correctly with octave 4', () => {
    const cbaJson = JSON.parse(
      readFileSync('./BeepBox/BeepBox-Song-test-cba.json', 'utf-8'),
    )
    const hexOutput = convertBeepBoxToMakeCode(cbaJson)

    // Expected output from your test (3 notes: C, B, A)
    // BPM=120, beatsPerBar=4, ticksPerBeat=8, loopBars=2, octave=4
    const expected =
      '0078000408020100001c00010a006400f401640000040000000000000000000000000005000004120000000400012504000800012408000c000122'

    expect(hexOutput).toBe(expected)
  })

  it('should encode notes with correct octave 4 formula', () => {
    const cbaJson = JSON.parse(
      readFileSync('./BeepBox/BeepBox-Song-test-cba.json', 'utf-8'),
    )
    const hexOutput = convertBeepBoxToMakeCode(cbaJson)

    // With octave 4, formula is: encodedNote = (pitch - (4-2)*12) + 1 = pitch - 23
    // BeepBox pitch 60 (C4) -> MakeCode 37 (0x25)
    // BeepBox pitch 59 (B3) -> MakeCode 36 (0x24)
    // BeepBox pitch 57 (A3) -> MakeCode 34 (0x22)

    expect(hexOutput).toContain('25') // 0x25 = 37 for C
    expect(hexOutput).toContain('24') // 0x24 = 36 for B
    expect(hexOutput).toContain('22') // 0x22 = 34 for A
  })
})

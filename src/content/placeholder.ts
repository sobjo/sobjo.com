import type { BenchContent } from '@/shared/lib/types'

/**
 * The placeholder bench items from the original mockups. The Bench page shows
 * these when no database is configured, and `npm run seed` copies them into the
 * CMS so you can edit them from /addpost.
 *
 * Projects and notebook entries live in ./projects.json and ./notebook.json and
 * are edited at /update-site.
 */

const usedIn = ['[Projects]']

export const placeholderBench: BenchContent = {
  equipment: [
    {
      id: 'psu',
      name: 'Power supply',
      model: '[Model]',
      location: 'Left end',
      description: 'Adjustable bench power with a current limit, so a wiring mistake trips the limit instead of frying a board.',
      spot: 'psu',
      usedIn,
    },
    {
      id: 'solder',
      name: 'Soldering station',
      model: '[Model]',
      location: 'Front left',
      description: 'Temperature-controlled iron for assembling boards, pin headers and motor leads.',
      spot: 'solder',
      usedIn,
    },
    {
      id: 'printer',
      name: '3D printer',
      model: '[Model]',
      location: 'Middle',
      description: 'Prints our mounts, enclosures and mechanical parts in PLA.',
      spot: 'printer',
      usedIn,
    },
    {
      id: 'scope',
      name: 'Oscilloscope',
      model: '[Model]',
      location: 'Right of center',
      description: 'Shows signals over time, so we can check PWM, encoder pulses and sensor noise.',
      spot: 'scope',
      usedIn,
    },
    {
      id: 'monitor',
      name: 'Computer',
      model: '[Model]',
      location: 'Right end',
      description: 'Where the CAD models, firmware and control code come together.',
      spot: 'monitor',
      usedIn,
    },
  ],
  parts: [
    { id: 'esp32', name: 'ESP32', group: 'microcontrollers', description: '[What we use it for]', usedIn },
    { id: 'rpi', name: 'Raspberry Pi', group: 'microcontrollers', description: '[What we use it for]', usedIn },
    { id: 'stm32', name: 'STM32', group: 'microcontrollers', description: '[What we use it for]', usedIn },
    { id: 'imu', name: 'IMU', group: 'sensors', description: '[What we use it for]', usedIn },
    { id: 'motor', name: '[Motor + driver]', group: 'motors', description: '[What we use it for]', usedIn },
    { id: 'pla', name: 'PLA filament', group: 'materials', description: '[What we use it for]', usedIn },
  ],
  software: [
    { id: 'lang-1', name: '[Language]', group: 'languages', tag: '[ ]', description: '[What we write in it]' },
    { id: 'lang-2', name: '[Language]', group: 'languages', tag: '[ ]', description: '[What we write in it]' },
    { id: 'fusion', name: 'Fusion 360', group: 'cad', tag: 'F360', description: 'Mechanical design and parts for printing' },
    { id: 'linux', name: 'Linux', group: 'os', tag: 'LNX', description: '[How we use it]' },
    { id: 'tool', name: '[Tool]', group: 'os', tag: '[ ]', description: '[How we use it]' },
  ],
}

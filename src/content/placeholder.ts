import type { BenchContent } from '@/shared/lib/types'

/**
 * The placeholder bench items from the original mockups. The Bench page shows
 * these when no database is configured, and `npm run seed` copies them into the
 * CMS so you can edit them from /addpost.
 *
 * Projects and notebook entries live in ./projects.json and ./notebook.json and
 * are edited at /update-site.
 */

export const placeholderBench: BenchContent = {
  equipment: [
    {
      id: 'hot-air',
      name: 'Hot air rework station',
      model: 'WEP 8858-V',
      location: null,
      description: null,
      spot: null,
      usedIn: [],
    },
    {
      id: 'hot-plate',
      name: 'Soldering hot plate',
      model: 'PCB Rework DIY 110V 350W',
      location: null,
      description: null,
      spot: null,
      usedIn: [],
    },
    {
      id: 'psu',
      name: 'Bench power supply',
      model: 'Variable DC, 0–30V 0–10A',
      location: null,
      description: null,
      spot: 'psu',
      usedIn: [],
    },
    {
      id: 'solder',
      name: 'Soldering station',
      model: 'YIHUA 939D+',
      location: null,
      description: null,
      spot: 'solder',
      usedIn: [],
    },
    {
      id: 'multimeter',
      name: 'Multimeter',
      model: 'Klein Tools ET270',
      location: null,
      description: null,
      spot: null,
      usedIn: [],
    },
    {
      id: 'printer',
      name: '3D printer',
      model: 'Bambu Lab P2S',
      location: null,
      description: null,
      spot: 'printer',
      usedIn: [],
    },
    {
      id: 'scope',
      name: 'Oscilloscope',
      model: 'HP/Agilent/Keysight 54645A/D',
      location: null,
      description: null,
      spot: 'scope',
      usedIn: [],
    },
  ],
  parts: [
    { id: 'esp32-s3', name: 'ESP32-S3', group: 'microcontrollers', description: 'Wi-Fi and BLE MCU', usedIn: [] },
    { id: 'stm32g431', name: 'STM32G431', group: 'microcontrollers', description: 'Motor control MCU', usedIn: [] },
    { id: 'ch32v203', name: 'CH32V203', group: 'microcontrollers', description: 'RISC-V MCU', usedIn: [] },
    { id: 'sg2002', name: 'SG2002/SG2000', group: 'microcontrollers', description: 'Linux SoC', usedIn: [] },
    { id: 'icm-20948', name: 'ICM-20948', group: 'sensors', description: '9-axis IMU', usedIn: [] },
    { id: 'lsm6ds3', name: 'LSM6DS3', group: 'sensors', description: '6-axis IMU', usedIn: [] },
    { id: 'mt6701', name: 'MT6701', group: 'sensors', description: 'Magnetic encoder', usedIn: [] },
    { id: 'itr20403', name: 'ITR20403', group: 'sensors', description: 'IR reflective sensor', usedIn: [] },
    { id: 'nidec-24h', name: 'Nidec 24H', group: 'motors', description: 'Brushless motor', usedIn: [] },
    { id: 'drv8323s', name: 'DRV8323S', group: 'motors', description: 'FOC gate driver', usedIn: [] },
    { id: 'drv8833', name: 'DRV8833', group: 'motors', description: 'Dual H-bridge driver', usedIn: [] },
    { id: 'ble', name: 'BLE', group: 'comms', description: 'Bluetooth Low Energy', usedIn: [] },
    { id: 'wifi', name: 'Wi-Fi', group: 'comms', description: 'Wireless networking', usedIn: [] },
    { id: 'can-fd', name: 'CAN-FD', group: 'comms', description: 'Motor and sensor bus', usedIn: [] },
    { id: 'pla', name: 'PLA filament', group: 'materials', description: '3D printing', usedIn: [] },
  ],
  software: [
    { id: 'typescript', name: 'TypeScript', group: 'languages', tag: 'TS', description: null },
    { id: 'c', name: 'C', group: 'languages', tag: 'C', description: null },
    { id: 'python', name: 'Python', group: 'languages', tag: 'PY', description: null },
    { id: 'matlab', name: 'MATLAB/Simulink', group: 'languages', tag: 'MAT', description: null },
    { id: 'css', name: 'CSS', group: 'languages', tag: 'CSS', description: null },
    { id: 'kicad', name: 'KiCad', group: 'cad', tag: 'KCD', description: 'PCB design' },
    { id: 'fusion', name: 'Fusion 360', group: 'cad', tag: 'F360', description: 'Mechanical CAD' },
    { id: 'isaac-sim', name: 'Isaac Sim', group: 'cad', tag: 'ISIM', description: 'Robot simulation' },
    { id: 'esp-idf', name: 'ESP-IDF/FreeRTOS', group: 'os', tag: 'IDF', description: 'ESP32 firmware' },
    { id: 'nextjs', name: 'Next.js/React', group: 'os', tag: 'NXT', description: 'Web apps' },
    { id: 'react-native', name: 'React Native (Expo)', group: 'os', tag: 'RN', description: 'Mobile apps' },
    { id: 'threejs', name: 'Three.js', group: 'os', tag: '3JS', description: '3D on the web' },
    { id: 'linux', name: 'Linux', group: 'os', tag: 'LNX', description: 'Operating system' },
  ],
}

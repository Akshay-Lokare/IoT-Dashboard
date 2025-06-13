// src/helpers/motionPayload.js

const sensorType = {
  motion: '6A',
  temperature: '67',
  feedback: '70',
  error: 'FF'
};

export const createInitialMotionEvent = (motionCount, battery) => {
  let payload_header = '00';

  try {
    const typeCode = 'motion';
    const sensor_type = sensorType[typeCode];

    let motionHexBattery = battery.toString(16).padStart(4, '0').toUpperCase();
    let motionHexCount = motionCount.toString(16).padStart(4, '0').toUpperCase();

    let payload = payload_header + sensor_type + motionHexBattery + motionHexCount;

    console.log(`⚡ Motion Event payload created: ${payload}`);
    return payload;

  } catch (error) {
    console.error("❌ Error creating motion event payload:", error.message);
  }
};

export const motionPayloadDecoder = (payload) => {
  try {
    const payload_header = payload.slice(0, 2);
    const sensor_type = payload.slice(2, 4);
    const battery_hex = payload.slice(4, 8);
    const motion_event_hex = payload.slice(8);

    const sensorHexMap = Object.fromEntries(
      Object.entries(sensorType).map(([key, value]) => [value, key])
    );

    const battery = parseInt(battery_hex, 16);
    const event = parseInt(motion_event_hex, 16);

    console.log(`📥 Decoded Payload:
- Header: ${payload_header}
- Sensor Type: ${sensor_type} (${sensorHexMap[sensor_type] || 'Unknown'})
- Battery: ${battery}%
- Data: ${event}
    `);

  } catch (error) {
    console.error('❌ Error decoding payload:', error.message);
  }
};

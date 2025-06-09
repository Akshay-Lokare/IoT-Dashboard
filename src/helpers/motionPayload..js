const sensorType = require('./sensorType.js');

const createInitialMotionEvent = () => {
    let payload_header = '00'; 
    
    try {
        const typeCode = 'motion';  // the key we'll use to lookup from sensorType dict
        const sensor_type = sensorType[typeCode];  // get hex code for "motion" sensor from dict

        let battery = 100;  // battery level percentage
        let motionHexBattery = battery.toString(16).padStart(4, '0').toUpperCase(); 

        let motionCount = 0;  // initial count of motion events
        let motionHexCount = motionCount.toString(16).padStart(4, '0').toUpperCase(); 

        // Build the full payload: header + sensor type + battery + count
        let payload = payload_header + sensor_type + motionHexBattery + motionHexCount;

        console.log(`⚡ Motion Event payload created: ${payload}`);

        return payload;

    } catch (error) {
        console.error("❌ Error creating motion event payload:", error.message);
    }
};


const motionPayloadDecoder = (payload) => {
    try {
        const payload_header = payload.slice(0, 2);
        const sensor_type = payload.slice(2,4);
        const battery_hex = payload.slice(4, 8);
        const motion_event_hex = payload.slice(8);

        // const sensorName = sensorType[sensor_type] || 'Unknown';
        
        // Reverse the sensorType mapping
        const sensorHexMap = Object.fromEntries(
        Object.entries(sensorType).map(([key, value]) => [value, key])
        );

        const battery = parseInt(battery_hex, 16);
        const event = parseInt(motion_event_hex, 16);

        console.log(`📥 Decoded Payload:
        - Header: ${payload_header}
        - Sensor Type: ${sensor_type} (${sensorHexMap})
        - Battery: ${battery}%
        - Data: ${event}
        `);

    } catch (error) {
        console.error('❌ Error decoding payload:', err.message);
    }
};


module.exports = {
  createInitialMotionEvent,
  motionPayloadDecoder
};
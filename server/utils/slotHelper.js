const Slot = require('../models/Slot');

const generateSlotsForDate = async (turf_id, date, openingTime, closingTime, price, duration = 60) => {
    const slots = [];
    let [startHour, startMin] = openingTime.split(':').map(Number);
    let [endHour, endMin] = closingTime.split(':').map(Number);

    let currentTotalMins = startHour * 60 + startMin;
    const endTotalMins = endHour * 60 + endMin;

    while (currentTotalMins + duration <= endTotalMins) {
        const startH = Math.floor(currentTotalMins / 60);
        const startM = currentTotalMins % 60;
        const endTotal = currentTotalMins + duration;
        const endH = Math.floor(endTotal / 60);
        const endM = endTotal % 60;

        const startTimeStr = `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`;
        const endTimeStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

        slots.push({
            turf_id,
            date,
            start_time: startTimeStr,
            end_time: endTimeStr,
            price,
            status: 'available'
        });

        currentTotalMins += duration;
    }

    try {
        // Using insertMany with ordered: false to skip duplicates
        await Slot.insertMany(slots, { ordered: false });
        return { success: true, count: slots.length };
    } catch (error) {
        // If some succeeded, return true
        if (error.code === 11000) return { success: true, message: 'Some slots already exist' };
        throw error;
    }
};

module.exports = { generateSlotsForDate };

export const getWeekOfYear = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export const parseWeekKey = (weekKey) => {
    const [year, week] = weekKey.split('-W');
    return { year: parseInt(year), week: parseInt(week) };
};

export const areConsecutiveWeeks = (week1, week2) => {
    if (week1.year === week2.year) {
        return week2.week === week1.week + 1;
    } else if (week2.year === week1.year + 1) {
        // Check if it's the last week of year and first week of next year
        const lastWeekOfYear = getWeekOfYear(new Date(week1.year, 11, 31));
        return week1.week === lastWeekOfYear && week2.week === 1;
    }
    return false;
};

export const getTop5Activities = async () => {
    return await Activity.find({ isApproved: true })
        .sort({ averageRating: -1, createdAt: -1 })
        .limit(5);
};

export const isMoreThanAWeekOld = (date) => {
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return new Date() - new Date(date) > oneWeek;
};

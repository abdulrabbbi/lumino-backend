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


export const getNextMondayAt6AM = (timezone = 'UTC') => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;

    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(6, 0, 0, 0); // Set to 6:00 AM

    return nextMonday;
};

// Helper function to get current Monday 6 AM of this week
export const getCurrentMondayAt6AM = (timezone = 'UTC') => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 6 days since Monday

    const currentMonday = new Date(now);
    currentMonday.setDate(now.getDate() - daysSinceMonday);
    currentMonday.setHours(6, 0, 0, 0); // Set to 6:00 AM

    return currentMonday;
};

// Helper function to check if it's past Monday 6 AM this week
export const isPastMondayRefresh = (lastRefreshDate, userTimezone = 'UTC') => {
    const currentMondayAt6AM = getCurrentMondayAt6AM(userTimezone);
    const now = new Date();

    // If today is past current Monday 6 AM and last refresh was before current Monday 6 AM
    return now >= currentMondayAt6AM && (!lastRefreshDate || new Date(lastRefreshDate) < currentMondayAt6AM);
};

// Helper function to get week number from Monday refresh date
export const getWeekNumberFromMondayRefresh = (startDate) => {
    const mondayRefreshEpoch = new Date('2024-01-01T06:00:00.000Z'); // Start counting from this Monday
    const weeksDifference = Math.floor((new Date(startDate) - mondayRefreshEpoch) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(1, weeksDifference + 1);
};

export const getUserTimezone = (req) => {
    // Check multiple sources for timezone
    const timezone = 
      req.headers['x-user-timezone'] ||           // Frontend sends this
      req.body.timezone ||                        // From request body
      req.query.timezone ||                       // From query params
      req.user?.timezone ||                       // From user profile
      'UTC';                                      // Default fallback
  
    return timezone;
  };
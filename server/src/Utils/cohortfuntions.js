// Group users into cohorts (weekly or monthly)
function groupIntoCohorts(users, cohortType) {
    const cohortMap = new Map();

    users.forEach(user => {
        const cohortKey = getCohortKey(user.createdAt, cohortType);

        if (!cohortMap.has(cohortKey)) {
            const { startDate, endDate, name } = getCohortDates(cohortKey, cohortType);
            cohortMap.set(cohortKey, {
                key: cohortKey,
                name,
                startDate,
                endDate,
                users: []
            });
        }

        cohortMap.get(cohortKey).users.push(user);
    });

    return Array.from(cohortMap.values()).sort((a, b) =>
        a.startDate - b.startDate
    );
}


//  Get cohort key for grouping (e.g., "2025-W01" or "2025-01")
function getCohortKey(date, cohortType) {
    const d = new Date(date);

    if (cohortType === 'monthly') {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }

    // Weekly cohort
    const weekNumber = getWeekNumber(d);
    return `${d.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}


// Get week number of the year
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}


// Get start and end dates for a cohort
function getCohortDates(cohortKey, cohortType) {
    if (cohortType === 'monthly') {
        const [year, month] = cohortKey.split('-');
        const startDate = new Date(year, parseInt(month) - 1, 1);
        const endDate = new Date(year, parseInt(month), 0, 23, 59, 59);

        return {
            startDate,
            endDate,
            name: startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        };
    }

    // Weekly cohort
    const [year, week] = cohortKey.split('-W');
    const startDate = getDateOfISOWeek(parseInt(week), parseInt(year));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59);

    return {
        startDate,
        endDate,
        name: `Week ${week}, ${year}`
    };
}


// Get date of ISO week
function getDateOfISOWeek(week, year) {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) {
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return ISOweekStart;
}


// Calculate summary statistics
function calculateRetentionSummary(retentionData) {
    if (retentionData.length === 0) return null;

    // Average retention across all cohorts
    const avgRetentionByPeriod = [];
    const maxPeriods = Math.max(...retentionData.map(c => c.retention.length));

    for (let i = 0; i < maxPeriods; i++) {
        const periodsAtIndex = retentionData
            .map(c => c.retention[i])
            .filter(p => p !== undefined);

        if (periodsAtIndex.length > 0) {
            const avgRate = periodsAtIndex.reduce((sum, p) => sum + p.retentionRate, 0) / periodsAtIndex.length;

            avgRetentionByPeriod.push({
                period: periodsAtIndex[0].period,
                averageRetentionRate: parseFloat(avgRate.toFixed(1))
            });
        }
    }

    return {
        totalCohorts: retentionData.length,
        totalUsers: retentionData.reduce((sum, c) => sum + c.totalUsers, 0),
        avgRetentionByPeriod
    };
}
export {
    groupIntoCohorts,
    getCohortKey,
    getCohortDates,
    calculateRetentionSummary
};
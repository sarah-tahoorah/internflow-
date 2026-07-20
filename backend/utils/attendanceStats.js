const PRESENT_STATUSES = ['present', 'late'];

const getAttendanceBreakdown = (records) => {
  const totalDays = records.length;
  const presentDays = records.filter((a) => PRESENT_STATUSES.includes(a.status)).length;
  const absentDays = records.filter((a) => a.status === 'absent').length;
  const lateDays = records.filter((a) => a.status === 'late').length;
  return { totalDays, presentDays, absentDays, lateDays };
};

const formatRate = (part, total, emptyValue = 0) =>
  total > 0 ? ((part / total) * 100).toFixed(2) : emptyValue;

module.exports = { getAttendanceBreakdown, formatRate, PRESENT_STATUSES };

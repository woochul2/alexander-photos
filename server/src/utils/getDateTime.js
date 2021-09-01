function getDateTime(date = new Date()) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, 0);
  const day = date.getDate().toString().padStart(2, 0);
  const dateString = `${year}:${month}:${day}`;
  const timeString = date.toLocaleTimeString('en', { hour12: false });
  return `${dateString} ${timeString}`;
}

module.exports = { getDateTime };

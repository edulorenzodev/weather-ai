const daysFull = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const daysShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export const getFullDayName = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return daysFull[date.getDay()];
};

export const getShortDay = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return daysShort[date.getDay()];
};

export const getDateString = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

import { db } from 'path/to/firebase'; // Import your Firebase Firestore instance

const storeData = (dayData) => {
  // Get the current date
  const currentDate = new Date();

  // Extract the year, month, week, and day information
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // Months are zero-based, so add 1
  const week = getWeekNumber(currentDate);
  const day = currentDate.getDate();

  // Get the reference to the specific day document
  const dayRef = db
    .collection('years')
    .doc(year.toString())
    .collection('months')
    .doc(month.toString())
    .collection('weeks')
    .doc(week.toString())
    .collection('days')
    .doc(day.toString());

  // Store the day data in Firestore
  dayRef.set(dayData)
    .then(() => {
      console.log('Data stored successfully!');
    })
    .catch((error) => {
      console.error('Error storing data:', error);
    });
};

// Helper function to get the week number of a given date
const getWeekNumber = (date) => {
  const onejan = new Date(date.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((date - onejan) / 86400000 + onejan.getDay() + 1) / 7);
  return weekNum;
};

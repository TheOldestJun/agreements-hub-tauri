import { differenceInDays } from 'date-fns';

import db from '../assets/db';

const checkExpiration = async (agreements) => {
  if (!agreements || agreements.length === 0) {
    return 0;
  }

  let currentExpiredCount = 0; // This will count all agreements that are now considered expired/due to expire
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date to start of day

  const updates = []; // Collect all updates to perform them efficiently

  for (const agreement of agreements) {
    if (!agreement.dateExp) {
      // If no expiration date, skip
      continue;
    }
    const expirationDate = new Date(agreement.dateExp);
    expirationDate.setHours(0, 0, 0, 0); // Normalize expiration date to start of day

    const daysDelta = differenceInDays(expirationDate, today);

    let newExpiredStatus = agreement.expired; // Assume current status
    if (daysDelta < 30) {
      // If less than 30 days or already expired, mark as true
      newExpiredStatus = true;
    } else if (daysDelta >= 30) {
      // If 30 days or more, mark as false
      newExpiredStatus = false;
    }

    // Only add to update queue if status has changed
    if (newExpiredStatus !== agreement.expired) {
      updates.push(db.agreements.update(agreement.id, { expired: newExpiredStatus }));
    }

    if (newExpiredStatus) {
      // Count all currently considered expired/due to expire
      currentExpiredCount += 1;
    }
  }

  // Wait for all database updates to complete
  await Promise.all(updates);

  return currentExpiredCount;
};

export default checkExpiration;

import MentorProfile from "../models/mentorProfiles.model.js";
import { convertCurrency } from "../integrations/exchange.client.js";


/**
 * Get a mentor's hourly rate converted into the target currency.
 * We treat stored rates as USD for simplicity.
 */


export async function getMentorRateInCurrency({ mentorId, targetCurrency }) {
  const mentor = await MentorProfile.findById(mentorId);
  if (!mentor) {
    return { data: null, reason: 'mentor_not_found' };
  }

  if (targetCurrency.toUpperCase() === 'USD') {
    return {
      data: {
        mentorId: mentor._id,
        from: 'USD',
        to: 'USD',
        hourlyRate: mentor.hourlyRate,
        rate: 1,
        source: 'local',
      },
      reason: null,
    };
  }

  try {
    const conversion = await convertCurrency({
      from: 'USD',
      to: targetCurrency.toUpperCase(),
      amount: mentor.hourlyRate,
    });

    return {
      data: {
        mentorId: mentor._id,
        from: conversion.from,
        to: conversion.to,
        hourlyRateUSD: mentor.hourlyRate,
        hourlyRateConverted: conversion.result,
        rate: conversion.rate,
        date: conversion.date,
        source: 'exchangerate.host',
      },
      reason: null,
    };
  } catch (err) {
    return { data: null, reason: 'exchange_api_failed', err };
  }
}


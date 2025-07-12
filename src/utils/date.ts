export const todayLocalISO = (): string => {
  // Using the Swedish locale gives an ISO-like local date (YYYY-MM-DD)
  // which avoids the UTC shift problem of toISOString().
  return new Date().toLocaleDateString('sv-SE');
}; 
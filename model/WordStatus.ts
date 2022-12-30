export enum WordStatus {
  New = "New",
  Known = "Known", // also covers never forget and redundant
  Due = "Due",
  Suspended = "Suspended",
  Locked = "Locked",
  Learning = "Learning",
  Failed = "Failed",
  Blacklisted = "Blacklisted",
  NotInDeck = "NotInDeck",
  Missing = "Missing",
}

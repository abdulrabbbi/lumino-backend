import TrackingEvents from "../Models/TrackingEvents.js";

export const logEvent = async ({
  userId = null,
  userType = "guest",
  eventName,
  eventData = {},
  device = "web",
}) => {
  try {
    await TrackingEvents.create({
      userId,
      userType,
      eventName,
      eventData,
      device,
    });
  } catch (err) {
    console.error("Event logging failed:", err.message);
  }
};

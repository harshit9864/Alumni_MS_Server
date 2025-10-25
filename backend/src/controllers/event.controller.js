import { Event } from "../models/event.model.js";
import { ApiError } from "../utils/apiError.js";
import { Apiresponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const fetchEvent = asyncHandler(async (req, res) => {
  const today = new Date();
  const events = await Event.find({ date: { $gte: today } });
  // if (!events) {
  //   throw new ApiError(200, "no Upcoming events found");
  // }
  console.log("sending res...");
  res
    .status(200)
    .json(new Apiresponse(201, events, "Events found successfully"));
});

export { fetchEvent };

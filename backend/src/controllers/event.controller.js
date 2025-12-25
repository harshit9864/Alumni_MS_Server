import { Admin } from "../models/admin.model.js";
import { Event } from "../models/event.model.js";
import { Apiresponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Student } from "../models/student.model.js";

const fetchEvent = asyncHandler(async (req, res) => {
  const { userId, sessionClaims } = req.auth();
  const role = sessionClaims.metadata.role;
  let entity;
  let college;
  if (role == "admin") {
    entity = await Admin.findOne({ clerkId: userId });
  } else {
    entity = await Student.findOne({ clerkId: userId });
  }
  college = entity.organisationName;
  const today = new Date();
  const events = await Event.find({
    date: { $gte: today },
    college,
  });
  // if (!events) {
  //   throw new ApiError(200, "no Upcoming events found");
  // }

  res
    .status(200)
    .json(new Apiresponse(201, events, "Events found successfully"));
});

export { fetchEvent };

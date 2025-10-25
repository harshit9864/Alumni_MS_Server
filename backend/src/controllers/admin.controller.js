import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { AlumniDir } from "../models/alumniDir.model.js";
import { Apiresponse } from "../utils/apiResponse.js";
import { Event } from "../models/event.model.js";

const addAlumni = asyncHandler(async (req, res) => {
  const { fullName, batchYear, email, currentProfession, company } = req.body;
  if (
    [fullName, batchYear, email, currentProfession, company].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedAlumni = await AlumniDir.findOne({ email });
  if (existedAlumni) {
    throw new ApiError(409, "User with username or email exists");
  }

  const newAlumni = await AlumniDir.create({
    fullName,
    batchYear,
    email,
    currentProfession,
    company,
  });

  res
    .status(200)
    .json(new Apiresponse(201, newAlumni, "Alumni created successfully"));
});

const postEvent = asyncHandler(async (req, res) => {
  const { title, date, content } = req.body;

  const existedEvent = await Event.findOne({ title });
  if (existedEvent) {
    throw new ApiError(409, "Event with same title already exist");
  }

  const event = await Event.create({
    title,
    date: new Date(date),
    content,
  });

  res.status(200).json(new Apiresponse(201, event, "Event posted Succesfully"));
});

export { addAlumni, postEvent };

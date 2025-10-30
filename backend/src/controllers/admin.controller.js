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

  let newAlumni = await AlumniDir.create({
    fullName,
    batchYear,
    email,
    currentProfession,
    company,
  });

  const count = await AlumniDir.countDocuments();
  newAlumni = { ...newAlumni.toObject(), totalAlumni: count };

  res
    .status(200)
    .json(new Apiresponse(201, newAlumni, `Alumni created successfully`));
});

const postEvent = asyncHandler(async (req, res) => {
  const { title, date, content,time } = req.body;

  const existedEvent = await Event.findOne({ title,date });
  if (existedEvent) {
    throw new ApiError(409, "Event with same title already exist");
  }

  const event = await Event.create({
    title,
    date: new Date(date),
    content,
    time
  });

  res.status(200).json(new Apiresponse(201, event, "Event posted Succesfully"));
});

const fetchDirec = asyncHandler(async (req, res) => {
  const alumnis = await AlumniDir.find();
  res
    .status(200)
    .json(new Apiresponse(201, alumnis, "Alumnis fetched succesfully"));
});

const totalAlumni = asyncHandler(async (req, res) => {
  const totalAlumni = await AlumniDir.countDocuments();
  const currentEvents = await Event.countDocuments({
    date: { $gte: new Date() },
  });

  res
    .status(200)
    .json(
      new Apiresponse(201, [totalAlumni, currentEvents], "fetched succesfully")
    );
});
export { addAlumni, postEvent, totalAlumni, fetchDirec };

import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { AlumniDir } from "../models/alumniDir.model.js";
import { Apiresponse } from "../utils/apiResponse.js";
import { Event } from "../models/event.model.js";
import { Admin } from "../models/admin.model.js";
import { Student } from "../models/student.model.js";

const addAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.auth();
  const { college, state, city } = req.body;
  const admin = await Admin.create({
    clerkId: userId,
    organisationName: college,
    state,
    city,
  });
  res.status(201).json(new Apiresponse(201, admin, "Admin added succesfully"));
});

const addAlumni = asyncHandler(async (req, res) => {
  const { fullName, batchYear, email, currentProfession, company } = req.body;
  const { userId } = req.auth();
  if (
    [fullName, batchYear, email, currentProfession, company].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedAlumni = await AlumniDir.findOne({ email });
  if (existedAlumni) {
    throw new ApiError(409, "Alumni already  exists");
  }

  const admin = await Admin.findOne({ clerkId: userId });
  const college = admin.organisationName;
  console.log(college);
  let newAlumni = await AlumniDir.create({
    fullName,
    batchYear,
    email,
    currentProfession,
    company,
    college,
  });

  const count = await AlumniDir.countDocuments({ college });
  newAlumni = { ...newAlumni.toObject(), totalAlumni: count };

  res
    .status(200)
    .json(new Apiresponse(201, newAlumni, `Alumni created successfully`));
});

const postEvent = asyncHandler(async (req, res) => {
  const { title, date, content, time } = req.body;
  const { userId } = req.auth();

  const existedEvent = await Event.findOne({ title, date });
  if (existedEvent) {
    throw new ApiError(409, "Event with same title already exist");
  }
  const admin = await Admin.findOne({ clerkId: userId });
  console.log(admin);
  const college = admin.organisationName;

  const event = await Event.create({
    title,
    date: new Date(date),
    content,
    time,
    college,
  });

  res.status(200).json(new Apiresponse(201, event, "Event posted Succesfully"));
});

const fetchDirec = asyncHandler(async (req, res) => {
  const { userId } = req.auth();
  const role = req.headers["role"];
  let entity;
  let college;
  if (role == "admin") {
    entity = await Admin.findOne({ clerkId: userId });
  } else {
    entity = await Student.findOne({ clerkId: userId });
  }
  college = entity.organisationName;
  const alumnis = await AlumniDir.find({ college });
  res
    .status(200)
    .json(new Apiresponse(201, alumnis, "Alumnis fetched succesfully"));
});

const totalAlumni = asyncHandler(async (req, res) => {
  const { userId, sessionClaims } = req.auth();
  console.log(sessionClaims);
  const admin = await Admin.findOne({ clerkId: userId });
  const college = admin.organisationName;
  const totalAlumni = await AlumniDir.countDocuments({ college });
  const currentEvents = await Event.countDocuments({
    date: { $gte: new Date() },
  });

  res
    .status(200)
    .json(
      new Apiresponse(201, [totalAlumni, currentEvents], "fetched succesfully")
    );
});
export { addAdmin, addAlumni, postEvent, totalAlumni, fetchDirec };

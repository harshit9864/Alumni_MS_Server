import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { AlumniDir } from "../models/alumniDir.model.js";
import { Apiresponse } from "../utils/apiResponse.js";
import { Event } from "../models/event.model.js";
import { Admin } from "../models/admin.model.js";
import { Student } from "../models/student.model.js";
import { createClient } from "redis";

const client = createClient({
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT) || 17268,
  },
});
client.on("error", (err) =>
  console.log(
    "Redis Client Error (Backend will run without cache):",
    err.message,
  ),
);
(async () => {
  try {
    await client.connect();
    console.log("Connected to Redis Cache Successfully!");
  } catch (error) {
    console.error("Redis Connection Failed:", error.message);
  }
})();

const addAdmin = asyncHandler(async (req, res) => {
  const { userId, sessionClaims } = req.auth();
  const { college, state, city } = req.body;
  const admin = await Admin.create({
    clerkId: userId,
    organisationName: college.toUpperCase(),
    state,
    city,
    email: sessionClaims.emailAddress,
  });
  res.status(201).json(new Apiresponse(201, admin, "Admin added succesfully"));
});

const addAlumni = asyncHandler(async (req, res) => {
  const { fullName, batchYear, email, currentProfession, company } = req.body;
  const { userId } = req.auth();
  if (
    [fullName, batchYear, email, currentProfession, company].some(
      (field) => field?.trim() === "",
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedAlumni = await AlumniDir.findOne({ email });
  if (existedAlumni) {
    throw new ApiError(409, "Alumni already  exists");
  }

  const admin = await Admin.findOne({ clerkId: userId });
  if (!admin) {
    throw new ApiError(
      404,
      "Admin not found. Please complete your registration.",
    );
  }
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

  // Invalidate cache after adding alumni
  if (client.isReady) {
    await client.del(`alumni_dir_${college}`);
  }

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
  if (!admin) {
    throw new ApiError(
      404,
      "Admin not found. Please complete your registration.",
    );
  }
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
  console.log(req.auth());
  const role = req.headers["role"];
  let entity;
  let college;
  if (role == "admin") {
    entity = await Admin.findOne({ clerkId: userId });
  } else {
    entity = await Student.findOne({ clerkId: userId });
  }

  if (!entity) {
    throw new ApiError(
      404,
      "User profile not found. Please complete your registration.",
    );
  }
  college = entity.organisationName;

  const cacheKey = `alumni_dir_${college}`;

  if (client.isReady) {
    try {
      const cachedData = await client.get(cacheKey);
      if (cachedData) {
        return res
          .status(200)
          .json(
            new Apiresponse(
              201,
              JSON.parse(cachedData),
              "Alumnis fetched successfully from cache",
            ),
          );
      }
    } catch (error) {
      console.error("Redis get error:", error);
    }
  }

  const alumnis = await AlumniDir.find({ college });

  if (client.isReady) {
    try {
      await client.setEx(cacheKey, 3600, JSON.stringify(alumnis));
    } catch (error) {
      console.error("Redis set error:", error);
    }
  }

  res
    .status(200)
    .json(new Apiresponse(201, alumnis, "Alumnis fetched succesfully"));
});

const totalAlumni = asyncHandler(async (req, res) => {
  const { userId } = req.auth();
  console.log(req.auth());
  const admin = await Admin.findOne({ clerkId: userId });
  if (!admin) {
    throw new ApiError(
      404,
      "Admin not found. Please complete your registration.",
    );
  }
  const college = admin.organisationName;
  const totalAlumni = await AlumniDir.countDocuments({ college });
  const currentEvents = await Event.countDocuments({
    date: { $gte: new Date() },
    college,
  });

  res
    .status(200)
    .json(
      new Apiresponse(201, [totalAlumni, currentEvents], "fetched succesfully"),
    );
});

const editAlumni = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fullName, batchYear, currentProfession, company, email } = req.body;
  const alumni = await AlumniDir.findByIdAndUpdate(
    id,
    { fullName, batchYear, currentProfession, company, email },
    { new: true },
  );

  // Invalidate cache after editing alumni
  if (alumni && client.isReady) {
    await client.del(`alumni_dir_${alumni.college}`);
  }

  res
    .status(201)
    .json(new Apiresponse(201, alumni, "successfully edited alumni data"));
});

const deleteAlumni = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const alumni = await AlumniDir.findByIdAndDelete(id);

  // Invalidate cache after deleting alumni
  if (alumni && client.isReady) {
    await client.del(`alumni_dir_${alumni.college}`);
  }

  res
    .status(200)
    .json(new Apiresponse(200, null, "succesfully deleted alumni"));
});

const editEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, date, content, time } = req.body;
  const event = await Event.findByIdAndUpdate(
    id,
    { title, date, content, time },
    { new: true },
  );
  res.status(200).json(new Apiresponse(201, event, "edited"));
});

const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Event.findByIdAndDelete(id);
  res.status(201).json(200, null, "succesfully deleted alumni");
});

export {
  addAdmin,
  addAlumni,
  postEvent,
  totalAlumni,
  fetchDirec,
  editAlumni,
  deleteAlumni,
  editEvent,
  deleteEvent,
};

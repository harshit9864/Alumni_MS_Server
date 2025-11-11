import { Alumni } from "../models/alumni.model.js";
import { Mentorship } from "../models/mentorship.model.js";
import { Student } from "../models/student.model.js";
import { ApiError } from "../utils/apiError.js";
import { Apiresponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const addstudent = asyncHandler(async (req, res) => {
  const { userId } = req.auth();
  if (!userId) {
    throw new ApiError(401, "user not authenticated");
  }
  const { fullName, passoutYear, email, interests } = req.body;

  const student = await Student.create({
    fullName,
    clerkId: userId,
    passoutYear,
    interests,
    email,
  });

  res
    .status(200)
    .json(new Apiresponse(201, student, "student added succesfully"));
});

const addMentorship = asyncHandler(async (req, res) => {
  const { userId } = req.auth();
  if (!userId) {
    throw new ApiError(401, "user not authenticated");
  }
  const { email, purpose } = req.body;
  const alumni = await Alumni.findOne({ email });
  const student = await Student.findOne({ clerkId: userId });
  const find = await Mentorship.findOne({
    studentName: student._id,
    alumniName: alumni._id,
  });
  console.log(find);
  if (find) {
    throw new ApiError(401, "connection with this alumni already exist");
  }
  const doc = await Mentorship.create({
    studentName: student._id,
    alumniName: alumni._id,
    date: new Date(),
    purpose,
  });
  console.log(doc.date);

  res
    .status(200)
    .json(new Apiresponse(201, doc, "mentorship request sent succesfully"));
});

export { addstudent, addMentorship };

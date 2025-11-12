import mongoose from "mongoose";
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
    alumniMail: alumni.email,
  });
  console.log(find);
  if (find) {
    throw new ApiError(401, "connection with this alumni already exist");
  }
  const doc = await Mentorship.create({
    studentName: student._id,
    alumniMail: alumni.email,
    date: new Date(),
    purpose,
  });

  res
    .status(200)
    .json(new Apiresponse(201, doc, "mentorship request sent succesfully"));
});

const fetchMentorships = asyncHandler(async (req, res) => {
  const { userId } = req.auth();
  if (!userId) {
    throw new ApiError(401, "not authenticated");
  }
  const student = await Student.findOne({
    clerkId: userId,
  });
  const studentId = student._id;
  console.log(studentId);

  // Ensure it's a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw new ApiError(401, "Not valid student id");
  }

  // Aggregation pipeline
  const mentorships = await Mentorship.aggregate([
    {
      $match: { studentName: new mongoose.Types.ObjectId(studentId) },
    },
    {
      $lookup: {
        from: "alumnidirs", // collection name (check in DB)
        localField: "alumniMail", // field in Mentorship
        foreignField: "email", // field in Alumni
        as: "alumniInfo",
      },
    },
    {
      $unwind: {
        path: "$alumniInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "students", // collection name for students
        localField: "studentName",
        foreignField: "_id",
        as: "studentInfo",
      },
    },
    {
      $unwind: "$studentInfo",
    },
    {
      $project: {
        purpose: 1,
        date: 1,
        status: 1,
        "studentInfo.name": 1,
        "studentInfo.email": 1,
        "alumniInfo.fullName": 1,
        "alumniInfo.email": 1,
      },
    },
  ]);

  res
    .status(200)
    .json(
      new Apiresponse(201, mentorships, "Mentorships fetched successfully")
    );
});

export { addstudent, addMentorship, fetchMentorships };

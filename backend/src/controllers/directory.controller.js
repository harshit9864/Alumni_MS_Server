import { AlumniDir } from "../models/alumniDir.model.js";
import { Apiresponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const fetchDirec = asyncHandler(async (req, res) => {
  const alumnis = await AlumniDir.find();
  res
    .status(200)
    .json(new Apiresponse(201, alumnis, "Alumnis fetched succesfully"));
});

export { fetchDirec };

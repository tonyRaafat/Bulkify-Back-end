import multer from "multer";
import { throwError } from "../utils/throwerror.js";

export const validExtension = {
  image: ["image/png", "image/jpeg", "image/jpg"], // Added JPEG support
};

export const multerHost = (customeValidation, cutsomPath = "uploads") => {
  const storage = multer.diskStorage({});

  const fileFilter = (req, file, cb) => {
    if (customeValidation.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(throwError("Only .png, .jpg and .jpeg formats are allowed", 400), false);
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  });
  return upload;
};

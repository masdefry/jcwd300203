import { NextFunction, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure the directory exists
const proofOfPaymentDirectory = path.join(__dirname, "../../src/public/images/proof-of-payment");
if (!fs.existsSync(proofOfPaymentDirectory)) {
  fs.mkdirSync(proofOfPaymentDirectory, { recursive: true });
}

// Multer configuration for proof of payment
const uploadMulter = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, proofOfPaymentDirectory); // Save files to the specified directory
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname)); // Generate a unique filename
    },
  }),
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ["jpg", "jpeg", "png"];
    const fileExtension = file.mimetype.split("/").pop()?.toLowerCase();
    if (allowedExtensions.includes(fileExtension || "")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG and PNG are allowed."));
    }
  },
});

// middleware for proof of payment uploader
export const proofOfPaymentUploader = (req: Request, res: Response, next: NextFunction) => {
    const uploaded = uploadMulter.single("file"); // Handle a single file upload
  
    uploaded(req, res, function (err) {
      try {
        if (err) {
          console.error(err);
          throw { msg: err.message };
        }
  
        // Validate if the file exists
        if (!req.file) {
          throw { msg: "File not found" };
        }
        
        // console.log("Uploaded file details:", req.file); // Log file details
        // console.log("File path:", req.file.path); // Log file path

        // Attach the file path to the request body
        req.body.filePath = req.file.path;
  
        // Proceed to the next middleware or controller
        next();
      } catch (err) {
        console.error(err);
        next(err);
      }
    });
};  
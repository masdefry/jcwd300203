import { NextFunction, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure the directory exists
const proofOfPaymentDirectory = path.join(__dirname, "../../src/public/images/proof-of-payment");
if (!fs.existsSync(proofOfPaymentDirectory)) {
  fs.mkdirSync(proofOfPaymentDirectory, { recursive: true });
}

// Configure Multer
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

export const proofOfPaymentUploader = uploadMulter.single("file");
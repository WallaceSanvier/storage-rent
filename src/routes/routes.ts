import express from "express";
import { StorageRentController } from "../controllers/StorageRentController";

const router = express.Router();

router.post("/storage-rent", StorageRentController.getMonthlyRent);

export default router;

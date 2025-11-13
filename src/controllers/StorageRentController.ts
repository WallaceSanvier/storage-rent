import { Request, Response } from "express";
import { calculateMonthlyRent } from "../services/StorageRent";

export class StorageRentController {

  public static getMonthlyRent(req: Request, res: Response) {
    try {
      const {
        baseMonthlyRent,
        leaseStartDate,
        windowStartDate,
        windowEndDate,
        dayOfMonthRentDue,
        rentRateChangeFrequency,
        rentChangeRate,
      } = req.body;

      const leaseStart = new Date(leaseStartDate);
      const windowStart = new Date(windowStartDate);
      const windowEnd = new Date(windowEndDate);

      const result = calculateMonthlyRent(
        Number(baseMonthlyRent),
        leaseStart,
        windowStart,
        windowEnd,
        Number(dayOfMonthRentDue),
        Number(rentRateChangeFrequency),
        Number(rentChangeRate)
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

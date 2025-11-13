import { AppError } from "../../AppError";

export type MonthlyRentRecord = {
  vacancy: boolean;
  rentAmount: number; 
  rentDueDate: Date; 
};

export type MonthlyRentRecords = Array<MonthlyRentRecord>;

/**
 * Determines the vacancy, rent amount and due date for each month in a given time window
 * Determina a desocupação, o valor do aluguel e a data de vencimento para cada mês dentro de um período específico.
 *
 *
 * @param baseMonthlyRent : The base or starting monthly rent for unit (Number)
 * @param leaseStartDate : The date that the tenant's lease starts (Date) 
 * @param windowStartDate : The first date of the given time window (Date)
 * @param windowEndDate : The last date of the given time window (Date)
 * @param dayOfMonthRentDue : The day of each month on which rent is due (Number)
 * @param rentRateChangeFrequency : The frequency in months the rent is changed (Number)
 * @param rentChangeRate : The rate to increase or decrease rent, input as decimal (not %), positive for increase, negative for decrease (Number)
 * @returns Array<MonthlyRentRecord>;
 */

// const baseMonthlyRent = 100.00;
// const leaseStartDate = new Date("2023-02-01T00:00:00");
// const windowStartDate = new Date("2023-01-01T00:00:00");
// const windowEndDate = new Date("2023-03-31T00:00:00");
// const dayOfMonthRentDue = 1;
// const rentRateChangeFrequency = 1;
// const rentChangeRate = .1;

export function calculateMonthlyRent(
  baseMonthlyRent: number,
  leaseStartDate: Date,
  windowStartDate: Date,
  windowEndDate: Date,
  dayOfMonthRentDue: number,
  rentRateChangeFrequency: number,
  rentChangeRate: number
): MonthlyRentRecord[] {
const monthlyRentRecords: MonthlyRentRecord[] = [];

  validateDates(leaseStartDate,windowStartDate,windowEndDate)

  windowStartDate = new Date(windowStartDate);
  windowEndDate = new Date(windowEndDate);
  leaseStartDate = new Date(leaseStartDate);

  let currentDate = new Date(windowStartDate);
  let updatedMonthlyRent: number = baseMonthlyRent;
  let monthsPassed: number = 0;
  let isFirstMonth: boolean = false;
   //1
   while (currentDate <= windowEndDate) {
   isFirstMonth = false;
  //2
  if (currentDate.getFullYear() === leaseStartDate.getFullYear() &&
      currentDate.getMonth() === leaseStartDate.getMonth()) {
      monthsPassed = 0;
      isFirstMonth = true;
  }

  
  if (currentDate >= leaseStartDate && monthsPassed === rentRateChangeFrequency && rentChangeRate > 0) {
    updatedMonthlyRent = Number(
      calculateNewMonthlyRent(updatedMonthlyRent, rentChangeRate).toFixed(2)
    );
    monthsPassed = 0;
  }

  if (currentDate < leaseStartDate && monthsPassed === rentRateChangeFrequency && rentChangeRate < 0) {
    updatedMonthlyRent = Number(
      calculateNewMonthlyRent(updatedMonthlyRent, rentChangeRate).toFixed(2)
    );
    monthsPassed = 0;
  }

    let mountRent = updatedMonthlyRent;
    //3
    if (isFirstMonth) {

      const startDay = leaseStartDate.getDate();
      const dueDay = dayOfMonthRentDue;

      
      if (startDay < dueDay) {

        const daysProportion = (dueDay - startDay) / 30;
        mountRent = Number((baseMonthlyRent * daysProportion).toFixed(2));
      } else if (startDay > dueDay) {

        const daysProportion = ((30 - startDay + dueDay + 30) % 30) / 30 || 1 / 30;
        mountRent = Number((baseMonthlyRent * daysProportion).toFixed(2));
      }

      updatedMonthlyRent = baseMonthlyRent;
    }

   const record: MonthlyRentRecord = {
   vacancy: !isFirstMonth && currentDate < leaseStartDate,
   rentAmount: mountRent,
   rentDueDate: calculateDueDate(
   currentDate.getFullYear(),
   currentDate.getMonth(),
   dayOfMonthRentDue
  ),
  };

    monthlyRentRecords.push(record);

    currentDate.setDate(1);
    currentDate.setMonth(currentDate.getMonth() + 1);
    monthsPassed += 1;

  }

  return monthlyRentRecords;

}

/**
 * Calculates the new monthly rent
 *
 * @param baseMonthlyRent : the base amount of rent
 * @param rentChangeRate : the rate that rent my increase or decrease (positive for increase, negative for decrease)
 * @returns number
 *
 */
function calculateNewMonthlyRent(
  baseMonthlyRent: number,
  rentChangeRate: number
): number {
  return baseMonthlyRent * (1 + rentChangeRate);
}

/**
 * Determines if the year is a leap year
 *
 * @param year
 * @returns boolean
 *
 */
function isLeapYear(year: number): boolean {
  return year % 4 == 0 && year % 100 != 0;
}

function calculateDueDate(year: number, month: number, day: number): Date {

  let lastDayOfMonth = 31;
   
  if (month === 3 || month === 5 || month === 8 || month === 10) {
    lastDayOfMonth = 30;
  } else if (month === 1) {

    lastDayOfMonth = isLeapYear(year) ? 29 : 28;

  }

  if (day > lastDayOfMonth) {
    day = lastDayOfMonth;
  }
  
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
}

function validateDates(
  leaseStartDate: Date,
  windowStartDate: Date,
  windowEndDate: Date
): void {

  if (
    isNaN(windowStartDate.getTime())
     ) {
    throw new AppError("windowStartDate is invalid.", 400);
  }

  if (
    isNaN(windowEndDate.getTime())
     ) {
    throw new AppError("windowEndDate is invalid.", 400);
  }

  if (
    isNaN(leaseStartDate.getTime())
     ) {
    throw new AppError("windowEndDate is invalid.", 400);
  }

  if (windowStartDate > windowEndDate) {
    throw new AppError(
      "windowStartDate cannot be later than windowEndDate.",
      400
    );
  }

  if (leaseStartDate > windowEndDate) {
    throw new AppError(
      "leaseStartDate cannot be later than windowEndDate.",
      400
    );
  }

  if (leaseStartDate < windowStartDate) {
    throw new AppError(
      "leaseStartDate cannot be earlier than windowStartDate.",
      400
    );
  }
}


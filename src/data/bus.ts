import { CURRENT_BUS, CURRENT_DRIVER, MAIN_ROUTE } from "./mock";

export const BUS_INFO = {
  busNumber: CURRENT_BUS.number,
  driverName: CURRENT_DRIVER.name,
  routeName: MAIN_ROUTE.name,
  capacity: CURRENT_BUS.capacity,
};

export { CURRENT_BUS, CURRENT_DRIVER };

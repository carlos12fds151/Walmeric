import { Request, Response, NextFunction } from "express";
import { connectRedis, get, set } from "../redis/index";
import moment from "moment";

export const RateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const RATE_LIMITER_IN_MINUTES = process.env.RATE_LIMITER_IN_MINUTES || 1;
  const WINDOW_LOG_INTERVAL_IN_HOURS = 1;
  const RATE_LIMITER_MAX_REQUEST = () => {
    let response;
    if(req.url === '/api/private'){
        response = process.env.RATE_LIMITER_MAX_REQUEST_PRIVATE || 10 
    }else if (req.url === '/api/public'){
        response = process.env.RATE_LIMITER_MAX_REQUEST_PUBLIC || 5
    }
      return response || 0;
    };

  await connectRedis;
  try {
    const record = (await get(req.ip)) as string;
    const currentRequestTime = moment();

    if (record == null) {
      let newRecord = [];
      let requestLog = {
        requestTimeStamp: currentRequestTime.format('h:mma'),
        requestCount: 1,
      };
      newRecord.push(requestLog);
      await set(req.ip, JSON.stringify(newRecord));
      next();
    }

    let data = JSON.parse(record);
    let windowStartTimestamp = moment().subtract(RATE_LIMITER_IN_MINUTES, "minutes").format('h:mma');
    let requestsWithinWindow = data.filter((entry: { requestTimeStamp: string, requestCount: number }) => {
      return entry.requestTimeStamp >= windowStartTimestamp;
    });

    let totalWindowRequestsCount = requestsWithinWindow.reduce(
      (accumulator: any, entry: any) => {
        return accumulator + entry.requestCount;
      },0
    );

    if (totalWindowRequestsCount >= RATE_LIMITER_MAX_REQUEST()) {
      res.status(429).send(`You have exceeded the ${RATE_LIMITER_MAX_REQUEST()} requests in ${RATE_LIMITER_IN_MINUTES} minutes limit!`);
    } else {

      let lastRequestLog = data[data.length - 1];
      let potentialCurrentWindowIntervalStartTimeStamp = currentRequestTime.subtract(WINDOW_LOG_INTERVAL_IN_HOURS, "minutes").format('h:mma');

      if (lastRequestLog.requestTimeStamp > potentialCurrentWindowIntervalStartTimeStamp) {
        lastRequestLog.requestCount++;
        data[data.length - 1] = lastRequestLog;
      } else {
        data.push({
          requestTimeStamp: currentRequestTime.format('h:mma'),
          requestCount: 1,
        });
      }
      await set(req.ip, JSON.stringify(data));
      next();
    }
  } catch (error) {
    console.log(error);
  }
};

import express, {
  json,
  urlencoded,
  Express,
  Request,
  Response,
  NextFunction,
} from 'express';
import cors from 'cors';
import { PORT } from './config';
import cookieParser from 'cookie-parser';
import router from './routers';
import { startScheduler } from './utils/scheduler';
import { scheduleBookingCleanup, startOrderReminderCronJob } from './services/transaction.service';
import path from "path";

export default class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
  }

  private configure(): void {
    this.app.use(
      cors({
        origin: process.env.CLIENT_URL || 'http://localhost:3000', 
        credentials: true, 
      })
    );  
    this.app.use(json());
    this.app.use(cookieParser());
    this.app.use(urlencoded({ extended: true }));
  }

  private handleError(): void {
    // Not found handler
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path.includes('/api/')) {
        res.status(404).json({ error: 'Not found!' });
      } else {
        next();
      }
    });

    interface ErrorHandler extends Error{
      msg: string;
      status: number;
    }
  
    // General error handler
    this.app.use(
      (err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
        if (req.path.includes('/api/')) {
          console.error('Error:', err);
  
          // Send a JSON response with error details for API requests
          res.status(err.status || 500).json({
            error: 'An internal server error occurred.',
            message: err.msg || 'Something went wrong',
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
          });
        } else {
          next(err); 
        }
      }
    );
  }

  private routes(): void {
    this.app.use(router);
  }

  public start(): void {
    // schedule booking cleanup
    scheduleBookingCleanup()

    // Start the order reminder cron job
    startOrderReminderCronJob();

    // Expose the "public" directory
    const publicDirectory = path.join(__dirname, "public/images/proof-of-payment");
    console.log(publicDirectory)

    this.app.use("/images", express.static(publicDirectory));

    this.app.listen(PORT, () => {
      console.log(`  ➜ [ ϟϟ API ϟϟ ] Local: http://localhost:${PORT}/`);
      startScheduler();
    });
  }
}
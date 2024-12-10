import express, {
  json,
  urlencoded,
  Express,
  Request,
  Response,
  NextFunction,
} from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import { PORT } from './config';
import router from './routers/index';
import { startScheduler } from './utils/scheduler';

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
        origin: process.env.CLIENT_URL || 'http://localhost:3000', // Replace with your frontend URL
        credentials: true, // Allow cookies
      })
    );  
    this.app.use(json());
    this.app.use(cookieParser());
    this.app.use(urlencoded({ extended: true }));
  }

  private routes(): void {
    // Register main router
    this.app.use(router);
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
  
    // General error handler
    this.app.use(
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        if (req.path.includes('/api/')) {
          console.error('Error:', err);
  
          // Send a JSON response with error details for API requests
          res.status(500).json({
            error: 'An internal server error occurred.',
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
          });
        } else {
          next(err); // Pass to other non-API error handlers if necessary
        }
      }
    );
  }

  public start(): void {
    this.app.listen(PORT, () => {
      console.log(`  ➜  [API] Local:   http://localhost:${PORT}/`);
      startScheduler()
    });
  }
}

// // Start the app
// const server = new App();
// server.start();
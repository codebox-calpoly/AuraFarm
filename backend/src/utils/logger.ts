import winston from 'winston';

const levels = {
     error: 0,
     warn: 1,
     info: 2,
     http: 3,
     debug: 4,
};

const level = () => {
     const env = process.env.NODE_ENV || 'development';
     const isDevelopment = env === 'development';
     return isDevelopment ? 'debug' : 'info';
};

const colors = {
     error: 'red',
     warn: 'yellow',
     info: 'green',
     http: 'magenta',
     debug: 'white',
};

winston.addColors(colors);

// Development format: Pretty-print (colorized) output
const devFormat = winston.format.combine(
     winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
     winston.format.colorize({ all: true }),
     winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
     )
);

// Production format: JSON format with timestamp, level, and service name
const prodFormat = winston.format.combine(
     winston.format.timestamp(),
     winston.format.json()
);

const logger = winston.createLogger({
     level: level(),
     levels,
     format: process.env.NODE_ENV === 'development' ? devFormat : prodFormat,
     defaultMeta: { service: 'aura-farm-backend' },
     transports: [
          new winston.transports.Console(),
     ],
});

export default logger;

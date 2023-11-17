import winston, { transports } from "winston";
import config from "./config.js";

//Custom Options:
const customLevelsOptions = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        http: 3,
        info: 4,
        debug: 5
    },
    colors: {
        fatal: 'red',
        error: 'orange',
        warning: 'yellow',
        info: 'blue',
        debug: 'white'
    }
};

//Custom Logger:
const devLogger = winston.createLogger({
    //Levels:
    levels: customLevelsOptions.levels,
    transports: [
        new winston.transports.Console(
            {
                level: "info",
                format: winston.format.combine(
                    winston.format.colorize({ colors: customLevelsOptions.colors }),
                    winston.format.simple()
                )
            }
        ),
        new winston.transports.File(
            {
                filename: './errors.log',
                level: 'warning', 
                format: winston.format.simple()
            }
        )
    ]
});

//Creando nuestro logger:
const prodLogger = winston.createLogger({
    levels: customLevelsOptions.levels,
    //Transports:
    transports: [
        new winston.transports.Console({ level: "http" }),
        new winston.transports.File({ filename: './errors.log', level: 'warning' })
    ]
});

//Declarando middleware:
export const addLogger = (req, res, next) => {
    if (config.environment === 'production') {
        req.logger = prodLogger;
        req.logger.warning("Prueba de log level warn!");
        req.logger.http(`${req.method} en ${req.url} - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
    } else {
        req.logger = devLogger;
        req.logger.warning("Prueba de log level warning!");
        req.logger.info(`${req.method} en ${req.url} - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
    }
    next();
};
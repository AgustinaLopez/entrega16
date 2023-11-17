import winston from 'winston';

//Configuracion
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({level:"debug"})
    ]
})


//Declaramos el Middleware
export const addLogger = (req, res, next) =>{
    req.logger = logger;

    req.logger.http(`${req.method} en ${req.url} - at ${new Date().toLocaleDateString()} - ${ new Date().toLocaleTimeString} `)
    next();
    
    req.logger.http(`${req.method} en ${req.url} - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
    next();
}
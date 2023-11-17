import express from "express";
import http from "http";
import productsRoutes from "../src/routes/products.routes.js";
import cartsRoutes from "../src/routes/carts.routes.js";
import viewsRoutes from "../src/routes/views.routes.js";
import sessionsRouter from "../src/routes/sessions.routes.js";
import handlebars from "express-handlebars";
import chatRouter from "../src/routes/messages.routes.js";
import __dirname from "./utils.js";
import {Server} from "socket.io";
import mongoose from "mongoose";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import config from "../src/config/config.js";
import initializePassport from "./config/passport.config.js";
import { passportCall, authorization } from "./middleware/auth.js";
import { createMessage } from "./controllers/chat.controller.js";
import mockingProducts from "../src/routes/mockingProducts.routes.js";
import compression from 'express-compression';
import compressionRouter from './routers/compression.router.js'
import { addLogger } from "./config/logger.js";
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from "swagger-ui-express";


import { FileStore } from "session-file-store";
import MongoStore from "connect-mongo";
import githubLoginViewRouter from "../src/routes/github-login.viewa.routes.js";


const { PORT, SESSION_SECRET, COOKIE_SECRET, MONGO_URI, DB_NAME } = config;
const app = express();
const server = http.createServer(app);
const io = new Server(server);
// const PORT = 8080; 



//Configuracion Handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

//Configuracion de Acceso a la carpeta public
app.use(express.static(__dirname+'/public'));


//Configuracion del servidor para recibir JSON
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser(COOKIE_SECRET));

//Middlewares Passport
initializePassport();
app.use(passport.initialize());
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.session());


//Configuracion Swagger
const swaggerOption = {
  definition:{
    openapi: "3.0.1",
    info: {
      title: "Documentacion API ecommerce",
      description: "Documentacion para nuestra web ecommerce"
    }

  },
  apis: [`./src/docs/**/*.yaml`]
}

const spec = swaggerJSDoc(swaggerOption);
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(spec));

//Logger Base
app.use(addLogger);

//Middleware logger base
app.get("/logger", (req, res) => {
  // req.logger.warn("Prueba de log level warn --> en Endpoint"); // **BASE
  // req.logger.warning("Prueba de log level warning --> en Endpoint"); // **CUSTOM
  res.send("Prueba de logger!");
});



// Brotli
app.use(compression({
  brotli: { enabled: true, zlib: {} }
}));


//Rutas de Sessions y Usuarios
app.use('/api/products', productsRoutes);
app.use('/api/carts', passportCall("current"),authorization("user"), cartsRoutes);
app.use("/api/sessions", sessionsRouter);
app.use('/api/users', usersViewRouter);
app.use("/chat", passportCall("current"), authorization("user"), chatRouter);
app.use("/", viewsRouter);
app.get("/mockingproducts", mockingProducts);
app.use("/compression", compressionRouter);




//Conectando Sessions con Mongo
mongoose.set("strictQuery", false);
mongoose.connect(MONGO_URI, { dbName: DB_NAME }, (error) => {
  if (error) {
    console.log("No se pudo conectar al DB");
    return;
  }

  console.log("DB conectado");
  server.listen(PORT, () => console.log(`Escuchando en el puerto ${PORT}`));
  server.on("error", (e) => console.log(e));
});

// Websockets chat
io.on("connection", createMessage(io));




//Conectando Sessions con FileStorage
// const FileStorage = FileStore(session);

// app.use(session({
//     store: new FileStorage({path:'./sessions', ttl:100, retries:0}),
//     resave:false,
//     saveUninitialized: false
// }))


// //Instanciamos Socket del lado del Server
// const socketServer = new Server(httpServer);
// socketServer.on('connection', socket =>{
//     socket.on('mensaje1', data =>{
//         console.log(data);
//     })

//     socket.broadcast.emit('mensaje2', "Producto Eliminado")

// })





//-----------------Declaramos la conexion con la DB
// const DB = 'mongodb+srv://disagustinalopez:RtPszX4bFwr4t0VB@cluster0.mfqjqym.mongodb.net/ecommerce?retryWrites=true&w=majority'
// const connectMongoDB = async()=>{
//     try {
//         await mongoose.connect(DB);
//         console.log("Conectado con exito a MongoDB usando Mongoose");
//     } catch(error) {
//         console.error("No se pudo conectar a la BD usando Mongoose: " + error);
//         process.exit();
//     }
// }
// connectMongoDB();
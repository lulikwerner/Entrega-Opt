import express from "express";
import handlebars from "express-handlebars";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { __dirname } from "./utils.js";
import cookieParser from 'cookie-parser';


import productRouter from "./routes/productsM.router.js";
import cartRouter from "./routes/cartsM.router.js";
import viewsRouter from "./routes/views.router.js";
import sessionRouter from "./routes/session.router.js"


import registerChatHandler from "./listeners/chatHandler.js";
import cartSocket from "./sockets/cart.sockets.js";
import productSocket from "./sockets/product.sockets.js";
import initlizePassport from "./config/passport.config.js";

const app = express();
const PORT = process.env.PORT || 8080;

const startServer = async () => {
  //Conecta a mi mongoose db
 try {
    await mongoose.connect(
      "mongodb+srv://lulikwerner:123@clustercitofeliz.ro8b1xi.mongodb.net/ecommerce?retryWrites=true&w=majority"
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }

 

  //Conecto a mi puerto
  const server = app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
  });
  const io = new Server(server);

  app.engine("handlebars", handlebars.engine());
  app.set("views", `${__dirname}/views`);
  app.set("view engine", "handlebars");

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(`${__dirname}/public`));
  //Para firmar la cookie tengo que pasarle una clave
  app.use(cookieParser("asdasdzxcasd"));


  const ioMiddleware = (req, res, next) => {
    req.io = io;
    next();
  };
  app.use(ioMiddleware);  


  initlizePassport();

  //Son las rutas que uso
  app.use("/api/products", productRouter);
  app.use("/", viewsRouter);
  app.use("/api/carts", cartRouter);
  app.use("/api/sessions", sessionRouter)
  //El chat 
  io.on("connection", async (socket) => {
    registerChatHandler(io, socket);
    console.log("Socket connected");
  });

  //Llama al ProductSocket y al cartSocket
  productSocket(io);
  cartSocket(io);
};

startServer();

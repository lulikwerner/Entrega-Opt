import express from 'express';
import handlebars from 'express-handlebars';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { __dirname } from './utils.js';
import ProductManager from './dao/mongo/managers/productManager.js';
import productRouter from './routes/productsM.router.js';
import cartRouter from './routes/cartsM.router.js';
import viewsRouter from './routes/views.router.js';

const app = express();
const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await mongoose.connect("mongodb+srv://lulikwerner:123@clustercitofeliz.ro8b1xi.mongodb.net/ecommerce?retryWrites=true&w=majority");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }

  const server = app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
  });

  const io = new Server(server);
  const productManager = new ProductManager();

  app.engine('handlebars', handlebars.engine());
  app.set('views', `${__dirname}/views`);
  app.set('view engine', 'handlebars');

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(`${__dirname}/public`));

  const ioMiddleware = (req, res, next) => {
    req.io = io;
    next();
  };

  app.use(ioMiddleware);

  app.use('/', productRouter);
  app.use('/api/realtimeProducts', viewsRouter);

  io.on('connection', async socket => {
    console.log('Socket connected');
    const data = await productManager.getProducts();
    socket.emit('products', data);

    socket.on('newProduct', async data => {
      console.log('Received new product:', data);
      const { title, description, code, price, status, stock, category, thumbnails } = data;
      const product = await productManager.createProduct({
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails: data.thumbnail ? JSON.stringify(data.thumbnails) : 'No image',
      });

      console.log('Added new product:', product);
      socket.emit('products', product);
    });

    socket.on('deleteProduct', async data => {
      await productManager.deleteProduct(data);
      const product = await productManager.getProducts();
      socket.emit('deleteProduct', product);
    });
  });

  app.use('/api/carts', cartRouter);
};

startServer();

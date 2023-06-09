import { Router } from "express";
import {privacy} from "../middlewares/auth.js"
import productManager from "../dao/mongo/managers/productManager.js"
import cartManager from "../dao/mongo/managers/cartManager.js"
import productModel from "../dao/mongo/models/products.js";
import categoriesAndStatus from "../dao/mongo/managers/productManager.js"

const router = Router();
const product = new  productManager ();
const cart = new cartManager();

//Formulario para cargar productos nuevos y muestra los productos y los puedo eliminar 
router.get('/realTimeProducts', async (req, res) => {
  const products = await product.getProducts();
  res.render('realTimeProducts', { producth: products });
});

//Muestra los productos, filtro y orden
router.get('/products', async (req, res) => {
  const { limit, page = 1, sort, category } = req.query;

  try {
    if (limit) {
      const products = await product.getProducts();

      if (limit < 0 || isNaN(limit)) {
        return res.status(400).send({ status: 'error', message: 'Please enter a valid value for limit.' });
      }
      const limitedProducts = products.slice(0, limit);
      return res.render('home', { producth: limitedProducts, user: req.session.user  });
    }

    if (page) {
      const query = category ? { category } : {}; 
      const sortQuery = sort === 'desc' ? { price: -1 } : { price: 1 };
      const { docs, hasPrevPage, hasNextPage, prevPage, nextPage, ...rest } = await productModel.paginate(query, { page, limit: 10, sort: sortQuery, lean: true });
      const producth = docs;
      const response = {
        status: 'success',
        payload: docs,
        totalPages: rest.totalPages,
        prevPage: prevPage,
        nextPage: nextPage,
        page: rest.page,
        hasPrevPage: hasPrevPage,
        hasNextPage: hasNextPage,
        prevLink: hasPrevPage ? `/?limit=${limit}&page=${prevPage}&sort=${sort}&category=${category}` : null,
        nextLink: hasNextPage ? `/?limit=${limit}&page=${nextPage}&sort=${sort}&category=${category}` : null
      };
     console.log(response)
      return res.render('home', { producth, hasPrevPage, hasNextPage, prevPage, nextPage, ...rest, user: req.session.user  });
    }

    const products = await product.getProducts();
    const { categories, statuses } = await categoriesAndStatus(); 
    console.log('entro en categoria')// Retrieve categories and statuses
    console.log('el usuario',req.session.user)
    return res.render('home', { producth: products, categories, statuses, user: req.session.user });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ status: 'error', message: 'An internal server error occurred.' });
  }
});

//Abre el chat
router.get('/chat',async(req,res)=>{
  res.render('chat');
})

//Muestro los productos que tiene el carrito
router.get('/cart/:cid',async(req,res)=>{
  const { cid } = req.params;
  const carts = await cart.getCartBy(cid);
  console.log(JSON.stringify(carts, null, '\t'));
  res.render('cart',{carth:carts} );
})

router.get('/register',privacy('NO_AUTHENTICATED'), async(req,res)=>{
  res.render('register');
})

router.get('/login', privacy('NO_AUTHENTICATED'), async(req,res)=>{
  res.render('login');
})

router.get('/profile', privacy('PRIVATE'), (req,res) => {
  res.render('profile', {user:req.session.user})
})

//Vista con JWT
router.get('/', (req,res) => {
  res.render('jwtProfile')

})
export default router;
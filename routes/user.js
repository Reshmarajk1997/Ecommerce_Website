var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')
var userHelper = require('../helpers/user-helpers');
const userHelpers = require('../helpers/user-helpers');

const verifyLoggedIn =(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}


/* GET home page. */
router.get('/', async function(req, res, next) {

  let user = req.session.user;
  let cartCount = null;
  if(user){
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelper.getAllProducts().then((product)=>{
    // console.log('product is',product);
    res.render('user/view-products',{product,user,cartCount});
  })
 
});

router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    // console.log('session is',req.session.loggedIn);
    res.redirect('/')
  }else{
    // logginError = 'Invalid Email or Password';
    res.render('user/login',{"logginError":req.session.err});
    req.session.err = false
  }
  
})

router.get('/signup',(req,res)=>{
  res.render('user/signup');
})

router.post('/signup',(req,res)=>{
  userHelper.doSignUp(req.body).then((response)=>{
    // console.log('received data  ',response);
    req.session.loggedIn = true;
    req.session.user = response
    res.redirect('/')
  })
})

router.post('/login',(req,res)=>{
  userHelper.doLogin(req.body)
  .then((response)=>{
    if(response.status){
      console.log(' response iss ',response);
      req.session.loggedIn = true;
      req.session.user = response.user
      console.log(' user isss ',response.user );
      
      res.redirect('/')
    }else{
      req.session.err = "Invalid Email or Password"
      res.redirect('/login')
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/login')
})

router.get('/cart',verifyLoggedIn, async(req,res)=>{
  let user =  req.session.user;

  let products = await userHelpers.getCartProduct(req.session.user._id)
  // console.log('cart returned product is ', products);
  // console.log('user ',user);
  res.render('user/cart',{user,products})
})



router.get('/add-to-cart/:id',verifyLoggedIn,(req,res)=>{
  // console.log('logged in ');
  // console.log('session id ',req.session.user._id);
  userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
    // res.redirect('/')
  })
})

router.post('/change-product-quantity',(req,res)=>{
  // console.log(req.body);
  userHelpers.changeProductQuantity(req.body).then((response)=>{
    // console.log('the data is ',data);
    res.json(response)
  })
})

router.get('/place-order',verifyLoggedIn,async(req,res)=>{
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{total});
})

module.exports = router;

var express = require('express');
const { log } = require('handlebars');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelper.getAllProducts().then((product)=>{
    console.log('product is',product);
    res.render('admin/view-products',{product,admin:true});
  })
  
});

router.get('/add-products',(req,res)=>{
  res.render('admin/add-products',{admin:true})
})

router.post('/add-products',(req,res)=>{
  
  console.log(req.body);
  console.log(req.files.Image);
  
  productHelper.addproduct(req.body,(id)=>{
    let image = req.files.Image
    console.log('id is',id);
    image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.render('admin/add-products')
      }else{
        console.log('error is',err);
      }
    })
    
  })
})

router.get('/delete-product/:id',(req,res)=>{
  let proId = req.params.id
  // console.log('proid',proId);
  productHelper.deleteProduct(proId).then((response)=>{
    res.redirect('/admin')
  })
})

router.get('/edit-product/:id',async(req,res)=>{
    let product = await productHelper.getProductDetails(req.params.id)
    res.render('admin/edit-product',{product}) 
})


router.post('/edit-product/:id',(req,res)=>{
  let proId  = req.params.id
  // console.log('id of product is',proId);
  productHelper.updateProduct(proId,req.body).then(()=>{
    res.redirect('/admin')
    if(req.files && req.files.Image){
      let image = req.files.Image
      image.mv('./public/product-images/'+proId+'.jpg')
    }
  })
})


module.exports = router;

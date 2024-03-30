let db = require('../configuration/connection');
let collection = require('../configuration/collection');
let objectId = require('mongodb').ObjectId
let bcrypt = require('bcrypt');
const { response } = require('express');

module.exports = {
    doSignUp:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.password = await bcrypt.hash(userData.password,10) 
            let result = await db.get().collection(collection.USER_COLLECTION).insertOne(userData)

            // .then((data)=>{
            //     console.log('data isssss ',data);
            //     resolve(data)
            // })

            let insertedDocument = await db.get().collection(collection.USER_COLLECTION).findOne({_id:result.insertedId})
            // console.log(' inserted data is ',insertedDocument);
            resolve(insertedDocument)
        })
    },

    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let logginStatus = false;
            let response = {};
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            // console.log('user ',user);
            if(user){

                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        console.log('login successful');
                        response.user = user
                        response.status = true
                        // console.log('response ',response);
                        resolve(response)
                    }else{
                        console.log('login failed');
                        resolve({status:false})
                    }
                })

            }else{
                console.log('login failed');
                resolve({status:false})
            } 
        })
    },

    addToCart:(proId,userId)=>{
        let proObj = {
            item : new objectId(proId),
            quantity : 1 
        }
        return new Promise(async(resolve,reject)=>{
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user:new objectId(userId)})
            console.log('user cart is ',userCart);
            if(userCart){

                let proExist = userCart.products.findIndex( product=> product.item ==proId)
                console.log('product iss ',proExist);
                if(proExist!=-1){
                    db.get().collection(collection.CART_COLLECTION).updateOne({
                        user : new objectId(userId),
                        'products.item':new objectId(proId)},
                    {
                        $inc:{'products.$.quantity':1}
                    }
                    ).then(()=>{
                        resolve()
                    })
                }else{
                    db.get().collection(collection.CART_COLLECTION).updateOne({user: new objectId(userId)},
                {
                    $push:{products: proObj}
                }
                ).then(()=>{
                    resolve()
                })
                }

            }else{
                let cartObj = {
                    user : new objectId(userId),
                    products : [proObj]
                }

                 await db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then(()=>{
                    
                    resolve()
                })
            }
        })
    },

    getCartProduct:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user: new objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },{

                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                                item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                            }  
                }
                
                // {
                //     $lookup:{
                //         from:collection.PRODUCT_COLLECTION,
                //         let:{proList:'$products'},
                //         pipeline:[
                //             {
                //                 $match:{
                //                     $expr:{
                //                         $in:['$_id','$$proList']
                //                     }
                //                 }
                //             }
                //         ],
                //         as:'cartItems'
                //     }
                // }
            ]).toArray()
            // console.log(cartItems);
            resolve(cartItems)
        })
    },

    getCartCount : (userId)=>{
        return new Promise(async(resolve,reject)=>{

            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user: new objectId(userId)});
            let cartCount = 0
            if(cart){
                 cartCount = cart.products.length
                // console.log('cart count ', cartCount);
            }
            resolve(cartCount)
        })
    },

    changeProductQuantity:async(details)=>{

        try{
            details.count = parseInt(details.count)
            details.quantity = parseInt(details.quantity)
            if(details.count==-1 && details.quantity==1){
                await db.get().collection(collection.CART_COLLECTION).
                updateOne({_id:new objectId(details.cart)},
                {
                    $pull:{products:{item:new objectId(details.product)}}
                }
                );
                    return{removeProduct:true};
                
            }else{
                    await db.get().collection(collection.CART_COLLECTION).updateOne({
                                    _id : new objectId(details.cart),
                                    'products.item':new objectId(details.product)},
                                {
                                    $inc:{'products.$.quantity':details.count}
                                }
                                );
                                return(true)
            }
            

            // const updtdCart =  await  db.get().collection(collection.CART_COLLECTION).findOne(
            //     {
            //     _id : new objectId(details.cart),
            //     'products.item':new objectId(details.product)
            // },
            // {
            //     projection:{
            //         'products.$':1
            //     }
            // }
            // )

            // console.log('upd cart ',updtdCart.products[0].quantity);
            // return updtdCart.products[0].quantity;

        }catch(err){
            console.log('err is ',err);
        }

        // let count = parseInt(details.count)
        
        // return new Promise(async(resolve,reject)=>{
        //     db.get().collection(collection.CART_COLLECTION).updateOne({
        //         _id : new objectId(details.cart),
        //         'products.item':new objectId(details.product)},
        //     {
        //         $inc:{'products.$.quantity':count}
        //     }
        //     ).then(()=>{
        //         db.get().collection(collection.CART_COLLECTION).find({
        //             _id : new objectId(details.cart)
        //         })
        //         // resolve()
        //     }).then((data)=>{
        //         console.log(' data found is  ', data);
        //         resolve()
        //     })
        // })
    },
    getTotalAmount:(userId)=>{

        return new Promise(async(resolve,reject)=>{
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user: new objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },{

                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                                item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                            }  
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:[{$toDouble:'$quantity'},{$toDouble:'$product.Price'}]}}
                    }
                }
   
            ]).toArray()
            console.log(total);
            resolve(total[0].total)
        })
    }
}
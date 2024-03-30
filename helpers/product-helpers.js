let db = require('../configuration/connection');
let collection = require('../configuration/collection');
const { response } = require('express');
let objectId = require('mongodb').ObjectId
module.exports = {
    addproduct:(product,callback)=>{
        console.log(product);
        db.get(). collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
            console.log('data ',data);
             callback(data.insertedId.toString())
        })  
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)  
        })
    },

    deleteProduct:(proId)=>{
        return new Promise(async(resolve,reject)=>{
             db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:new objectId(proId)}).then((response)=>{
                console.log('deleted data iiis',response);
                resolve(response)
            })
        })
    },

    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:new objectId(proId)}).then((product)=>{
                // console.log('got product ',product);
                resolve(product)
            })
        })
    },

    updateProduct:(proId,productDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:new objectId(proId)},
           { $set:
                {
                Name:productDetails.Name,
                Description:productDetails.Description,
                Price:productDetails.Price,
                Catagory:productDetails.Catagory
            }}).then((response)=>{
                resolve()
            })
        })
    }
}
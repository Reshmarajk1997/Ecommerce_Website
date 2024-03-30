const mongoClient = require('mongodb').MongoClient

const state = {
    db:null
}


// module.exports.connect =  function (done) {
//     const url = "mongodb://127.0.0.1:27017";
    
//     const dbName = 'shopping'
    
//     mongoClient.connect(url, (err, data) => {
        
//         console.log('data ',data);
//         if (err) return done(err)
//         state.db = data.db(dbName)
//         console.log('state inside ',state.db);
//         done()
        
//     })
// };

module.exports.connect = async function() {
    const url = "mongodb://127.0.0.1:27017";
    const dbName = 'shopping';

    try {
        const client = await mongoClient.connect(url);
        state.db = client.db(dbName);
        console.log('Database connected to port 2710');
    } catch (err) {
        console.error('Connection error:', err);
        throw err; // Propagate the error
    }
}



module.exports.get = function(){
    // console.log('state is ',state.db);
    return state.db
}
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());

//root 
app.get('/',(req,res)=> {
    res.send('ToddlerShops running');
    
})

//app listen
app.listen(port,()=> {
    console.log(`ToddlerShop Running on port ${port}`);
})

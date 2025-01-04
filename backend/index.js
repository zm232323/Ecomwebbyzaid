const port = process.env.PORT || 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

app.use(express.json());
app.use(cors());

// Database conection with mongodb

// mongoose.connect("mongodb+srv://zm086220:hidetodo00%40@cluster0.enra2.mongodb.net/e-commerce");
mongoose.connect("mongodb://localhost:27017/e-commerce");


//api creation

app.get("/",(req,res)=>{
   res.send("Express app is running")
})

// Image storage engine

const storage = multer.diskStorage({
  destination:'./upload/images',
  filename:(req,file,cb)=>{
    return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
})

const upload = multer({storage:storage})

//Creating upload Endpoint for images
app.use('/images',express.static('upload/images'))

app.post("/upload",upload.single('product'),(req,res)=>{
   res.json({
    success:1,
    image_url:`http://localhost:${port}/images/${req.file.filename}`
   })
})

// Schema for creating products

const Product = mongoose.model("Product",{
  id:{
    type:Number,
    required:true,
  },
  name:{
    type:String,
    required:true,
  },
  image:{
    type:String,
    required:true,
  },
  category:{
    type:String,
    required:true,
  },
  new_price:{
    type:Number,
    required:true,
  },
  old_price:{
    type:Number,
    required:true,
  },
  date:{
    type:Date,
    default:Date.now,
  },
  available:{
    type:Boolean,
    default:true,
  },
})

app.post('/addproduct',async(req,res)=>{
  let products = await Product.find({});
  let id;
  if(products.length>0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id+1;
  }
  else{
    id=1;
  }
  const product = new Product({
    id:id,
    name:req.body.name,
    image:req.body.image,
    category:req.body.category,
    new_price:req.body.new_price,
    old_price:req.body.old_price,
  })
  console.log(product);
  await product.save();
  console.log("Saved");
  res.json({
    success:true,
    name:req.body.name,
  })


})

// Craete APi for deleting products

app.post('/removeproduct',async(req,res)=>{
  await Product.findOneAndDelete({id:req.body.id});
  console.log("Removed");
  res.json({
    success:true,
    name:req.body.name,
  })
})

// Creating API for getting all products

app.get('/allproducts',async(req,res)=>{
  let products = await Product.find({});
  console.log("All products Fetched");
  res.send(products);
})

//Shena creating for User model

const Users = mongoose.model('Users',{
  name:{
    type:String,
  },
  email:{
    type:String,
    unique:true,
  },
  password:{
    type:String,
  },
  cartData:{
    type:Object,
  },
  date:{
    type:Date,
    default:Date.now,
  }
})

//creating endpoint for regestering the user
app.post('/signup',async(req,res)=>{
  let check = await Users.findOne({email:req.body.email});
  if (check) {
    return res.status(400).json({success:false,errors:"existing user found with same email address"});
  }
  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i]=0;
  }
  const user = new Users({
    name:req.body.username,
    email:req.body.email,
    password:req.body.password,
    cartData:cart,
  })

  await user.save();

  const data = {
    user:{
      id:user.id
    }
  }

  const token = jwt.sign(data,'secret_ecom');
  res.json({success:true,token})
})

//creating endpoint for user login
app.post('/login',async (req,res)=>{
   let user = await Users.findOne({email:req.body.email});
   if(user) {
     const passCompare = req.body.password === user.password;
     if(passCompare) {
      const data = {
        user:{
          id:user.id
        }
      }
      const token = jwt.sign(data,'secret_ecom');
      res.json({success:true,token});
     }
     else{
      res.json({success:false,errors:"Wrong Password"});
     }
   }
   else{
    res.json({success:false,errors:"Wrong email id"})
   }
})

//creating endpoint for newcollection data
app.get('/newcollections',async(req,res)=>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("NewCollection fetch");
    res.send(newcollection);
})

//creating endpoint for popular in women section
app.get('/popularinwomen',async(req,res)=>{
   let products = await Product.find({category:'women'});
   let popular_in_women = products.slice(0,4);
   console.log("popular in women fetched");
   res.send(popular_in_women);
})

// Middleware to fetch user
const fetchUser = (req, res, next) => {
  const token = req.header('auth-token'); // Get token from headers
  if (!token) {
    return res.status(401).send({ error: 'Please authenticate using a valid token' });
  }
  try {
    const data = jwt.verify(token, 'secret_ecom'); // Verify token
    req.user = data.user; // Attach user data to request object
    next(); // Proceed to the next middleware/route
  } catch (error) {
    return res.status(401).send({ error: 'Please authenticate using a valid token' });
  }
};

// Adding product to cart
app.post('/addtocart', fetchUser, async (req, res) => {
  console.log("added", req.body.itemId);
  try {
    let userData = await Users.findOne({ _id: req.user.id });

    if (!userData) {
      return res.status(404).send({ error: 'User not found' });
    }

    if (!userData.cartData) {
      userData.cartData = {};
    }

    const { itemId } = req.body;
    userData.cartData[itemId] = (userData.cartData[itemId] || 0) + 1;

    await Users.findOneAndUpdate(
      { _id: req.user.id },
      { cartData: userData.cartData },
      { new: true }
    );

    res.status(200).send({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Removing product from cart
app.post('/removefromcart', fetchUser, async (req, res) => {
  console.log("removed", req.body.itemId);

  try {
    let userData = await Users.findOne({ _id: req.user.id });

    if (!userData) {
      return res.status(404).send({ error: 'User not found' });
    }

    if (!userData.cartData) {
      userData.cartData = {};
    }

    const { itemId } = req.body;
    if (userData.cartData[itemId]) {
      userData.cartData[itemId] -= 1;
      if (userData.cartData[itemId] <= 0) {
        delete userData.cartData[itemId];
      }
    }

    await Users.findOneAndUpdate(
      { _id: req.user.id },
      { cartData: userData.cartData },
      { new: true }
    );

    res.status(200).send({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

//creating endpoint to get cartdata
app.post('/getcart',fetchUser,async(req,res)=>{
   console.log("GetCart");
   let userData = await Users.findOne({_id:req.user.id});
   res.json(userData.cartData);
})



app.listen(port, (err) => {
    if (!err) {
      console.log("Server Running on Port " + port);
    } else {
      console.log("Error: " + err);
    }
  });

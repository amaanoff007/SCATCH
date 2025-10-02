const express = require('express');
const router = express.Router();
const ownerModel = require("../models/owner-models");
const Product = require("../models/product-model"); // Product schema
const upload = require("../config/multer-config");
const { registerOwner, loginOwner, logoutOwner } = require("../controllers/authController");
const isOwnerLoggedIn = require("../middlewares/isOwnerLoggedIn");
console.log("NODE_ENV is:", process.env.NODE_ENV);

// ----------------- Owner Routes -----------------
if (process.env.NODE_ENV === "development") {
  // Create a new owner
  router.post("/create", async function(req, res) {
    try {
      let owners = await ownerModel.find();

      if (owners.length > 0) {
        return res
          .status(503)
          .send("YOU don't have permission to create a new owner.");
      }

      const { fullname, email, password } = req.body;
      let createdOwner = await ownerModel.create({ fullname, email, password });
      console.log("Created owner:", createdOwner);
      res.status(201).send(createdOwner);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error creating owner");
    }
  });
}

// ----------------- Product Routes -----------------
// GET: Render create product page
router.get("/createproducts", isOwnerLoggedIn, (req, res) => {
  res.render("createproducts", { success: "" });
});

// POST: Create a new product
router.post("/createproducts", isOwnerLoggedIn, upload.single("image"), async (req, res) => {
  try {
    const { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;
    
    // Handle file upload for image
    let imageBuffer = Buffer.alloc(0);
    if (req.file) {
      imageBuffer = req.file.buffer;
    }

    const product = new Product({
      name,
      price: parseFloat(price),
      discount: parseFloat(discount) || 0,
      bgcolor,
      panelcolor,
      textcolor,
      image: imageBuffer,
      owner: req.owner._id, // Associate product with the logged-in owner
    });

    await product.save();
    res.render("createproducts", { success: "Product created successfully!" });
  } catch (err) {
    console.error(err);
    res.render("createproducts", { success: "Error creating product!" });
  }
});

// ----------------- Owner Products Routes -----------------
// GET: View all products uploaded by the logged-in owner
router.get("/myproducts", isOwnerLoggedIn, async (req, res) => {
  try {
    const products = await Product.find({ owner: req.owner._id });
    res.render("owner-products", { products });
  } catch (err) {
    console.error("Error loading owner products:", err);
    res.status(500).send("Error loading your products");
  }
});

// ----------------- Owner Authentication Routes -----------------
router.get("/login", (req, res) => {
  const errors = req.flash("error");
  res.render("owner-login", { error: errors[0] });
});

router.post("/login", loginOwner);
router.post("/register", registerOwner);
router.get("/logout", logoutOwner);

// ----------------- Admin Route -----------------
// Optional: if /owners/admin should redirect to create products
router.get("/admin", (req, res) => {
  res.redirect("/owners/createproducts");
});

module.exports = router;

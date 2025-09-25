const express = require('express');
const router = express.Router();
const ownerModel = require("../models/owner-models");
const Product = require("../models/product-model"); // Product schema
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
router.get("/createproducts", (req, res) => {
  res.render("createproducts", { success: "" }); // pass default value
});

// POST: Create a new product
router.post("/createproducts", async (req, res) => {
  try {
    const { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;
    // handle file upload for image if needed; placeholder here
    const imageBuffer = Buffer.alloc(0); // empty buffer for now

    const product = new Product({
      name,
      price,
      discount,
      bgcolor,
      panelcolor,
      textcolor,
      image: imageBuffer,
    });

    await product.save();
    res.render("createproducts", { success: "Product created successfully!" });
  } catch (err) {
    console.error(err);
    res.render("createproducts", { success: "Error creating product!" });
  }
});

// ----------------- Admin Route -----------------
// Optional: if /owners/admin should redirect to create products
router.get("/admin", (req, res) => {
  res.redirect("/owners/createproducts");
});

module.exports = router;

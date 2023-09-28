const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path'); // Add this line

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/dashboard/index.html');
});



app.use(express.static(path.join(__dirname, 'dashboard')));

app.set('view engine', 'ejs'); // Set EJS as the template engine
app.set('views', path.join(__dirname, 'dashboard')); // Set the views directory

app.use(express.static(__dirname + '/dashboard'));

app.use(express.static(__dirname + '/dashboard/views/ejs'));


const { v4: uuidv4 } = require('uuid');

const sessionSecret = uuidv4();


const session = require('express-session');

const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

app.set('views', path.join(__dirname, 'dashboard/views'));


app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false
}));

// Configure Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Configure Discord OAuth2
passport.use(new DiscordStrategy({
  clientID: '1107454488488443985',
  clientSecret: 'ciPNYVI1JxFvGe3o7HW5ShYV6RhfQNzc',
  callbackURL: 'https://ord-bank.dexterawesome.repl.co/auth/discord/callback', // Replace with your callback URL
  scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
  // This function will be called when the authentication is successful
  // You can access the user's information in the 'profile' object
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  // Serialize the user object
  done(null, user);
});

passport.deserializeUser((user, done) => {
  // Deserialize the user object
  done(null, user);
});

app.set('views', path.join(__dirname, 'dashboard/views'));


app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', passport.authenticate('discord', {
  successRedirect: '/dashboard',
  failureRedirect: '/'
}));

// Read the credits.json file
const creditsFilePath = path.join(__dirname, 'JSON/credits.json');

const productsFilePath = path.join(__dirname, 'JSON/products.json');
let products = [];

// read products data from file
fs.readFile(productsFilePath, 'utf-8', (err, data) => {
  if (err) throw err;
  products = JSON.parse(data);
});

// watch for changes to the products.json file
fs.watch(productsFilePath, (eventType, filename) => {
  console.log(`${filename} file changed`);
  
  // read the updated products data from file
  fs.readFile(productsFilePath, 'utf-8', (err, data) => {
    if (err) throw err;
    products = JSON.parse(data);
    console.log('Products data updated');
  });
});



function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/discord');
}

app.get('/dashboard', ensureAuthenticated, (req, res) => {
  
  // Access the user's information from 'req.user' object
  const user = req.user;
  
  // Read the credits.json file
  const creditsData = fs.readFileSync(creditsFilePath);
  const credits = JSON.parse(creditsData);

  res.render('ejs/dashboard', { user, credits, products }); // Render the 'dashboard.ejs' template
});

   app.get('/shop', ensureAuthenticated, (req, res) => {
  
  // Access the user's information from 'req.user' object
  const user = req.user;
  
  // Read the credits.json file
  const creditsData = fs.readFileSync(creditsFilePath);
  const credits = JSON.parse(creditsData);

  res.render('ejs/shop', { user, credits, products }); // Render the 'dashboard.ejs' template
});


app.get('/shop/success', ensureAuthenticated, (req, res) => {
  
  // Access the user's information from 'req.user' object
  const user = req.user;
  const { product, account } = req.query;
  
  
  // Read the credits.json file
  const creditsData = fs.readFileSync(creditsFilePath);
  const credits = JSON.parse(creditsData);

  if (req.user.hasPurchased === true) {
    // User has made a purchase, allow access to the success page
    res.render('ejs/success', { user, credits, products, account, product }); // Render the 'dashboard.ejs' template
  } else {
    // User has not made a purchase, redirect to a different page or show an error
    res.redirect('/shop');
  }

});

app.get('/shop/failed', ensureAuthenticated, (req, res) => {
  const user = req.user;
  const { product } = req.query;

  if (req.user.hasPurchased === true) {
    // User has made a purchase, allow access to the success page
    res.render('ejs/failed', { user, products, product }); // Render the 'dashboard.ejs' template
  } else {
    // User has not made a purchase, redirect to a different page or show an error
    res.redirect('/shop');
  }
})



app.post('/update-credits', express.json(), (req, res) => {
  const updatedCredits = req.body;
  
  // Update the credits.json file with the received data
  fs.writeFileSync(creditsFilePath, JSON.stringify(updatedCredits, null, 2));

  res.json(updatedCredits); // Send the updated credits back to the client
});



app.post('/purchase', express.urlencoded({ extended: true }), (req, res) => {
  const { product } = req.body;

  req.user.hasPurchased = true;

  // Function to fetch the price and accounts based on the product name
  function getProductDetails(product) {
    // Read the products.json file
    const productsFilePath = path.join(__dirname, 'JSON/products.json');
    const productsData = fs.readFileSync(productsFilePath, 'utf-8');
    const products = JSON.parse(productsData);

    // Check if the product exists in the products object
    if (product in products) {
      const { price, accounts } = products[product];
      return { price, accounts }; // Return the price and accounts of the product
    }

    return { price: 0, accounts: [] }; // Product not found, return default values
  }

  // Fetch the price and accounts for the selected product
  const { price, accounts } = getProductDetails(product);

  // Access the user ID from req.user (assuming it's available)
  const userId = req.user.id;

  // Read the credits.json file
  const creditsFilePath = path.join(__dirname, 'JSON/credits.json');
  const creditsData = fs.readFileSync(creditsFilePath, 'utf-8');
  const credits = JSON.parse(creditsData);

  // Check if the user has enough credits to make the purchase
  if (userId in credits && credits[userId] >= price && accounts.length > 0) {
    // Subtract the price from the user's credits
    credits[userId] -= price;

    // Save the updated credits back to the credits.json file
    fs.writeFileSync(creditsFilePath, JSON.stringify(credits));

    console.log('Name: ' + product);
    console.log('Price: ' + price);
    console.log('User ID: ' + userId);

    const purchasedAccount = accounts.shift(); // Remove and retrieve the first account
    console.log('Account: ' + purchasedAccount); // Print the first account in the log

    // Perform the necessary logic with the product and price
    // ...

    // Update the accounts list in the products.json file
    const productsFilePath = path.join(__dirname, 'JSON/products.json');
    const productsData = fs.readFileSync(productsFilePath, 'utf-8');
    const products = JSON.parse(productsData);

    if (product in products) {
      products[product].accounts = accounts; // Update the accounts list

      // Save the updated products back to the products.json file
      fs.writeFileSync(productsFilePath, JSON.stringify(products));
    }

    

    res.redirect(`/shop/success?product=${encodeURIComponent(product)}&account=${encodeURIComponent(purchasedAccount)}`);

  } else {
    // User doesn't have enough credits or there are no accounts available
    console.log('Insufficient balance or no accounts available!');
    res.redirect(`/shop/failed?product=${encodeURIComponent(product)}`)
  }
});






const listener = app.listen(3000, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
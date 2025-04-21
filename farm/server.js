import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import pkg from "pg";
import bcrypt from "bcryptjs";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import env from "dotenv";

const app = express();
const port = 3000;
const saltRounds = 10;
env.config(); // Load environment variables

// Log the DATABASE_URL to ensure it's loaded correctly
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const { Pool } = pkg;

// Check if DATABASE_URL is defined and log an error if not
if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL is not defined in your .env file.");
  process.exit(1); // Exit the process if DATABASE_URL is missing
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});

// Serve HTML pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "landingpage.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "loginpage.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "registrationpage.html"));
});

app.get("/homepage", (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, "public", "homepage.html"));
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/login");
  });
});

// 🔐 Local Strategy for Login (Buyer only for now)
passport.use(
  "local",
  new Strategy(async (username, password, cb) => {
    try {
      const result = await pool.query(
        "SELECT * FROM buyer WHERE busername = $1",
        [username]
      );
      const user = result.rows[0];

      if (!user) return cb(null, false, { message: "User not found" });

      const valid = await bcrypt.compare(password, user.bpassword);
      if (!valid) return cb(null, false, { message: "Invalid password" });

      return cb(null, user);
    } catch (err) {
      return cb(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.bid); // Save buyer ID
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query("SELECT * FROM buyer WHERE bid = $1", [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});

// ✍️ Registration Route
app.post("/register", async (req, res) => {
  const {
    bemail,
    busername,
    bpassword,
    confirmpassword,
    bname,
    bmobile,
    baddress,
  } = req.body;

  if (bpassword !== confirmpassword) return res.redirect("/register");

  try {
    const userExists = await pool.query(
      "SELECT * FROM buyer WHERE bemail = $1 OR busername = $2",
      [bemail, busername]
    );

    if (userExists.rows.length > 0) return res.redirect("/register");

    const hash = await bcrypt.hash(bpassword, saltRounds);
    const bhash = Math.random().toString(36).substring(2, 15); // Random string

    await pool.query(
      `INSERT INTO buyer (bname, busername, bpassword, bhash, bemail, bmobile, baddress, bactive)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 1)`,
      [bname, busername, hash, bhash, bemail, bmobile, baddress]
    );

    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.redirect("/register");
  }
});

// 🔑 Login Route
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect("/login?error=Invalid%20Credentials");

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect("/homepage");
    });
  })(req, res, next);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

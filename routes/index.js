var express = require('express');
var router = express.Router();
var userModel = require("./users");
var postModel = require("./posts");
const passport = require("passport");
const localStratergy = require("passport-local");
const upload = require('./multer');
passport.use(new localStratergy(userModel.authenticate()))
router.get('/', function (req, res) {
  res.render('index', { footer: false });
});

router.get('/login', function (req, res) {
  res.render('login', { footer: false });
});

router.get('/feed', IsLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  const posts = await postModel.find().populate("user");
  res.render('feed', { footer: true, posts, user });
});

router.get('/profile', IsLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts")
  const posts = await postModel.find().populate("user");
  res.render('profile', { footer: true, user, posts });
});

router.get('/search', IsLoggedIn, function (req, res) {
  res.render('search', { footer: true });
});

// router.get('/username/:username', IsLoggedIn, async function (req, res) {
//   const regex = new RegExp(`^${req.params.username}`) 
//   const users = userModel.find({ username: regex });
// });

router.get('/edit', IsLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render('edit', { footer: true, user });
});

router.get('/upload', IsLoggedIn, function (req, res) {
  res.render('upload', { footer: true });
});

router.post("/register", function (req, res, next) {
  const userData = new userModel({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email
  })
  userModel.register(userData, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile")
    })
  })
})


router.post('/login', passport.authenticate("local",
  {
    successRedirect: "/profile",
    failureRedirect: "/login",
  }), function (req, res) {
  });
router.post('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

router.post('/update', upload.single('image'), async function (req, res, next) {
  const user = await userModel.findOneAndUpdate(
    {
      username: req.session.passport.user
    }, { username: req.body.username, name: req.body.name, bio: req.body.bio }, { new: true }
  );
  if (req.file) {
    user.profileImage = req.file.filename
  }
  req.logIn(user, function (err)
  {
    res.redirect('/profile')
  });
  await user.save();
})


function IsLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login")
}

router.post('/editupdate', IsLoggedIn,upload.single('image'), async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect("/edit")
});



router.post("/upload", IsLoggedIn, upload.single('image'), async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  const post = await postModel.create(
    {
      picture: req.file.filename,
      user: user._id,
      caption: req.body.caption,
    }
  )
  user.posts.push(post._id)
 await user.save();
  res.redirect('/feed')
})

module.exports = router;

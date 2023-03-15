var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let username = req.cookies.username;
  if(username){
    if(req.cookies.dept === 'office'){
      res.render('home',{page:req.cookies.dept})
       
    }
    else{
      res.render("home",{page:req.cookies.dept})
    }
    // console.log(page)
  }else{
    res.render('index',{msg:""})
  }
  // return res.render("index",{msg:""})
  
  
});
router.get('/login',function(req,res){
  let bad_auth = req.query.msg ? true:false;
  console.log(bad_auth)
  if(bad_auth){
    return res.render('index',{msg:"Invalid User!!"});
  }
  else{
    return res.render('index',{msg:""})
  }
  
})
router.get("/logout", (req, res) => {
  // clear the cookie
  res.clearCookie("username");
  // redirect to login
  return res.redirect("/login");
});

module.exports = router;

var express = require('express');
var router = express.Router();
var path=require('path')
var mysql = require('mysql')
var multer = require('multer')
var session=require('express-session');
const db = mysql.createPool({
  connectionLimit:10,
  host:'localhost',
  user:'root',
  password:"Srivalli@2",
  database:"miniproject"
})
db.getConnection((err)=>{
  if(err){
    console.log(err)
  }
  else{
      console.log("Connected!!")
  }
})
router.post('/process_login', function(req, res, next) {
  let {username,password}=req.body;
  const sql=`select password,department from faculty where username=?`
  db.query(sql,[username],(err,result)=>{
    if(err){
      console.log(err)
    }
    else{
      if(result.length==0){
        return res.redirect('/login?msg=fail')
      }
      else{
        if(password === result[0].password){
          res.cookie("username",username);
          res.cookie("dept",result[0].department);
          // console.log(req.cookies.dept)
          res.redirect('/')
        }
        else{
          return res.redirect('/login?msg=fail')
        }
      }
      
    }
  })
  
  

});


router.get('/searchfile', function(req, res, next) {
  res.render('search')
});

router.get('/upload', function(req, res, next) {
  res.render('upload',{msg1:""})
});

const storage =multer.diskStorage({
  destination:(req,res,cb)=>{
      cb(null,"public/images");
  },
  filename:(req,file,cb)=>{
      cb(null,file.originalname);
  }
})
const upload = multer({
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
  storage:storage,
})


router.post('/insert',function(req, res, next) {
    let user = {id: req.body.id,name:req.body.Text1};
    req.session.user = {
      id: user.id,
      name:user.name
    };
    // console.log(req.session.user.name)
    res.render('upload_img')

});
router.post('/uploadimage',upload.single('image'),(req,res)=>{
  const des=req.session.user.name;
  const id=req.session.user.id
  const dept=req.cookies.dept
  console.log(dept)
  console.log(req.session.user.id)
  console.log(req.session.user.name)
  var imagePath=(req.file.filename);
  if(!req.file){
      console.log("File not found")
  }
  else{
      var sql=`Insert into circulars_data (name,description,files,dept) values(?,?,?,?)`
      db.query(sql,[id,des,imagePath,dept],(err)=>{
          if(err){
              console.log(err)
          }
          else{
              console.log("Uploaded")
              // res.redirect('/users/upload');
              res.render('upload',{msg1:"Uploaded Successfully!!"})
          }
      })
  }
})


router.post("/search",(req,res)=>{
  const sname=req.body.date1;
  console.log(sname)
  const sql=`select DATE_FORMAT(name,'%d-%m-%Y') as name,description,files from circulars_data where name=?`;
  db.query(sql,[sname],(err,result)=>{
    if(err){
        console.log(err);
    }
    else{
        if(result.length>0){
          res.render('display',{data:result,title:" "});
        }
        else{
          res.render('display',{data:result,title:'No Circulars found on this date!!'})
        }
    }
  })
})

router.get("/totaldata",(req,res)=>{
  const dept=req.cookies.dept;
  const sql=`select DATE_FORMAT(name,'%d-%m-%Y') as name1,description,files from circulars_data  where dept=? order by str_to_date(name,"%Y-%m-%d") desc`;
  db.query(sql,[dept],(err,result)=>{
    if(err){
        console.log(err);
    }
    else{
        if(result.length>0){
          res.render('totaldisplay',{data:result});
        }
        else{
          res.render('display',{data:result,title:'No Circulars found!!'})
        }
        console.log(result)
    }
  })
})



module.exports = router;

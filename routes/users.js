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
  const sql=`select DATE_FORMAT(name,'%m-%d-%Y') dates_total from circulars_data where name`;
  db.query(sql,(err,result)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log(result)
        res.render('search',{page:req.cookies.dept,data:result})
    }
  })
  
});

router.get('/uploadoffice', function(req, res, next) {
  res.render('officepage',{msg1:"",page:req.cookies.dept})
});


router.get('/upload', function(req, res, next) {
  res.render('upload',{msg1:"",page:req.cookies.dept})
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
    let user = {id: req.body.id,name:req.body.Text1,tobranch:req.cookies.dept};
    req.session.user = {
      id: user.id,
      name:user.name,
      tobranch:user.tobranch
    };
    // console.log(req.session.user.name)
    res.render('upload_img',{page:req.cookies.dept})

});
router.post('/insertoffice',function(req, res, next) {
  let user = {id: req.body.id,name:req.body.Text1,branch:req.body.branch};
  req.session.user = {
    id: user.id,
    name:user.name,
    todept:user.branch
  };
  console.log(req.body)
  res.render('upload_img',{page:req.cookies.dept})

});
router.post('/uploadimage',upload.single('image'),(req,res)=>{
  const des=req.session.user.name;
  const id=req.session.user.id
  const dept=req.cookies.dept
  const tobranch=req.session.user.todept
  console.log(dept)
  console.log(tobranch)
  console.log(req.session.user.id)
  console.log(req.session.user.name)
  var imagePath=(req.file.filename);
  if(!req.file){
      console.log("File not found")
  }
  else{
      var sql=`Insert into circulars_data (name,description,files,dept,todept) values(?,?,?,?,?)`
      db.query(sql,[id,des,imagePath,dept,tobranch],(err)=>{
          if(err){
              console.log(err)
          }
          else{
              console.log("Uploaded")
              // res.redirect('/users/upload');
              if(dept ==='office'){
                res.render('officepage',{msg1:"Uploaded Successfully!!",page:req.cookies.dept})
              }
              else{
                res.render('upload',{msg1:"Uploaded Successfully!!",page:req.cookies.dept})
              }
              
          }
      })
  }
})


router.post("/search",(req,res)=>{
  const sname=req.body.date1;
  const inputDate = sname; // MM/DD/YYYY format
  const dateObj = new Date(inputDate);
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // add leading zero if needed
  const day = dateObj.getDate().toString().padStart(2, '0'); // add leading zero if needed
  const outputDate = `${year}-${month}-${day}`; // YYYY-MM-DD format
  console.log(outputDate); 
  console.log(sname)
  const sql=`select DATE_FORMAT(name,'%d-%m-%Y') as name,description,files from circulars_data where name=?`;
  db.query(sql,[outputDate],(err,result)=>{
    if(err){
        console.log(err);
    }
    else{
        if(result.length>0){
          res.render('display',{data:result,title:" ",page:req.cookies.dept});
        }
        else{
          res.render('display',{data:result,page:req.cookies.dept,title:'No Circulars found on this date!!'})
        }
        console.log(result);
    }
  })
})

router.get("/totaldata",(req,res)=>{
  const dept=req.cookies.dept;
  const d1="ALL";
  const sql=`select DATE_FORMAT(name,'%d-%m-%Y') as name1,description,files,dept from circulars_data where todept=? or todept=? order by str_to_date(name,"%Y-%m-%d") desc`;
  db.query(sql,[d1,dept],(err,result)=>{
    if(err){
        console.log(err);
    }
    else{
        if(result.length>0){
          res.render('totaldisplay',{data:result,page:req.cookies.dept});
        }
        else{
          res.render('display',{data:result,page:req.cookies.dept,title:'No Circulars found!!'})
        }
        console.log(result)
    }
  })
})



module.exports = router;

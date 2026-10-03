const multer=require('multer')

const storage = multer.diskStorage({
  // destination: "'../public'",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})



const upload = multer({ storage: storage,
  limits:{fileSize:5*1024*1024},  //5mb limit
 })

module.exports=upload;
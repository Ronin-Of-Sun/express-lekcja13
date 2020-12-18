// zmienne i stałe
var express = require("express")
var path = require("path")
var hbs = require('express-handlebars')
var app = express()
var formidable = require('formidable')
const { stringify } = require("querystring")
const port = process.env.PORT || 3000
var datatable = [] // {id:, name:, path:, size:, type:, savedate:, img:}
var nextid = 1

//parsowanie
var bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: true }));

//spis stron
app.get("/", function (req, res) {
    res.redirect("/filemanager")
})

app.get("/upload", function (req, res) {
    res.render('upload.hbs')
})
app.post("/upload", function (req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = __dirname + '/static/upload/'
    form.keepExtensions = true
    form.multiples = true
    form.parse(req, function (err, fields, files) {
        if (files.filetoupload.length == undefined) { //pojedynczy plik
            var temp = { id: nextid, name: files.filetoupload.name, path: files.filetoupload.path, size: files.filetoupload.size, type: files.filetoupload.type, savedate: Date.now(), img: undefined }
            nextid = nextid + 1
            switch (temp.type) {
                case "image/jpeg":
                    temp.img = "imgjpg"
                    break;
                case "image/png":
                    temp.img = "imgpng"
                    break;
                case "text/plain":
                    temp.img = "text"
                    break;
                case "application/pdf":
                    temp.img = "pdf"
                    break;
                default:
                    temp.img = "unknown"
                    break;
            }
            datatable.push(temp)
            res.redirect("/filemanager")
        } else { //wiele plików
            for (var i = 0; i < files.filetoupload.length; i++) {
                var temp = { id: nextid, name: files.filetoupload[i].name, path: files.filetoupload[i].path, size: files.filetoupload[i].size, type: files.filetoupload[i].type, savedate: Date.now(), img: undefined }
                nextid = nextid + 1
                switch (temp.type) {
                    case "image/jpeg":
                        temp.img = "imgjpg"
                        break;
                    case "image/png":
                        temp.img = "imgpng"
                        break;
                    case "text/plain":
                        temp.img = "text"
                        break;
                    case "application/pdf":
                        temp.img = "pdf"
                        break;
                    default:
                        temp.img = "unknown"
                        break;
                }
                datatable.push(temp)
            }
            res.redirect("/filemanager")
        }
    })
})

app.get("/clearFilemanagerAll", function (req, res) {
    datatable = []
    res.redirect("/filemanager")
})
app.get("/clearFilemanagerSingle/:id", function (req, res) {
    var deleteid = req.params.id
    var index = datatable.findIndex(object => object.id == deleteid)
    if (index != undefined) {
        datatable.splice(index, 1)
    }
    res.redirect("/filemanager")
})

app.get("/filemanager", function (req, res) {
    context = { datatable }
    res.render("filemanager.hbs", context)
})

app.get("/info", function (req, res) {
    var fileid = req.query.id
    var filedata = datatable.find(object => object.id == fileid)
    context = filedata
    res.render("info.hbs", context)
})

app.get('/download', function (req, res) {
    var fileid = req.query.id
    var filedata = datatable.find(object => object.id == fileid)
    res.download(filedata.path, filedata.name)
});

//stały nasłuch portu i inne
app.use(express.static('static'))
app.set('views', path.join(__dirname, 'views'))
app.engine('hbs', hbs({
    defaultLayout: 'main.hbs',
    extname: '.hbs',
    partialsDir: "views/partials",
    helpers: {
        shortName: function (text) {
            if (text.length > 20) {
                return text.substring(0, 17) + "...";
            }
            else {
                return text
            }
        },
    }
})); app.set('view engine', 'hbs')
app.listen(port, function () {
    console.log("Serwer został uruchomiony na porcie: " + port)
})
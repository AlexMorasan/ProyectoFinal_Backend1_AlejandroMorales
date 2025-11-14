const express=require("express")
const {Server}=require("socket.io")
const {engine}=require("express-handlebars")
const {router: productRouter} = require("./routes/productsRouter.js")
const {router: cartRouter} = require("./routes/cartRouter.js")
const vistasRouter = require("./routes/viewsRouter.js")


const PORT=8080

const app=express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static("./src/public"))

//Integración de handlebars
app.engine("hbs", engine({extname:"hbs"}))
app.set("view engine","hbs")
app.set("views","./src/views")
//Fin de handlebars

//Definición de server con websockets
const serverHTTP=app.listen(PORT,()=>{
    console.log(`Server online en puerto ${PORT}`)
})
const io = new Server(serverHTTP)
//Fin de definición
//Area de Routers
/* app.use("/api/productos", productRouter) */
app.use(
    `/api/productos`,
    (req,res,next)=>{
        req.io=io
        next()
    },
    productRouter
)
app.use("/api/carts",cartRouter)
/* app.use("/",vistasRouter) */
app.use(
    `/`,
    (req,res,next)=>{
        req.io=io
        next()
    },
    vistasRouter
)


//permite iniciar una conexión y escuchar eventos
io.on("connection",(socket)=>{
    console.log(`Se ha conectado un cliente con id: ${socket.id} `)
    socket.emit("saludo", `Bienvenido! identificate`)
})
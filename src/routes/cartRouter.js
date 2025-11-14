const{Router}=require("express")

const { CartManager } = require("../dao/CartManager")
CartManager.path="./src/data/carts.json"
const { ProductManager } = require("../dao/ProductManager")
ProductManager.path="./src/data/productos.json"

const router = Router()

router.get("/", async (req,res)=>{
    try{
        let carts= await CartManager.getCarts()
        res.send(carts)
    }
    catch(error){
        console.log(error)

        res.setHeader(`Content-Type`,`application/json`);
        return res.status(500).json({error:`Internal server error`})
    }
})

router.get("/:id", async (req,res)=>{
    try{
        let{id}= req.params
        let cart= await CartManager.getCartById(id)
        if(!cart){
            res.setHeader(`Content-Type`,`application/json`);
            return res.status(400).json({error:`No existe un carrito con ese id`}) 
        }
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json(cart);
    }
    catch(error){
        console.log(error)
        res.setHeader(`Content-Type`,`application/json`);
        return res.status(500).json({error:`Internal server error`}) 
    }
})

router.post("/",async(req,res)=>{
    try{
        let nuevoCarrito = await CartManager.createCart()
        return res.status(200).json({message: "Carrito creado con éxito", carrito: nuevoCarrito})
    }
    catch(error){
        return res.status(500).json({error:"Error interno del servidor"})
    }
})

router.post("/:cid/product/:pid", async (req,res)=>{
    try{
        let {cid,pid} = req.params
        let cart= await CartManager.getCartById(cid)
        if(!cart){
            res.setHeader(`Content-Type`,`application/json`);
            return res.status(400).json({error:`No existe un carrito con el id ${cid}`})
        }
        let productos= await ProductManager.getProducts(pid)
        let productoExiste = productos.find(p=>p.id==+pid);
        if(!productoExiste){
            res.setHeader(`Content-Type`,`application/json`);
            return res.status(400).json({error:`No existe ningun producto con el id ${pid}`})
        }
        let carritoActualizado = await CartManager.addProductToCart(cid,pid)
        return res.status(200).json({message:`Producto agregado con éxito al carrito ${cid} 🛒`, carrito: carritoActualizado})
    }
    catch(error){
        return res.status(500).json({error:"Error interno del servidor"})
    }
})
module.exports={router}
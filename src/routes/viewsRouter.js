const{ProductManager} = require(`../dao/ProductManager`)
const Router = require(`express`).Router
const router = Router()

router.get(`/`,async(req,res)=>{
    let {cantidad}=req.query
    try{
        let productos=await ProductManager.getProducts()
        //Esta página permite ir cortando la cantidad de datos que se muestra
        if(cantidad){
            productos=productos.slice(0,cantidad)
        }
        //Fin 
        res.render("home",{
            productos
        })
    }
    catch(error){
        //Tratar de hacer una vista de error aquí
        res.setHeader(`Content-Type`,`application/json`)
        return res.status(500).json({error:`Internal server error`})
    }
})

router.get("/realTimeProducts",async(req,res)=>{
    let {cantidad}=req.query
    try{
        let productos=await ProductManager.getProducts()
        //Esta página permite ir cortando la cantidad de datos que se muestra
        if(cantidad){
            productos=productos.slice(0,cantidad)
        }
        //Fin 
        res.render("realTimeProducts",{
            productos
        })
    }
    catch(error){
        //Tratar de hacer una vista de error aquí
        res.setHeader(`Content-Type`,`application/json`)
        return res.status(500).json({error:`Internal server error`})
    }
})
module.exports=router
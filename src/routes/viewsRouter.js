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
        /* req.socket.emit("actualizarProductos",productos)  */
        //Esta página permite ir cortando la cantidad de datos que se muestra
        if(cantidad){
            productos=productos.slice(0,cantidad)
        }
        //Fin 
        res.render("realTimeProducts",{
            productos
        });
    }
    catch(error){
        //Tratar de hacer una vista de error aquí
        res.setHeader(`Content-Type`,`application/json`)
        return res.status(500).json({error:`Internal server error`})
    }
})

router.get("/realTimeProducts/delete/:id",async (req,res)=>{
    try{
        let{id}= req.params
        console.log(id)
        let producto= await ProductManager.getProductById(id)
        if(!producto){
            res.setHeader(`Content-Type`,`application/json`);
            return res.status(400).json({error:`No existe un producto con ese id`}) 
        }
        await ProductManager.deleteProductById(id)
        const productos = await ProductManager.getProducts()
        req.io.emit("actualizarProductos",productos) 
        res.redirect("/realTimeProducts");
        /* return res.status(201).json({payload:`Producto con id ${id} eliminado con exito 😁!!`}); */
    }
    catch(error){
        console.log(error)
        res.setHeader(`Content-Type`,`application/json`);
        return res.status(500).json({error:`Internal server error`})       
    }
})

router.post("/realTimeProducts/addProduct",async (req,res)=>{
    const { title, description, code, price, estatus, stock, category, thumbnails } = req.body;
    //Inicio de validaciones
    // Validar que todos los campos estén presentes
    if (
        !title || !description || !code || price === undefined || estatus === undefined ||
        stock === undefined || !category || !thumbnails
    ) {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    for (let [campo, valor] of Object.entries(camposString)) {
        if (typeof valor !== "string") {
            return res.status(400).json({ error: `El campo '${campo}' debe ser un string` });
        }
    }

    if (!isValidNumber(price)) {
        return res.status(400).json({ error: "El campo 'price' debe ser un número válido" });
    }

    if (!isValidNumber(stock)) {
        return res.status(400).json({ error: "El campo 'stock' debe ser un número válido" });
    }


    if (!isBoolean(estatus)) {
        return res.status(400).json({ error: "El campo 'estatus' debe ser booleano (true o false)" });
    }

    try {
        const productos = await ProductManager.getProducts();

        // Validación de código duplicado
        const existe = productos.find(p => p.code === code);
        if (existe) {
            res.setHeader("Content-Type", "application/json");
            return res.status(409).json({ error: `Ya existe un producto con el código: ${code}, ingresa un código diferente al nuevo producto` });
        }

        const nuevoProducto = await ProductManager.addProduct(
            title, description, code, price, estatus, stock, category, thumbnails
        );

        res.setHeader("Content-Type", "application/json");
        //realizar emit aqui, resolver que el socket esta en app
        /* req.socket.emit("nuevoProducto",nuevoProducto) */
        /* const productosActualizados = await ProductManager.getProducts(); */
        req.socket.emit("nuevoProducto",productosActualizados)
       /*  req.socket.emit("actualizarProductos",productos) */
        return res.status(200).json({
            payload: `Producto con código ${code} creado con éxito 😁!!`,
            nuevoProducto
        });
    } catch (error) {
        console.log(error);
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({ error: "Error interno del servidor" });
    }
})
module.exports=router
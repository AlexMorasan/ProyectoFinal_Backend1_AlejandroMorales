const{Router}=require("express")

const { ProductManager } = require("../dao/ProductManager")
ProductManager.path="./src/data/productos.json"

const router = Router()

const isValidNumber = value => typeof value === "number" && !isNaN(value);
const isBoolean = value => typeof value === "boolean";
const camposString = ["title","description","code","category"]

router.get("/", async (req,res)=>{
    try{
        let productos=await ProductManager.getProducts()
        
        res.send(productos)
    }
    catch(error){
        console.log(error)

        res.setHeader(`Content-Type`,`application/json`);
        return res.status(500).json({error:`Internal server error`})
    }
})

router.get("/:id",async (req,res)=>{
    try{
        let{id}= req.params
        let producto= await ProductManager.getProductById(id)
        if(!producto){
            res.setHeader(`Content-Type`,`application/json`);
            return res.status(400).json({error:`No existe un producto con ese id`}) 
        }
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json(producto);
    }
    catch(error){
        console.log(error)
        res.setHeader(`Content-Type`,`application/json`);
        return res.status(500).json({error:`Internal server error`})       
    }
})

router.post("/", async (req, res) => {
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
        const productosActualizados = await ProductManager.getProducts();
        req.socket.emit("nuevoProducto",productosActualizados)
        req.socket.emit("actualizarProductos",productos)
        return res.status(200).json({
            payload: `Producto con código ${code} creado con éxito 😁!!`,
            nuevoProducto
        });
    } catch (error) {
        console.log(error);
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});

router.delete("/:id",async (req,res)=>{
    try{
        let{id}= req.params
        let producto= await ProductManager.getProductById(id)
        if(!producto){
            res.setHeader(`Content-Type`,`application/json`);
            return res.status(400).json({error:`No existe un producto con ese id`}) 
        }
        await ProductManager.deleteProductById(id)
        return res.status(201).json({payload:`Producto con id ${id} eliminado con exito 😁!!`});
    }
    catch(error){
        console.log(error)
        res.setHeader(`Content-Type`,`application/json`);
        return res.status(500).json({error:`Internal server error`})       
    }
})


router.put("/:pid", async (req, res) => {
    try {
        const { pid } = req.params;
        const { price, stock, estatus, ...rest } = req.body;

        // Validaciones
        if (price !== undefined && !isValidNumber(price)) {
            return res.status(400).json({ error: "El campo 'price' debe ser un número válido" });
        }

        if (stock !== undefined && !isValidNumber(stock)) {
            return res.status(400).json({ error: "El campo 'stock' debe ser un número válido" });
        }

        if (estatus !== undefined && !isBoolean(estatus)) {
            return res.status(400).json({ error: "El campo 'estatus' debe ser booleano (true o false)" });
        }

        for (let campo of camposString) {
            if (req.body[campo] !== undefined && typeof req.body[campo] !== "string") {
            return res.status(400).json({ error: `El campo '${campo}' debe ser una cadena de caracteres` });
            }
        }       
        //Fin validaciones
        const updatedProduct = await ProductManager.updateProductById(pid, { price, stock, estatus, ...rest });

        return res.status(200).json({
            message: `Producto con id ${pid} actualizado correctamente`,
            producto: updatedProduct
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports={router}
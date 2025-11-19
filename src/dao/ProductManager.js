const fs=require("fs")
/* import { ProductModel } from "../models/Productschema" */
const ProductModel = require ("../models/Productschema")
class ProductManager{
    static path="./productos.json"

    static async addProduct(title,description,code,price,estatus,stock,category,thumbnails){
        let productos= await this.getProducts()

        let id=1
        if(productos.length>0){
            id=Math.max(...productos.map(d=>d.id))+1
        }

        let nuevoProducto ={
            id,
            title,
            description,
            code,
            price,
            estatus,
            stock,
            category,
            thumbnails
        }

        productos.push(nuevoProducto)
        await fs.promises.writeFile(this.path, JSON.stringify(productos,null,5))
        return nuevoProducto
    }

    static async getProducts(){
        if(fs.existsSync(this.path)){
            let products = JSON.parse(await fs.promises.readFile(this.path, "utf-8"))
            return products
        }else{
            return[]
        }
    }

    static async getProductById(id){
        let productos = await this.getProducts();
        return productos.find(p => p.id == +id);
    }
    
    static async deleteProductById(id){
        let productos = await this.getProducts()
        let productosActualizados = productos.filter(p=>p.id!=+id)
        await fs.promises.writeFile(this.path, JSON.stringify(productosActualizados,null,5))
    }

    static async updateProductById(id, data) {
    let productos = await this.getProducts();
    let index = productos.findIndex(p => p.id == +id);

    if (index == -1) {
        throw new Error(`No existe un producto con el id ${id}`);
    }

    if ("id" in data) {
        delete data.id;
    }

    productos[index] = { ...productos[index], ...data };

    await fs.promises.writeFile(this.path, JSON.stringify(productos,null,5))
    return productos[index];
}


}

module.exports={ProductManager}


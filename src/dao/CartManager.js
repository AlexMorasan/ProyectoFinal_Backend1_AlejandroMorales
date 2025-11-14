const fs=require("fs")
const {ProductManager} = require("./ProductManager");
class CartManager{
    static path="./carts.json"

    static async getCarts(){
        if(fs.existsSync(this.path)){
            let carts = JSON.parse(await fs.promises.readFile(this.path, "utf-8"))
            return carts
        }else{
            return[]
        }
    }

    static async createCart() {
        let carts = await this.getCarts();
        let id=1
        if(carts.length>0){
            id=Math.max(...carts.map(d=>d.id))+1
        }
        console.log(carts.length)
        console.log(id)
        let nuevoCarrito = {
            id,
            products: [],
         };
        carts.push(nuevoCarrito);
        await fs.promises.writeFile(this.path, JSON.stringify(carts,null,5))
        return nuevoCarrito;
  }

    static async getCartById(cid) {
        const carts = await this.getCarts();
        return carts.find(c => c.id == +cid);
    }

  static async addProductToCart(cid, pid) {
    let carts = await this.getCarts();
    let cart = carts.find(c => c.id == +cid);

    let productos = await ProductManager.getProducts();
    let productoExiste = productos.find(p => p.id == +pid);
    let codigo= productoExiste.code

    let item = cart.products.find(p => p.product === pid);
    if (item) {
      item.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1, code:codigo });
    }
    console.log(cart.products)
    await fs.promises.writeFile(this.path, JSON.stringify(carts,null,5))
    return cart;
  }

}
module.exports={CartManager}
const socket=io()
const list = document.getElementById(`product-list`)

socket.on(`actualizarProductos`,productos=>{
    productos.forEach(p => {
        const li=document.createElement(`li`)
        li.textContent=`${p.title} --- $${p.price}`
        list.appendChild(li)
    });
})
/* alert("hola") */
const socket=io()

const divTemperatura=document.getElementById("temperatura")

socket.on("saludo",(texto)=>{
    console.log(`El server dice : ${texto}`)
})

socket.on("nuevoProducto", products =>{
    /* alert(`Se ha creado un nuevo producto con id ${nuevoProducto.title}`) */
    divTemperatura.textContent=(`Prueba de sockets con nuevos productos ${products.length}`)
})
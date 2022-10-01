const hamburger=document.querySelector("#hamburger")
const navbar=document.querySelector(".navbar")
const navbarCenter=document.querySelector(".navbar-center")
const navbarRight=document.querySelector(".navbar-right")
const items=document.querySelectorAll(".item")
const card=document.querySelector(".card")
hamburger.addEventListener("click",()=>{
    navbar.classList.toggle("navbarOnclick")
    navbarCenter.classList.toggle("navbar-centerOnclick")
    navbarRight.classList.toggle("navbar-rightOnclick")
    card.classList.toggle("backward")
    for(let item of items){
        item.classList.toggle("itemsOnclick")
    }
      
    
})
window.addEventListener("resize",()=>{
    if(window.innerWidth>=500){
        navbar.classList.remove("navbarOnclick")
        navbarCenter.classList.remove("navbar-centerOnclick")
        navbarRight.classList.remove("navbar-rightOnclick")
        for(let item of items){
            item.classList.remove("itemsOnclick")
        }
        card.classList.remove("backward")
    }

})
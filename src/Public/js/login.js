const form = document.getElementById('loginForm')
console.log(document.cookie);

form.addEventListener('submit', async(event)=>{
    event.preventDefault();
    const data = new FormData(form);
    const  obj ={};
    data.forEach((value,key)=>(obj[key] = value));
    //Esto es con sessions 
    //const response = await fetch('/api/sessions/login', {
        //Esto con JWT
        const response = await fetch('/api/sessions/login', {
        method:'POST',
        body:JSON.stringify(obj),
        headers:{
            "Content-Type":"application/json"
        }
    });
    
    const responseText = await response.text();
    console.log(responseText); // Log the response text
    
    /*const responseData = JSON.parse(responseText);
    if(responseData.status === "success"){
        //Lo guardo en mi local Storage cuando uso JWT
        //console.log(responseData.accessToken);
       // localStorage.setItem('accessToken', responseData.accessToken);
        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Login Exitoso',
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            window.location.replace('/products');
          });
    }else{
        Swal.fire({
            position: 'top-end',
            icon: 'error',
            title: 'Usuario o contrasenia invalidos',
            showConfirmButton: false,
            timer: 1500
          });
    }*/
    
})
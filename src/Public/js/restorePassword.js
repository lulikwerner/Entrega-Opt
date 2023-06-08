const form = document.getElementById('restoreForm');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const data = new FormData(form);
  const obj = {};
  
  data.forEach((value, key) => {
    obj[key] = value;
  });
  
  try {
    const response = await fetch('/api/sessions/restorePassword', {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const responseText = await response.text();
    console.log('la respuesta',responseText); // Log the response text
    
    let responseData;
    
    
    if (responseText === 'OK')  {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'La contrasenia ha sido modificada exitosamente',
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        window.location.replace('/login');
      });
    } else {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'No puede ser igual a la contrasenia anterior',
        showConfirmButton: false,
        timer: 1500
      });
    }
  } catch (error) {
    console.error('Error submitting form:', error);
  }
});

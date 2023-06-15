/*console.log('Before fetching jwtProfile');
const jwt = localStorage.getItem('accessToken');
console.log('jwt', jwt);

if (!jwt) {
  window.location.replace('/login');
}

const headers = {
  "Authorization": `Bearer ${jwt}`
};

console.log('Headers:', headers);

fetch('/api/sessions/jwtProfile', {
  method: 'GET',
  headers: headers
})
  .then(response => response.json())
  .then((result) => {
    console.log(result);
    const welcome = document.getElementById('Welcome');
    const email = document.getElementById('email');
    welcome.innerHTML = `Hola, ${result.payload.name}`;
    email.innerHTML =`${result.payload.email}`;
  });
*/
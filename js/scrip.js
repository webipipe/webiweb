document.getElementById('login').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    
    function containsUppercase(str) {
        return /[A-Z]/.test(str);
    }

    if (username === 'webipipe' && password === 'webipipe12' && containsUppercase(password)) {
        window.location.href = 'index.html'; 
    } else {
        alert('Nombre de usuario o contraseña inválidos. La contraseña debe contener al menos una letra mayúscula.');
    }
});

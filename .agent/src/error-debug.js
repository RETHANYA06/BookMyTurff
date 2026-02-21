window.onerror = function (message, source, lineno, colno, error) {
    const debug = document.createElement('div');
    debug.style.position = 'fixed';
    debug.style.top = '0';
    debug.style.left = '0';
    debug.style.width = '100%';
    debug.style.height = '100%';
    debug.style.backgroundColor = 'white';
    debug.style.color = 'red';
    debug.style.padding = '50px';
    debug.style.zIndex = '10000';
    debug.style.overflow = 'auto';
    debug.innerHTML = `
        <h1>🚨 Browser Error Detected</h1>
        <p><b>Message:</b> ${message}</p>
        <p><b>Source:</b> ${source}</p>
        <p><b>Line:</b> ${lineno}:${colno}</p>
        <pre>${error ? error.stack : 'No stack trace available'}</pre>
        <button onclick="location.reload()" style="padding: 10px 20px; background: red; color: white; border: none; border-radius: 5px; cursor: pointer;">Reload Page</button>
    `;
    document.body.appendChild(debug);
};

console.error = (function (oldError) {
    return function (message) {
        oldError.apply(console, arguments);
        const debug = document.createElement('div');
        debug.style.position = 'fixed';
        debug.style.bottom = '0';
        debug.style.left = '0';
        debug.style.width = '100%';
        debug.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
        debug.style.color = 'darkred';
        debug.style.padding = '10px';
        debug.style.zIndex = '9999';
        debug.style.fontSize = '12px';
        debug.innerHTML = `<b>Console Error:</b> ${message}`;
        document.body.appendChild(debug);
    };
})(console.error);

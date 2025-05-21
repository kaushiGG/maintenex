
#!/bin/bash
# Install project dependencies
echo "Installing project dependencies..."

# Install Vite globally so it's available in PATH
npm install -g vite

# Install Vite and React plugin as dev dependencies for the project
npm install --save-dev vite@latest @vitejs/plugin-react@latest

# Install project dependencies
npm install

echo "Dependencies installed successfully!"

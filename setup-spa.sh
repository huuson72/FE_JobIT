#!/bin/bash

# Ensure _redirects file is copied to dist
echo "/* /index.html 200" > dist/_redirects

# Create a Vercel configuration if needed
mkdir -p .vercel
cat > .vercel/vercel.json << EOL
{
  "version": 2,
  "routes": [
    { "handle": "filesystem" },
    { "src": "/.*", "dest": "/index.html" }
  ]
}
EOL

echo "SPA routing configuration completed!" 
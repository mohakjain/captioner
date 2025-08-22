# Captioner

A React app for adding vintage movie-style captions to your images.

## 🚀 Deployment

This project is configured for GitHub Pages deployment.

### Automatic Deployment

The project will automatically deploy to GitHub Pages when you push to the `main` branch using GitHub Actions.

### Manual Deployment

You can also deploy manually using:

```bash
npm run deploy:manual
```

### Setup Instructions

1. **Create your GitHub repository** and push this code to it

2. **Update the homepage URL** in `package.json`:
   ```json
   "homepage": "https://yourusername.github.io/captioner"
   ```
   Replace `yourusername` with your actual GitHub username.

3. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Set Source to "GitHub Actions"

4. **Push to main branch** and the app will automatically deploy!

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## 📁 Project Structure

- `src/components/` - React components
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript type definitions
- `public/` - Static assets
- `.github/workflows/` - GitHub Actions deployment workflow

## 🧪 Testing

The project includes comprehensive tests. Run them with:

```bash
npm run test        # Run once
npm run test:watch  # Watch mode
```

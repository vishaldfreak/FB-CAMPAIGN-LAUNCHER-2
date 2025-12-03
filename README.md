# Facebook Campaign Launcher

A web application for launching and managing Facebook advertising campaigns.

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn package manager
- Git

### Setup on This Machine

1. Clone the repository (if not already done):
   ```bash
   git clone <your-repo-url>
   cd "Facebook Campaign Launcher"
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file with your configuration:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

### Setup on Another Machine

To work on this project from another machine using Cursor:

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd "Facebook Campaign Launcher"
   ```

2. **Open in Cursor:**
   - Open Cursor IDE
   - File → Open Folder → Select the "Facebook Campaign Launcher" directory

3. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

4. **Set up environment variables:**
   - Copy `.env.example` to `.env` (if it exists)
   - Add your local configuration

5. **Start developing:**
   - Make your changes
   - Commit: `git add . && git commit -m "Your message"`
   - Push: `git push`
   - Pull on other machines: `git pull`

## Working with Git Across Multiple Machines

### Daily Workflow

1. **Before starting work:**
   ```bash
   git pull
   ```

2. **After making changes:**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

3. **On other machines:**
   ```bash
   git pull
   ```

### Branching (Optional)

For feature development:
```bash
git checkout -b feature/your-feature-name
# Make changes
git add .
git commit -m "Add feature"
git push -u origin feature/your-feature-name
```

## Project Structure

```
Facebook Campaign Launcher/
├── .gitignore
├── README.md
└── (your project files will go here)
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Commit with descriptive messages
4. Push to the remote repository
5. Create a pull request (if using GitHub/GitLab)

## License

[Add your license here]


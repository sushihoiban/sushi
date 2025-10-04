# GEMINI.md

## Project Overview

This is a web application built with Vite, React, and TypeScript. It uses shadcn-ui for components and Tailwind CSS for styling. The backend is powered by Supabase.

The project is a restaurant-themed application, likely for a sushi restaurant, given the project name and some of the image assets. It includes features like a menu, booking, and user authentication.

## Building and Running

To get the project up and running, follow these steps:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    This will start the development server, and you can view the application in your browser at `http://localhost:8080`.

3.  **Build for Production:**
    ```bash
    npm run build
    ```
    This will create a `dist` directory with the production-ready files.

4.  **Linting:**
    ```bash
    npm run lint
    ```
    This will run the linter to check for any code quality issues.

## Development Conventions

*   **Styling:** The project uses Tailwind CSS for styling. You can find the configuration in `tailwind.config.ts`. It also uses CSS variables for colors, border radius, and other theme-related properties.
*   **Components:** The project uses shadcn-ui for its component library. The components are located in `src/components/ui`.
*   **State Management:** The project uses `@tanstack/react-query` for server-side state management.
*   **Routing:** The project uses `react-router-dom` for routing. The routes are defined in `src/App.tsx`.
*   **Type Checking:** The project uses TypeScript. The main `tsconfig.json` file is in the root directory, and it references `tsconfig.app.json` and `tsconfig.node.json`.
*   **Path Aliases:** The project uses path aliases to simplify imports. The `@/*` alias points to the `src` directory. This is configured in `tsconfig.json` and `vite.config.ts`.
*   **Backend:** The project uses Supabase for its backend. The Supabase client is initialized in `src/integrations/supabase/client.ts`.

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'


export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build', // Specify the desired output directory
    emptyOutDir: true, // Optional: Clears the output directory before building
  },
});
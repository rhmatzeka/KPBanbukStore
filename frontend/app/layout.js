import '../src/index.css';
import '../src/App.css';

export const metadata = {
  title: 'Inventaris Gudang',
  description: 'Aplikasi inventaris gudang berbasis Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

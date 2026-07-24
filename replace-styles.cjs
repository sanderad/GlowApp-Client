const fs = require('fs');

const files = [
  'src/components/BottomNav.vue',
  'src/components/StylistCard.vue',
  'src/stores/stylist.store.ts',
  'src/views/AdminView.vue',
  'src/views/HomeView.vue',
  'src/views/FavoritosView.vue',
  'src/views/PerfilView.vue',
  'src/views/ChatDetailView.vue',
  'src/views/PrivacyView.vue',
  'src/views/auth/LoginView.vue',
  'src/views/auth/StylistRegisterView.vue',
  'src/views/auth/ClientRegisterView.vue',
  'src/views/EditProfileView.vue',
  'src/views/HelpSupportView.vue',
  'src/views/ChatsView.vue',
  'src/views/StylistDetailView.vue'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Text gradients
  content = content.replace(/text-transparent\s+bg-clip-text\s+bg-gradient-to-r\s+from-pink-\d+\s+via-purple-\d+\s+to-indigo-\d+/g, 'text-black');

  // Background gradients
  content = content.replace(/from-pink-\d+\s+to-rose-\d+/g, 'from-gray-900 to-black');
  content = content.replace(/from-purple-\d+\s+to-indigo-\d+/g, 'from-gray-800 to-gray-900');
  content = content.replace(/from-fuchsia-\d+\s+to-pink-\d+/g, 'from-gray-700 to-gray-800');

  // Text colors
  content = content.replace(/text-(purple|pink|rose|fuchsia|indigo)-(400|500|600|700|800|900)/g, 'text-black');
  content = content.replace(/text-(purple|pink|rose|fuchsia|indigo)-(50|100|200|300)/g, 'text-gray-500');

  // Background colors
  content = content.replace(/bg-(purple|pink|rose|fuchsia|indigo)-(400|500|600|700|800|900)/g, 'bg-black');
  content = content.replace(/bg-(purple|pink|rose|fuchsia|indigo)-(50|100|200|300)/g, 'bg-gray-100');

  // Border colors
  content = content.replace(/border-(purple|pink|rose|fuchsia|indigo)-(400|500|600|700|800|900)/g, 'border-black');
  content = content.replace(/border-(purple|pink|rose|fuchsia|indigo)-(50|100|200|300)/g, 'border-gray-200');

  // Shadow colors
  content = content.replace(/shadow-(purple|pink|rose|fuchsia|indigo)-\d+/g, 'shadow-gray-200');

  // Rings
  content = content.replace(/ring-(purple|pink|rose|fuchsia|indigo)-\d+/g, 'ring-black');

  // Hover/Focus/Active modifiers for the above
  content = content.replace(/focus-within:ring-(purple|pink|rose|fuchsia|indigo)-\d+/g, 'focus-within:ring-black');

  fs.writeFileSync(file, content, 'utf8');
});
console.log('Second pass processed');
